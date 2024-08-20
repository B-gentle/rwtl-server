const asyncHandler = require("express-async-handler");
const Transaction = require("../models/transactionModel");
const JoenatechDataPlan = require("../models/joenatechMTNDataModel");
const axios = require("axios");
const User = require("../models/userModel");
const Package = require("../models/packageModel");
const DataPlan = require("../models/dataPlansModel");
const {
  payUplines,
  payUtilityUplines,
} = require("../utilities/transactionPayUpline");
const JoenatechCablePlan = require("../models/geoDnaCableTvModel");

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1; // Adding 1 to get a 1-based month
const currentHour = currentDate.getHours();
const currentMinutes = currentDate.getMinutes();

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.find({
      $or: [
        {
          user: userId,
        },
        {
          recipient: req.user.username,
        },
      ],
    }).sort({
      createdAt: -1,
    });

    if (transactions) {
      res.status(200).json({
        data: transactions,
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const sendMoney = asyncHandler(async (req, res) => {
  const { username, amount } = req.body;

  try {
    const currentUser = await User.findById(req.user.id);
    const receiver = await User.findOne({
      username,
    });
    if (!receiver) {
      return res.status(400).json({
        message: "incorrect username",
      });
    }

    if (!amount || !username) {
      return res.status(400).json({
        message: "Please fill in all field",
      });
    }

    if (amount <= 0) {
      res.status(400);
      throw new Error("please enter a valid amount");
    }

    if (currentUser.walletBalance < amount) {
      res.status(400);
      throw new Error("insufficient funds");
    }

    if (currentUser.username === receiver.username) {
      res.status(400);
      throw new Error("please  enter a valid username");
    }

    currentUser.walletBalance -= Number(amount);
    receiver.walletBalance += Number(amount);
    await currentUser.save();
    await receiver.save();

    const transactionId =
      currentUser.username +
      `${currentYear}${currentMonth}${currentHour}${currentMinutes}`;
    const transaction = new Transaction({
      transactionId,
      transactionType: "fundTransfer",
      user: req.user.id,
      sender: req.user.username,
      recipient: receiver.username,
      receiverNewWalletBalance: receiver.walletBalance,
      receiverPrevWalletBalance: (receiver.walletBalance -= Number(amount)),
      senderNewWalletBalance: currentUser.walletBalance,
      senderPrevWalletBalance: (currentUser.walletBalance += Number(amount)),
      amount,
      status: "successful",
    });
    await transaction.save();
    return res.status(200).json({
      message: "Transfer successful",
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

const fundWallet = asyncHandler(async (req, res) => {
  res.header("Content-Type", "application/json");
  res.header("x-auth-signature", process.env.X_AUTH_SIGNATURE);

  const {
    sessionId,
    accountNumber,
    transactionAmount,
    tranRemarks,
    settledAmount,
    feeAmount,
    vatAmount,
    currency,
    settlementId,
    sourceAccountNumber,
    sourceAccountName,
    sourceBankName,
    channelId,
    tranDateTime,
  } = req.body;

  try {
    const expectedSignature = process.env.X_AUTH_SIGNATURE;
    const receivedSignature = req.headers["x-auth-signature"];

    if (
      !receivedSignature ||
      receivedSignature.toLowerCase() !== expectedSignature.toLowerCase()
    ) {
      return res.status(200).json({
        requestSuccessful: true,
        sessionId,
        responseMessage: "rejected transaction",
        responseCode: "02",
      });
    }

    if (
      !sessionId ||
      !accountNumber ||
      !transactionAmount ||
      !settledAmount ||
      !settlementId ||
      !tranDateTime
    ) {
      return res.status(200).json({
        requestSuccessful: true,
        sessionId,
        responseMessage: "rejected transaction",
        responseCode: "02",
      });
    }

    if (transactionAmount <= 0) {
      res.status(400);
      throw new Error("please enter a valid amount");
    }

    const currentUser = await User.findOne({
      staticAccount: accountNumber,
    });

    const transactionExist = await Transaction.findOne({
      transactionId: settlementId,
    });

    if (!currentUser) {
      return res.status(200).json({
        requestSuccessful: true,
        sessionId,
        responseMessage: "rejected transaction",
        responseCode: "02",
      });
    }

    if (transactionExist) {
      return res.status(200).json({
        requestSuccessful: true,
        sessionId,
        responseMessage: "duplicate transaction",
        responseCode: "01",
      });
    }

    let charges;
    if (transactionAmount < 10000) {
      charges = 30;
    } else if (transactionAmount >= 10000) {
      charges = 70;
    }
    currentUser.walletBalance += Number(transactionAmount - charges);
    console.log(currentUser.walletBalance);
    await currentUser.save();

    const transaction = new Transaction({
      transactionId: settlementId,
      transactionType: "walletFunding",
      user: currentUser._id,
      newWalletBalance: currentUser.walletBalance,
      prevWalletBalance: (currentUser.walletBalance -= Number(
        transactionAmount - charges
      )),
      amount: transactionAmount - charges,
      charges,
      status: "successful",
    });
    await transaction.save();
    return res.status(200).json({
      requestSuccessful: true,
      sessionId,
      responseMessage: "success",
      responseCode: "00",
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

const transferCommission = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  try {
    const currentUser = await User.findById(req.user.id);

    if (currentUser.withdrawableCommission < amount) {
      res.status(400);
      throw new Error("insufficient funds");
    }

    if (amount <= 0) {
      res.status(400);
      throw new Error("please enter a valid amount");
    }
    currentUser.withdrawableCommission -= Number(amount);
    currentUser.walletBalance += Number(amount);

    await currentUser.save();

    const transactionId =
      currentUser.username +
      `${currentYear}${currentMonth}${currentHour}${currentMinutes}`;
    const transaction = new Transaction({
      transactionId,
      transactionType: "commissionTransfer",
      prevCommissionBalance:
        currentUser.withdrawableCommission + Number(amount),
      newCommissionBalance: currentUser.withdrawableCommission,
      prevWalletBalance: currentUser.walletBalance - Number(amount),
      newWalletBalance: currentUser.walletBalance,
      user: req.user._id,
      amount,
      status: "successful",
    });
    await transaction.save();
    return res.status(200).json({
      message: "Transfer successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500);
    throw new Error("Transaction failed");
  }
});

const purchaseAirtime = asyncHandler(async (req, res) => {
  const { network, phoneNumber, amount } = req.body;

  // Check if required data is provided
  if (!network || !phoneNumber || !amount) {
    return res.status(400).json({
      message: "Please provide all the required fields",
    });
  }

  // Define the discount rates for each mobile network
  const discountRates = {
    1: 2, // MTN @ 2%
    2: 4, // Glo @ 4%
    4: 2, // Airtel @ 2%
    3: 2, // 9mobile @ 2%
  };

  // Check if the provided mobile network is valid
  if (!discountRates.hasOwnProperty(network)) {
    return res.status(400).json({
      message: "Invalid mobile network code",
    });
  }

  const currentUser = await User.findById(req.user.id).populate("package");

  // Check if the user has sufficient balance in their wallet
  if (currentUser.walletBalance < amount) {
    return res.status(400).json({
      message: "Insufficient wallet balance",
    });
  }

  // Calculate the bonus amount based on the discount rate
  const discountRate = discountRates[network];
  const userCommission = (amount * (discountRate / 100)).toFixed(2);
  const transactionId =
    req.user.username +
    `${currentYear}${currentMonth}${currentHour}${currentMinutes}`;

  // Make the API call to purchase airtime
  try {
    const response = await axios.post(
      `${process.env.GEODNA}/topup/`,
      {
        network,
        amount,
        mobile_number: phoneNumber,
        Ported_number: true,
        airtime_type: "VTU",
      },
      {
        headers: {
          Authorization: process.env.GEODNA_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
    // // Check if the airtime purchase was successful
    if (response.data.Status === "successful") {
      // Deduct the purchase amount from the user's wallet balance
      currentUser.walletBalance -= Number(amount);
      // Add the bonus amount to the user's balance
      currentUser.commissionBalance += parseFloat(userCommission);
      currentUser.withdrawableCommission += parseFloat(userCommission);
      await currentUser.save();

      // Create a new transaction object
      const transaction = new Transaction({
        transactionId,
        transactionType: "airtime",
        status: "successful",
        commission: parseFloat(userCommission),
        network,
        phoneNumber,
        prevWalletBalance: currentUser.walletBalance + Number(amount),
        newWalletBalance: currentUser.walletBalance,
        prevCommissionBalance:
          currentUser.withdrawableCommission - parseFloat(userCommission),
        newCommissionBalance: currentUser.withdrawableCommission,
        amount,
        user: req.user._id,
      });

      // Save the transaction object
      await transaction.save();

      // Calculate and pay uplines based on package levels and percentages
      payUplines(
        currentUser.upline.ID,
        amount,
        transactionId,
        network,
        phoneNumber,
        2
      );
      return res.status(200).json({
        message: `Purchase of N${amount} airtime to ${phoneNumber} from RWT was succesful`,
        userCommission,
      });
    } else {
      // Return error response if the airtime purchase failed
      return res.status(400).json({
        message: response.data.status,
      });
    }
  } catch (error) {
    let message =
      error.response &&
      error.response.data &&
      error.response.data &&
      error.response.data.error;
    if (
      message.toString().includes("You can't topup due to insufficient balance")
    ) {
      message = "Purchase Failure, contact Admin for help!";
    }

    res.status(500);
    throw new Error(message.toString());
  }
});

const purchaseData = async (req, res) => {
  const { network, phoneNumber, amount, networkPlan } = req.body;

  if (!network || !phoneNumber || !networkPlan) {
    return res.status(400).json({
      message: "Please provide all the required fields",
    });
  }

  const transactionId =
    req.user.username +
    `${currentYear}${currentMonth}${currentHour}${currentMinutes}`;

  const currentUser = await User.findById(req.user.id).populate("package");
  if (currentUser.walletBalance < amount) {
    return res.status(400).json({
      message: "Insufficient wallet balance",
    });
  }
  const selectedNetwork = await JoenatechDataPlan.find({
    networkId: network,
  });
  const selectedPlan = selectedNetwork[0].plans.find(
    (plan) => plan.PRODUCT_AMOUNT === Number(amount - 5)
  );
  const profit = Number(amount) - Number(selectedPlan.planAmount);
  const userCommission = 0.02 * amount;
  try {
    const response = await axios.post(
      `${process.env.GEODNA}/data/`,
      {
        network: network,
        mobile_number: phoneNumber,
        plan: networkPlan,
        Ported_number: true,
      },
      {
        headers: {
          Authorization: process.env.GEODNA_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
    // check if the call was successful
    if (response.data.Status === "successful") {
      //  Deduct the purchase amount from the user's wallet balance
      currentUser.walletBalance -= Number(amount);
      // Add the bonus amount to the user's balance
      currentUser.commissionBalance += parseFloat(userCommission);
      currentUser.withdrawableCommission += parseFloat(userCommission);
      await currentUser.save();

      // create new transaction object
      const transaction = new Transaction({
        transactionId,
        transactionType: "data",
        status: "successful",
        commission: parseFloat(userCommission),
        network,
        phoneNumber,
        prevWalletBalance: currentUser.walletBalance + Number(amount),
        newWalletBalance: currentUser.walletBalance,
        prevCommissionBalance:
          currentUser.withdrawableCommission - parseFloat(userCommission),
        newCommissionBalance: currentUser.withdrawableCommission,
        amount,
        user: req.user._id,
      });

      // Save the transaction object
      await transaction.save();

      // Calculate and pay uplines based on package levels and percentages
      payUplines(
        currentUser.upline.ID,
        amount,
        transactionId,
        network,
        phoneNumber,
        5
      );
      res.status(200).json({
        message: response.data.api_response,
      });
    } else {
      res.status(400).json({
        message: "Purchase not succesful, please try again",
      });
    }
  } catch (error) {
    const message =
      error &&
      error.response &&
      error.response.data &&
      error.response.data.error.toString();
    res.status(404).json({
      message: "Purchase Failed! please try again",
    });
  }
};

const cableBills = asyncHandler(async (req, res) => {
  const { cableNetwork, number, amount, package } = req.body;

  const selectedPlan = await JoenatechCablePlan.find({ cableplanID: package });
  if (amount !== selectedPlan[0].cableplanAmount) {
    res.status(400);
    throw new Error("Fraudulent Transaction, kindly input accurate amount");
  }
  // Check if required data is provided
  if (!cableNetwork || !number || !package) {
    res.status(400);
    throw new Error("Please provide all the required fields");
  }

  // Define the profit for each cable provider
  // const profit = Number(amount) * (0.80 / 100)
  const charges = 100;
  const totalDebit = charges + Number(amount);

  const currentUser = await User.findById(req.user.id).populate("package");

  // Check if the user has sufficient balance in their wallet
  if (currentUser.walletBalance < totalDebit) {
    return res.status(400).json({
      message: "Insufficient wallet balance",
    });
  }

  // Calculate the bonus amount based on the profit
  const userCommission = 20;
  const transactionId =
    req.user.username +
    `${currentYear}${currentMonth}${currentHour}${currentMinutes}`;

  // Make the API call to purchase data
  try {
    const response = await axios.post(
      `${process.env.GEODNA}/cablesub/`,
      {
        cablename: selectedPlan[0].cableID,
        cableplan: package,
        smart_card_number: number,
      },
      {
        headers: {
          Authorization: process.env.GEODNA_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
    // Check if the data purchase was successful
    if (response.data.Status === "successful") {
      // Deduct the purchase amount from the user's wallet balance
      currentUser.walletBalance -= totalDebit;
      // Add the bonus amount to the user's balance
      currentUser.commissionBalance += userCommission;
      currentUser.withdrawableCommission += userCommission;
      await currentUser.save();

      // Create a new transaction object
      const transaction = new Transaction({
        transactionId,
        transactionType: "cableTv",
        status: "successful",
        commission: userCommission,
        cableCompany: cableNetwork,
        IUC: number,
        prevWalletBalance: currentUser.walletBalance + totalDebit,
        newWalletBalance: currentUser.walletBalance,
        prevCommissionBalance:
          currentUser.withdrawableCommission - userCommission,
        newCommissionBalance: currentUser.withdrawableCommission,
        amount,
        user: req.user._id,
      });

      // Save the transaction object
      await transaction.save();

      //database transaction - learn it.

      // Calculate and pay uplines based on package levels and percentages
      payUtilityUplines(
        currentUser.upline.ID,
        amount,
        transactionId,
        number,
        cableNetwork,
        2,
        "cable"
      );

      return res.status(200).json({
        message: "Cable Bill Paid",
        userCommission,
      });
    } else {
      // Return error response if the data purchase failed
      return res.status(400).json({
        message: response.data.status,
      });
    }
  } catch (error) {
    console.log(error.response.data);
    let message = error.response.data.error || error.response.data.cableName;
    if (
      message.toString().includes("You can't topup due to insufficient balance")
    ) {
      message = "Subscribtion failed, please contact Admin!";
    }
    return res.status(500).json({
      message,
    });
  }
});

const getCableOwner = asyncHandler(async (req, res) => {
  const { cableNetwork, iuc } = req.query;
  if (!iuc) {
    res.status(404);
    throw new Error("No IUC Number entered");
  }

  const response = await axios.get(`${process.env.GEODNA}/validateiuc`, {
    params: {
      cablename: cableNetwork,
      smart_card_number: iuc,
    },
    headers: {
      Authorization: process.env.GEODNA_TOKEN,
      "Content-Type": "application/json",
    },
  });
  if (response.data.invalid === false) {
    return res.status(200).json(response.data.name);
  } else {
    return res.status(400).json({
      message: response.data.name,
    });
  }
});

const verifyMeter = asyncHandler(async (req, res) => {
  const { electricCompany, meternumber, metertype } = req.query;
  if (!meternumber || !electricCompany || !metertype) {
    res.status(404);
    throw new Error("Please provide meternumber");
  }
  const response = await axios.get(`${process.env.GEODNA}/validatemeter`, {
    params: {
      meternumber,
      disconame: electricCompany,
      mtype: metertype,
    },
    headers: {
      Authorization: process.env.GEODNA_TOKEN,
      "Content-Type": "application/json",
    },
  }); 

  if (response.data.invalid === false) {
    return res.status(200).json(response.data.name);
  } else {
    return res.status(400).json({
      message: response.data.name,
    });
  }
});

const electricityBills = async (req, res) => {
  const { electricCompany, MeterType, amount, meterNo } = req.body;

  // Check if required data is provided
  if (!electricCompany || !meterNo || !MeterType) {
    return res.status(400).json({
      message: "Please provide all the required fields",
    });
  }

  // Define the profit for each mobile network
  // const profit = Number(amount) * (0.40 / 100)
  const charges = 100;
  const totalDebit = charges + Number(amount);

  const currentUser = await User.findById(req.user.id).populate("package");

  // Check if the user has sufficient balance in their wallet
  if (currentUser.walletBalance < totalDebit) {
    return res.status(400).json({
      message: "Insufficient wallet balance",
    });
  }

  // Calculate the bonus amount based on the profit
  // const bonusAmount = (profit * 0.4).toFixed(2);
  const userCommission = 20;
  const transactionId =
    req.user.username +
    `${currentYear}${currentMonth}${currentHour}${currentMinutes}`;

  // Make the API call to purchase data
  try {
    const response = await axios.post(
      `${process.env.GEODNA}/billpayment`,
      {
        disco_name: electricCompany,
        amount,
        meter_number: meterNo,
        MeterType,
      },
      {
        headers: {
          Authorization: process.env.GEODNA_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response)
    console.log(response.data)
    console.log(response.data.results)
    // Check if the data purchase was successful
    if (response.data.Status === "successful") {
      // Deduct the purchase amount from the user's wallet balance
      currentUser.walletBalance -= totalDebit;
      // Add the bonus amount to the user's balance
      currentUser.commissionBalance += userCommission;
      currentUser.withdrawableCommission += userCommission;
      await currentUser.save();

      // Create a new transaction object
      const transaction = new Transaction({
        transactionId,
        transactionType: "electricity",
        status: "successful",
        commission: userCommission,
        electricCompany: electricCompany,
        meterNo: meterNo,
        prevWalletBalance: currentUser.walletBalance + totalDebit,
        newWalletBalance: currentUser.walletBalance,
        prevCommissionBalance:
          currentUser.withdrawableCommission - userCommission,
        newCommissionBalance: currentUser.withdrawableCommission,
        amount,
        user: req.user._id,
      });

      // Save the transaction object
      await transaction.save();

      //database transaction - learn it.

      // Calculate and pay uplines based on package levels and percentages
      payUtilityUplines(
        currentUser.upline.ID,
        amount,
        transactionId,
        meterNo,
        electricCompany,
        "electricity"
      );

      return res.status(200).json({
        message: "Electric Bill Paid",
        userCommission,
      });
    } else {
      console.log(response)
      // Return error response if the data purchase failed
      return res.status(400).json({
        message: response.data.status,
      });
    }
  } catch (error) {
    console.log(error.response.data);
    let message = error.response.data.error;
    if (
      message.toString().includes("You can't topup due to insufficient balance")
    ) {
      message = "Subscribtion failed, please contact Admin!";
    }
    return res.status(500).json({
      message,
    });
  }
};

const getExamType = asyncHandler(async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.CLUB_KONNECT_URl}/APIWAECPackagesV2.asp`
    );

    return res.status(200).json(response.data.EXAM_TYPE);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

const buyWaecEpin = async (req, res) => {
  const { ExamType, PhoneNo } = req.body;

  // Check if required data is provided
  if (!ExamType) {
    return res.status(400).json({
      message: "Please select Exam Type",
    });
  }

  const findAmount = await axios.get(
    `${process.env.CLUB_KONNECT_URl}/APIWAECPackagesV2.asp`
  );
  const result = findAmount.data.EXAM_TYPE;
  const selected = result.find((exam) => exam.PRODUCT_CODE === ExamType);
  const amount = selected.PRODUCT_AMOUNT;
  const charges = 100;
  const totalDebit = charges + Number(amount);

  try {
    const currentUser = await User.findById(req.user.id).populate("package");

    // Check if the user has sufficient balance in their wallet
    if (currentUser.walletBalance < totalDebit) {
      return res.status(400).json({
        message: "Insufficient wallet balance",
      });
    }

    // Calculate the bonus amount based on the profit
    const userCommission = 20;
    const transactionId =
      req.user.username +
      `${currentYear}${currentMonth}${currentHour}${currentMinutes}`;

    // Make the API call to purchase data
    try {
      const response = await axios.get(
        `${process.env.CLUB_KONNECT_URl}/APIWAECV1.asp`,
        {
          params: {
            UserID: process.env.CLUB_KONNECT_USER_ID,
            APIKey: process.env.CLUB_KONNECT_API_KEY,
            ExamType,
            PhoneNo,
            RequestID: transactionId,
            CallBackURL: "https://myrechargewise.com/waec",
          },
        }
      );

      // Check if the data purchase was successful
      if (response.data.status === "ORDER_RECEIVED") {
        // Deduct the purchase amount from the user's wallet balance
        currentUser.walletBalance -= totalDebit;
        // Add the bonus amount to the user's balance
        currentUser.commissionBalance += userCommission;
        currentUser.withdrawableCommission += userCommission;
        await currentUser.save();

        // Create a new transaction object
        const transaction = new Transaction({
          transactionId,
          transactionType: "exams",
          status: "successful",
          commission: userCommission,
          ExamType,
          prevWalletBalance: currentUser.walletBalance + totalDebit,
          newWalletBalance: currentUser.walletBalance,
          prevCommissionBalance:
            currentUser.withdrawableCommission - userCommission,
          newCommissionBalance: currentUser.withdrawableCommission,
          amount,
          user: req.user._id,
        });

        // Save the transaction object
        await transaction.save();

        //database transaction - learn it.

        // Calculate and pay uplines based on package levels and percentages
        payUtilityUplines(
          currentUser.upline.ID,
          amount,
          transactionId,
          "-",
          "-",
          "exams"
        );

        return res.status(200).json({
          message: "Waec Pin Purchased",
          userCommission,
        });
      } else {
        // Return error response if the data purchase failed
        return res.status(400).json({
          message: response.data.status,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

module.exports = {
  purchaseAirtime,
  sendMoney,
  fundWallet,
  getTransactions,
  purchaseData,
  cableBills,
  getCableOwner,
  verifyMeter,
  electricityBills,
  transferCommission,
  getExamType,
  buyWaecEpin,
};

//https://www.nellobytesystems.com/APIJAMBV1.asp?UserID=your_userid&APIKey=your_apikey&ExamType=exam_code&PhoneNo=recipient_phoneno&RequestID=request_id&CallBackURL=callback_url
