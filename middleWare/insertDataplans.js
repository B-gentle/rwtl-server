const mongoose = require('mongoose');

// Save MTN data plans
// const saveMtnDataPlans = async () => {
//   try {
//     const mtnDataPlan = new DataPlan({
//       network: 'MTN',
//       networkCode: '01',
//       plans: [
//         {
//           productCode: '1',
//           productName: '50 MB - 30 days (Corporate)',
//           productAmount: '14',
//           companyPrice: 20,
//           difference: 6,
//         },
//         {
//           productCode: '3',
//           productName: '150 MB - 30 days (Corporate)',
//           productAmount: '38',
//           companyPrice: 40,
//           difference: 2,
//         },
//         {
//           productCode: '7',
//           productName: '250 MB - 30 days (Corporate)',
//           productAmount: '62',
//           companyPrice: 70,
//           difference: 8,
//         },
//         {
//           productCode: '2',
//           productName: '500 MB - 30 days (SME)',
//           productAmount: '117',
//           companyPrice: 120,
//           difference: 3,
//         },
//         {
//           productCode: '35',
//           productName: '500 MB - 30 days (Corporate)',
//           productAmount: '122',
//           companyPrice: 125,
//           difference: 3,
//         },
//         {
//           productCode: '4',
//           productName: '1 GB - 30 days (SME)',
//           productAmount: '230',
//           companyPrice: 240,
//           difference: 10,
//         },
//         {
//           productCode: '36',
//           productName: '1 GB - 30 days (Corporate)',
//           productAmount: '235',
//           companyPrice: 245,
//           difference: 10,
//         },
//         {
//           productCode: '5',
//           productName: '2 GB - 30 days (SME)',
//           productAmount: '460',
//           companyPrice: 470,
//           difference: 10,
//         },
//         {
//           productCode: '37',
//           productName: '2 GB - 30 days (Corporate)',
//           productAmount: '470',
//           companyPrice: 480,
//           difference: 10,
//         },
//         {
//           productCode: '6',
//           productName: '3 GB - 30 days (SME)',
//           productAmount: '690',
//           companyPrice: 700,
//           difference: 10,
//         },
//         {
//           productCode: '38',
//           productName: '3 GB - 30 days (Corporate)',
//           productAmount: '705',
//           companyPrice: 715,
//           difference: 10,
//         },
//         {
//           productCode: '8',
//           productName: '5 GB - 30 days (SME)',
//           productAmount: '1150',
//           companyPrice: 1160,
//           difference: 10,
//         },
//         {
//           productCode: '39',
//           productName: '5 GB - 30 days (Corporate)',
//           productAmount: '1175',
//           companyPrice: 1185,
//           difference: 10,
//         },
//         {
//           productCode: '13',
//           productName: '10 GB - 30 days (SME)',
//           productAmount: '2300',
//           companyPrice: 2310,
//           difference: 10,
//         },
//         {
//           productCode: '40',
//           productName: '10 GB - 30 days (Corporate)',
//           productAmount: '2350',
//           companyPrice: 2360,
//           difference: 10,
//         },
//         {
//           productCode: '9',
//           productName: '15 GB - 30 days (Corporate)',
//           productAmount: '3460',
//           companyPrice: 3470,
//           difference: 10,
//         },
//         {
//           productCode: '10',
//           productName: '20 GB - 30 days (Corporate)',
//           productAmount: '4675',
//           companyPrice: 4685,
//           difference: 10,
//         },
//         {
//           productCode: '11',
//           productName: '25 GB - 30 days (Corporate)',
//           productAmount: '5850',
//           companyPrice: 5860,
//           difference: 10,
//         },
//         {
//           productCode: '12',
//           productName: '50 GB - 30 days (Corporate)',
//           productAmount: '11625',
//           companyPrice: 11635,
//           difference: 10,
//         },
//       ],
//     });

//     await mtnDataPlan.save();
//     console.log('MTN data plans saved successfully.');
//   } catch (error) {
//     console.error('Error saving MTN data plans:', error);
//   }
// };

// Call the function to save MTN data plans
// saveMtnDataPlans();


