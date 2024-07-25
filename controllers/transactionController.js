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

const purchaseAirtime = async (req, res) => {
  const { network, phoneNumber, amount } = req.body;

  try {
    // Check if required data is provided
    if (!network || !phoneNumber) {
      return res.status(400).json({
        message: "Please provide all the required fields",
      });
    }

    // Define the discount rates for each mobile network
    const discountRates = {
      "01": 2, // MTN @ 3.5%
      "02": 4, // Glo @ 8%
      "04": 2, // Airtel @ 3.5%
      "03": 4, // 9mobile @ 6.5%
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
      const response = await axios.get(
        "https://www.nellobytesystems.com/APIAirtimeV1.asp",
        {
          params: {
            UserID: process.env.CLUB_KONNECT_USER_ID,
            APIKey: process.env.CLUB_KONNECT_API_KEY,
            MobileNetwork: network,
            Amount: amount,
            MobileNumber: phoneNumber,
            RequestID: transactionId,
            CallBackURL: "https;//localhost:5000/",
          },
        }
      );

      // Check if the airtime purchase was successful
      if (response.data.statuscode === "100") {
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
          phoneNumber
        );

        return res.status(200).json({
          message: "Airtime purchase successful",
          userCommission,
        });
      } else {
        // Return error response if the airtime purchase failed
        return res.status(400).json({
          message: response.data.status,
        });
      }
    } catch (error) {
      res.status(500);
      throw new Error(error.message);
    }
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
};

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

  if (network === "01" || network === "04") {
    const selectedNetwork = await JoenatechDataPlan.find({
      networkId: 1,
    });
    const selectedPlan = selectedNetwork[0].plans.find(
      (plan) => plan.PRODUCT_AMOUNT === Number(amount - 5)
    );
    const profit = Number(amount) - Number(selectedPlan.planAmount);
    const userCommission = 0.02 * amount;
    try {
      const response = await axios.post(
        "https://geodnatechsub.com/api/data/",
        {
          network: network,
          mobile_number: phoneNumber,
          plan: networkPlan,
          Ported_number: true,
        },
        {
          headers: {
            Authorization: "Token 3e3a1f01d011d2f56d9ecd364ce4e002c1f2a0a6",
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
          phoneNumber
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
        message: message,
      });
    }
  } else {
    try {
      const discountRates = {
        "01": 2, // MTN @ 3.5%
        "02": 4, // Glo @ 8%
        "04": 2, // Airtel @ 3.5%
        "03": 4, // 9mobile @ 6.5%
      };

      //     // Check if the provided mobile network is valid
      if (!discountRates.hasOwnProperty(network)) {
        return res.status(400).json({
          message: "Invalid mobile network code",
        });
      }

      // Calculate the bonus amount based on the discount rate
      const discountRate = discountRates[network];
      const userCommission = (amount * (discountRate / 100)).toFixed(2);

      const response = await axios.get(
        "https://www.nellobytesystems.com/APIDatabundleV1.asp",
        {
          params: {
            UserID: process.env.CLUB_KONNECT_USER_ID,
            APIKey: process.env.CLUB_KONNECT_API_KEY,
            MobileNetwork: network,
            DataPlan: networkPlan,
            MobileNumber: phoneNumber,
            RequestID: transactionId,
            CallBackURL: "https://localhost:5000/",
          },
        }
      );

      //         // Check if the data purchase was successful
      if (response.data.statuscode === "100") {
        // Deduct the purchase amount from the user's wallet balance
        currentUser.walletBalance -= Number(amount);
        // Add the bonus amount to the user's balance
        currentUser.commissionBalance += parseFloat(userCommission);
        currentUser.withdrawableCommission += parseFloat(userCommission);
        await currentUser.save();

        //  Create a new transaction object
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

        //  Calculate and pay uplines based on package levels and percentages
        payUplines(
          currentUser.upline.ID,
          amount,
          transactionId,
          network,
          phoneNumber
        );

        return res.status(200).json({
          message: "Data purchase successful",
          userCommission,
        });
      } else {
        // Return error response if the data purchase failed
        //database transaction - learn it.
        return res.status(400).json({
          message: response.data.status,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  }
};

const cableBills = async (req, res) => {
  const { cableNetwork, number, amount, package } = req.body;

  try {
    // Check if required data is provided
    if (!cableNetwork || !number || !package) {
      return res.status(400).json({
        message: "Please provide all the required fields",
      });
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
      const response = await axios.get(
        "https://www.nellobytesystems.com/APICableTVV1.asp",
        {
          params: {
            UserID: process.env.CLUB_KONNECT_USER_ID,
            APIKey: process.env.CLUB_KONNECT_API_KEY,
            CableTV: cableNetwork,
            Package: package,
            SmartCardNo: number,
            PhoneNo: currentUser.phoneNo,
            RequestID: transactionId,
            CallBackURL: "https://localhost:5000/",
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

const getCableOwner = asyncHandler(async (req, res) => {
  const { cableNetwork, iuc } = req.body;

  if (!iuc) {
    res.status(404);
    throw new Error("No IUC Number entered");
  }

  const response = await axios.get(
    `${process.env.CLUB_KONNECT_URl}/APIVerifyCableTVV1.0.asp`,
    {
      params: {
        UserID: process.env.CLUB_KONNECT_USER_ID,
        APIKey: process.env.CLUB_KONNECT_API_KEY,
        CableTV: cableNetwork,
        SmartCardNo: iuc,
        CallBackURL: "https://localhost:5000/",
      },
    }
  );

  if (response.data.status === "00") {
    return res.status(200).json(response.data.customer_name);
  } else {
    return res.status(400).json({
      message: response.data.status,
    });
  }
});

const electricityBills = async (req, res) => {
  const { ElectricCompany, MeterType, amount, MeterNo } = req.body;

  // Check if required data is provided
  if (!ElectricCompany || !MeterNo || !MeterType) {
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
    const response = await axios.get(
      "https://www.nellobytesystems.com/APIElectricityV1.asp",
      {
        params: {
          UserID: process.env.CLUB_KONNECT_USER_ID,
          APIKey: process.env.CLUB_KONNECT_API_KEY,
          ElectricCompany,
          MeterType,
          MeterNo,
          PhoneNo: currentUser.phoneNo,
          RequestID: transactionId,
          CallBackURL: "https://localhost:5000/",
        },
      }
    );

    // Check if the data purchase was successful
    if (response.data.statuscode === "ORDER_RECEIVED") {
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
        electricCompany: ElectricCompany,
        meterNo: MeterNo,
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
        "electricity"
      );

      return res.status(200).json({
        message: "Electric Bill Paid",
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
  electricityBills,
  transferCommission,
  getExamType,
  buyWaecEpin,
};


//https://www.nellobytesystems.com/APIJAMBV1.asp?UserID=your_userid&APIKey=your_apikey&ExamType=exam_code&PhoneNo=recipient_phoneno&RequestID=request_id&CallBackURL=callback_url

 