//function to save airtel data plans  
// async function saveAirtelDataPlans() {
//     try{
//     const airtelDataPlans = new DataPlan({
//       network: 'Airtel',
//       networkCode: '02',
//       plans: [
//         {
//           productCode: '1',
//           productName: '200 MB - 14 days (SME)',
//           productAmount: '52',
//           companyPrice: 25,
//           difference: 27,
//         },
//         {
//           productCode: '2',
//           productName: '500 MB - 30 days (SME)',
//           productAmount: '127',
//           companyPrice: 9,
//           difference: 118,
//         },
//         {
//           productCode: '3',
//           productName: '1 GB - 30 days (SME)',
//           productAmount: '250',
//           companyPrice: 83,
//           difference: 167,
//         },
//         {
//           productCode: '4',
//           productName: '2 GB - 30 days (SME)',
//           productAmount: '500',
//           companyPrice: 5,
//           difference: 495,
//         },
//         {
//           productCode: '5',
//           productName: '3 GB - 30 days (SME)',
//           productAmount: '750',
//           companyPrice: 50,
//           difference: 700,
//         },
//         {
//           productCode: '6',
//           productName: '5 GB - 30 days (SME)',
//           productAmount: '1250',
//           companyPrice: 75,
//           difference: 1175,
//         },
//         {
//           productCode: '7',
//           productName: '10 GB - 30 days (SME)',
//           productAmount: '2500',
//           companyPrice: 50,
//           difference: 2450,
//         },
//         {
//           productCode: '29',
//           productName: '105MB (Direct)',
//           productAmount: '92',
//           companyPrice: 3400,
//           difference: -3308,
//         },
//         {
//           productCode: '30',
//           productName: '350MB (Direct)',
//           productAmount: '184',
//           companyPrice: 4550,
//           difference: -4366,
//         },
//         {
//           productCode: '32',
//           productName: '1.05GB/1.8GB (Direct)',
//           productAmount: '460',
//           companyPrice: 100,
//           difference: 360,
//         },
//         {
//           productCode: '14',
//           productName: '2.5GB/3.7GB (Direct)',
//           productAmount: '920',
//           companyPrice: 200,
//           difference: 720,
//         },
//         {
//           productCode: '15',
//           productName: '5.8GB/9.5GB (Direct)',
//           productAmount: '1840',
//           companyPrice: 300,
//           difference: 1540,
//         },
//         {
//           productCode: '16',
//           productName: '7.7GB/12.75GB (Direct)',
//           productAmount: '2300',
//           companyPrice: 500,
//           difference: 1800,
//         },
//         {
//           productCode: '17',
//           productName: '10GB/17GB (Direct)',
//           productAmount: '2760',
//           companyPrice: 300,
//           difference: 2460,
//         },
//         {
//           productCode: '18',
//           productName: '13.25GB/19GB (Direct)',
//           productAmount: '3680',
//           companyPrice: 1000,
//           difference: 2680,
//         },
//         {
//           productCode: '19',
//           productName: '18.25/23GB (Direct)',
//           productAmount: '4600',
//           companyPrice: 1500,
//           difference: 3100,
//         },
//         {
//           productCode: '20',
//           productName: '29.5GB/37GB (Direct)',
//           productAmount: '7360',
//           companyPrice: 2000,
//           difference: 5360,
//         },
//         {
//           productCode: '24',
//           productName: '50GB/50GB (Direct)',
//           productAmount: '9200',
//           companyPrice: 1500,
//           difference: 7700,
//         },
//         {
//           productCode: '21',
//           productName: '93GB/93GB (Direct)',
//           productAmount: '13800',
//           companyPrice: 2500,
//           difference: 11300,
//         },
//         {
//           productCode: '22',
//           productName: '119GB/119GB (Direct)',
//           productAmount: '16560',
//           companyPrice: 3000,
//           difference: 13560,
//         },
//         {
//           productCode: '23',
//           productName: '138GB/138GB (Direct)',
//           productAmount: '18400',
//           companyPrice: 3999,
//           difference: 14401,
//         }
//       ]
//     });
  
//     await airtelDataPlans.save();
//         console.log('MTN data plans saved successfully.');
//       } catch (error) {
//         console.error('Error saving MTN data plans:', error);
//       }
//   }
  
      // saveAirtelDataPlans();



