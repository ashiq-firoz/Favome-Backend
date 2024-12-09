var express = require('express');
var router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const {getOrderId,verifyPayment} = require("../helper/razopay_helper");
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MAILSERVER_URL = process.env.MAILSERVER_URL;
const NOTIFICATION_URL = process.env.NOTIFICATION_URL;
const MERCHANT_ID = process.env.MERCHANT_ID;
const PHONE_PE_HOST_URL = process.env.PHONE_PE_HOST_URL;
const SALT_INDEX = process.env.SALT_INDEX;
const SALT_KEY = process.env.SALT_KEY;
const INVOICE_SENDER_URL = process.env.INVOICE_SENDER_URL;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// router.get("/test",async(req,res)=>{
//   await SendInvoice(
//     {
//       billNo:"BILL-0059",
//       areaManager:"not applicable",
//       addressLine1:"zam zam",
//       city:"trv",
//       state:"kerala",
//       pincode:"695615",
//       product:"WhatsApp%20Shop%20-%20Perfect%20eCommerce%20Solution",
//       total:'1',
//       paymentId :'djkdfsh',
//       orderId:'dhfdksjh',
//       companyEmail:'ashiqfiroz08@gmail.com',
//       mrp:'1',
//       discount:'1',
//       tax:'1'
//     }
//   )
//   res.json("done")
// })

async function SendInvoice({
  billNo,
  areaManager,
  addressLine1,
  city,
  state,
  pincode,
  product,
  total,
  paymentId,
  orderId,
  companyEmail,
  mrp,
  discount,
  tax
}) {
  try {
    // Get bill data from Firebase
    const billsRef = collection(db, 'bills');
    const q = query(billsRef, where('billNo', '==', billNo));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('Bill not found');
    }

    const billData = querySnapshot.docs[0].data();
    
    // Continue with existing logic
    const url = new URL(INVOICE_SENDER_URL);
    url.searchParams.append('companyEmail', companyEmail);
    
    let products = billData.items;
    let shippingAddress = `${addressLine1}<br>${city}, ${state} <br>${pincode}`;
    let totalCost = total;
    
    // Include bill data in invoice generation
    const content = generateInvoiceHTML({
      billNo,
      areaManager,
      products,
      shippingAddress,
      totalCost,
      paymentId,
      orderId,
      mrp,
      discount,
      tax,
      billData // Pass the Firebase data
    });

    // Rest of your existing code...
    
  } catch (error) {
    console.error('Error in SendInvoice:', error);
    throw error;
  }
}

async function SendNotification({
  customerName,
  mobile,
  product,
  companyEmail,
  whatsapp,
  googleProfileLink,
  logourl,
  areaManager,
  remarks,
  Panchayath_Corporation_Municipality,
  orderId,
  paymentid,
  haveHappyFamilyCard,
  happyFamilyCardNumber,
  addressLine1,
  city,
  state,
  pincode
}){
  try {

   

    const url = new URL(NOTIFICATION_URL);
    
    // Append all parameters to URL
    url.searchParams.append('customerName', customerName);
    url.searchParams.append('addressLine1',addressLine1 );
    url.searchParams.append('city',city );
    url.searchParams.append('state',state );
    url.searchParams.append('pincode',pincode );
    url.searchParams.append('mobile', mobile);
    url.searchParams.append('product', product);
    url.searchParams.append('orderId', orderId);
    url.searchParams.append('paymentid', paymentid);
    url.searchParams.append('haveHappyFamilyCard', haveHappyFamilyCard);
    url.searchParams.append('happyFamilyCardNumber', happyFamilyCardNumber);
    url.searchParams.append('companyEmail', companyEmail);
    url.searchParams.append('whatsapp', whatsapp || mobile); // fallback to mobile if whatsapp not provided
    
    // Append optional parameters only if they exist
    if (googleProfileLink) url.searchParams.append('googleProfileLink', googleProfileLink);
    if (logourl) url.searchParams.append('logourl', logourl);
    if (areaManager) url.searchParams.append('areaManager', areaManager);
    if (remarks) url.searchParams.append('remarks', remarks);
    if (Panchayath_Corporation_Municipality) url.searchParams.append('Panchayath_Corporation_Municipality', Panchayath_Corporation_Municipality);

    // Send POST request to the mail server
    try{
    const response = await axios.post(url.toString());
    }
    catch(err){
      console.log(err)
    }
    
    return {
      success: true
    };

  } catch (error) {
    console.error('Error sending request to Mail Server:', error);
    throw {
      success: false,
      error: 'Failed to send request to Mail Server',
      details: error.message
    };
  }
};

async function SendMail({
  customerName,
  mobile,
  product,
  companyEmail,
  whatsapp,
  googleProfileLink,
  logourl,
  areaManager,
  remarks,
  Panchayath_Corporation_Municipality,
  orderId,
  paymentid,
  haveHappyFamilyCard,
  happyFamilyCardNumber,
  addressLine1,
  city,
  state,
  pincode,
  total,
  billNo,
  mrp,
  discount,
  tax
}) {
  try {
    const url = new URL(MAILSERVER_URL);
    
    // Append all parameters to URL
    url.searchParams.append('customerName', customerName);
    url.searchParams.append('addressLine1',addressLine1 );
    url.searchParams.append('city',city );
    url.searchParams.append('state',state );
    url.searchParams.append('pincode',pincode );
    url.searchParams.append('mobile', mobile);
    url.searchParams.append('product', product);
    url.searchParams.append('orderid', orderId);
    url.searchParams.append('billno', billNo);
    url.searchParams.append('paymentid', paymentid);
    url.searchParams.append('haveHappyFamilyCard', haveHappyFamilyCard);
    url.searchParams.append('happyFamilyCardNumber', happyFamilyCardNumber);
    url.searchParams.append('companyEmail', companyEmail);
    url.searchParams.append('whatsapp', whatsapp || mobile); // fallback to mobile if whatsapp not provided
    
    // Append optional parameters only if they exist
    if (googleProfileLink) url.searchParams.append('googleProfileLink', googleProfileLink);
    if (logourl) url.searchParams.append('logourl', logourl);
    if (areaManager) url.searchParams.append('areaManager', areaManager);
    if (remarks) url.searchParams.append('remarks', remarks);
    if (Panchayath_Corporation_Municipality) url.searchParams.append('Panchayath_Corporation_Municipality', Panchayath_Corporation_Municipality);

    // Send POST request to the mail server
    try{
    const response = await axios.post(url.toString());
    }
    catch(err){
      console.log(err)
    }
  //   console.log(
  //   customerName+" | "+
  //       companyAddress+" | "+
  //       mobile+" | "+
  //       product+" | "+
  //       companyEmail+" | "+
  //       whatsapp+" | "+
  //       googleProfileLink+" | "+
  //       logourl+" | "+
  //       areaManager+" | "+
  //       remarks
  // )
    const billno = billNo;
    // console.log(billno)
    await  SendNotification({
      customerName,
      mobile,
      product,
      companyEmail,
      whatsapp,
      googleProfileLink,
      logourl,
      areaManager,
      remarks,
      orderId,
      paymentid,
      haveHappyFamilyCard,
      happyFamilyCardNumber,
      addressLine1,
      city,
      state,
      pincode
    });
       let paymentId = paymentid
    await SendInvoice({
      billNo, 
      areaManager,
      addressLine1,
      city,
      state,
      pincode,
      product,
      total,
      paymentId,
      orderId,
      companyEmail,
      mrp,
      discount,
      tax
  });

    return {
      success: true,
    };

  } catch (error) {
    console.error('Error sending request to Mail Server:', error);
    throw {
      success: false,
      error: 'Failed to send request to Mail Server',
      details: error.message
    };
  }
}


router.post("/getorderid",async(req,res)=>{
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).send({ error: "Amount is required" });
    }

    getOrderId(amount).then((response)=>{
      let orderId = response;
      if (response!=false){
        res.status(200).send({ "orderid": orderId });
      }
      else{
        res.status(500).send({ error: "Failed to create order" });
      }
    });
    
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
});


router.post("/verifypayment",async(req,res)=>{

 
  const customerName = req.query.customerName;
  // const companyAddress = req.query.companyAddress || "Not applicable";
  const token = req.query.token || "Not applicable";
  const logourl = (req.query.logourl) ? req.query.logourl.replace("/logos/", "/logos%2F") + "&token=" + token : "Not applicable";
  const product = req.query.product;
  const mobile = req.query.mobile;
  const companyEmail = req.query.companyEmail;
  const whatsapp = req.query.whatsapp;
  const googleProfileLink = req.query.googleProfileLink || "Not applicable";
  const areaManager = req.query.areaManager || "Not applicable";
  const remarks = req.query.remarks || "";
  const Panchayath_Corporation_Municipality = req.query.Panchayath_Corporation_Municipality || "Not applicable";
  const paymentid =  req.body.razorpay_payment_id;
  const orderId = req.query.orderId;
  const happyFamilyCardNumber = req.query.happyFamilyCardNumber;
  const haveHappyFamilyCard = req.query.haveHappyFamilyCard;
  const addressLine1 = req.query.addressLine1;
  const city = req.query.city;
  const state = req.query.state;
  const pincode = req.query.pincode;
  const total = req.query.total;
  const billNo = req.query.billno || "b-11";
  const mrp = req.query.mrp || total;
  const discount = req.query.discount || "0.00";
  const tax = req.query.tax  || "0.00";

  // console.log(req.query)
  // console.log(billno)

  //     console.log(
  //   customerName+" | "+
  //       companyAddress+" | "+
  //       mobile+" | "+
  //       product+" | "+
  //       companyEmail+" | "+
  //       whatsapp+" | "+
  //       googleProfileLink+" | "+
  //       logourl+" | "+
  //       areaManager+" | "+
  //       remarks+" | "+
  //       Panchayath_Corporation_Municipality
  // )

  try{
       // console.log(req.body.razorpay_signature);
    // console.log(req.body.razorpay_order_id);

    verifyPayment(req.body).then((response) => {
      if (response == false) {
        let url = process.env.FRONTEND_URL+"/products?status=failure";
        res.redirect(url);
      } else {
        let url = process.env.FRONTEND_URL+"/products?status=success&bn="+billNo+"&payid="+paymentid+"&orid="+orderId;
        try{
        SendMail({
          customerName,
          mobile,
          product,
          companyEmail,
          whatsapp,
          googleProfileLink,
          logourl,
          areaManager,
          remarks,
          Panchayath_Corporation_Municipality,
          orderId,
          paymentid,
          haveHappyFamilyCard,
          happyFamilyCardNumber,
          addressLine1,
          city,
          state,
          pincode,
          total,
          billNo,
          mrp,
          discount,
          tax
      });
    }
    catch(err){
      console.log(err)
    }
        res.redirect(url);
      }
    });
  }
  catch(err){
    console.log(err);
    res.status(500).send({ error: "Internal Server Error" });
  }
})



router.post("/order", async(req,res)=>{
  try{
    console.log(req.body)
    let transactionid = req.body.transactionId
    const customerName = req.body.customerName.replace(/\s/g, "%20");
    const companyAddress = req.body.companyAddress.replace(/\s/g, "%20");
    const mobile = req.body.mobile;
    const product = req.body.products;
    const companyEmail = req.body.companyEmail;
    const whatsapp = req.body.whatsapp;
    const googleProfileLink = req.body.googleProfileLink;
    const logourl = req.body.companyLogo;
    const areaManager = req.body.areaManager.replace(/\s/g, "%20");
    const remarks = req.body.remarks.replace(/\s/g, "%20");
    const Panchayath_Corporation_Municipality = req.body.Panchayath_Corporation_Municipality || "not applicable";
    
    console.log(`${process.env.BACKEND_URL}/status?id=${transactionid}&customerName=${customerName}&companyAddress=${companyAddress}&logourl=${logourl}&product=${product}&mobile=${mobile}&companyEmail=${companyEmail}&whatsapp=${whatsapp}&googleProfileLink=${googleProfileLink}&areaManager=${areaManager}&remarks=${remarks}&Panchayath_Corporation_Municipality=${Panchayath_Corporation_Municipality}`)
    
    const data = {
      merchantId:MERCHANT_ID,
      merchantTransactionId: transactionid,
      name:req.body.customerName,
      amount:req.body.amount * 100,
      redirectUrl:`${process.env.BACKEND_URL}/status?id=${transactionid}&customerName=${customerName}&companyAddress=${companyAddress}&logourl=${logourl}&product=${product}&mobile=${mobile}&companyEmail=${companyEmail}&whatsapp=${whatsapp}&googleProfileLink=${googleProfileLink}&areaManager=${areaManager}&remarks=${remarks  }`,
      redirectMode: "POST",
      mobileNumber: req.body.mobile,
      paymentInstrument : {
        type : "PAY_PAGE"
      }
    }
    
    //res.json({"status" : true});
    const payload = JSON.stringify(data);
    const payloadbase64 = Buffer.from(payload).toString("base64");
    
    const string = payloadbase64 + '/pg/v1/pay' + SALT_KEY;
    const sha256_load = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256_load + '###' + SALT_INDEX;
    console.log(checksum)
    const options = {
      method : 'POST',
      url : PHONE_PE_HOST_URL,
      headers : {
        accept : 'application/json',
        'Content-Type' : 'application/json',
        'X-VERIFY':checksum,
      },
      data : {
        request : payloadbase64
      }
    }

    const response = await axios(options)

    if(response){
      console.log(response.data)
      res.json(response.data)
    }
    else{
      res.json({error:"Error"});
    }

  }
  catch(err){
    console.log(err);
  }
});


router.post("/status", async(req,res)=>{
  try{
  const merchantTransactionId = req.query.id;
  const customerName = req.query.customerName;
  const companyAddress = req.query.companyAddress;
  const token = req.query.token;
  const logourl = req.query.logourl.replace("/logos/", "/logos%2F") + "&token=" + token;
  const product = req.query.product;
  const mobile = req.query.mobile;
  const companyEmail = req.query.companyEmail;
  const whatsapp = req.query.whatsapp;
  const googleProfileLink = req.query.googleProfileLink;
  const areaManager = req.query.areaManager;
  const remarks = req.query.remarks;
  const Panchayath_Corporation_Municipality = req.query.Panchayath_Corporation_Municipality

  // console.log(
  //   customerName+" | "+
  //       companyAddress+" | "+
  //       mobile+" | "+
  //       product+" | "+
  //       companyEmail+" | "+
  //       whatsapp+" | "+
  //       googleProfileLink+" | "+
  //       logourl+" | "+
  //       areaManager+" | "+
  //       remarks
  // )

  const status_url = process.env.STATUS_URL+`/${MERCHANT_ID}/${merchantTransactionId}`;

  const string = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY;

  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = sha256 + '###' + SALT_INDEX;

  const options = {
    method : 'GET',
    url : status_url,
    headers : {
      accept : 'application/json',
      'Content-Type': 'application/json',
      'X-VERIFY':checksum,
      'X-MERCHANT-ID' : `${MERCHANT_ID}`
    }
  }
  //res.json({"statis":true});
  axios.request(options).then(function (response){
    if (response.data.success === true){
      SendMail({
        customerName,
        companyAddress,
        mobile,
        product,
        companyEmail,
        whatsapp,
        googleProfileLink,
        logourl,
        areaManager,
        remarks,
        Panchayath_Corporation_Municipality
    });
        
       
      return res.redirect(process.env.SUCCESS_URL);
    }

  }).catch((err)=>{
    console.log(err);
    return res.redirect(process.env.FAILED_URL);
  })
}
catch(err){
  console.log(err)
  return res.redirect(process.env.FAILED_URL);
}
})


function generateInvoiceHTML({
  billNo,
  areaManager,
  products,
  shippingAddress,
  totalCost,
  paymentId,
  orderId,
  mrp,
  discount,
  invoiceDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: '2-digit'
  })
}) {
  console.log(
    billNo + " | "+
    areaManager + " | "+
    products + " | "+
    shippingAddress + " | "+
    totalCost + " | "+
    paymentId + " | "+
    orderId + " | "
);
 
  // Format currency
  const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2
      }).format(amount).replace(/^(\D+)/, '₹');
  };

  // Generate product rows
  const generateProductRows = () => {
      return products.map((product, index) => `
          <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${product.name}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${product.quantity}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(product.mrp)}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(product.discount)}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatCurrency(product.price)}</td>
          </tr>
      `).join('');
  };
  let totalDiscount;
    totalDiscount = products.reduce((sum, item) => sum + item.discount, 0);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Invoice #${billNo}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 800px; margin: 0 auto; background-color: #ffffff;">
      <tr>
          <td style="padding: 20px;">
              <!-- Header -->
              <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                      <td width="70%" style="vertical-align: top;">
                          <h2 style="margin: 0; color: #333;">FAVOME PRIVATE LIMITED</h2>
                          <p style="margin: 5px 0; font-size: 14px;">
                              39/11A1,<br>
                              Po. Opp. Ioc Petrol Pump,<br>
                              Thiruvannur, Kozhikode, Kerala 673029<br>
                              Email: favome2024@gmail.com<br>
                              www.favome.com<br>
                              Ph: +914953101384, +914953101163
                          </p>
                      </td>
                      <td width="30%" style="text-align: right; vertical-align: top;">
                          <img src="https://www.favome.com/img/logo2.png" alt="Favome Logo" style="width: 100px; height: auto;">
                      </td>
                  </tr>
              </table>

              <!-- Invoice Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                  <tr>
                      <td>
                          <h1 style="color: #ff0000; text-align: center; margin: 20px 0;">Payment Invoice</h1>
                      </td>
                  </tr>
                  <tr>
                      <td>
                          <table width="100%" cellpadding="5" cellspacing="0">
                              <tr>
                                  <td>
                                      <strong>Invoice No:</strong> ${billNo}<br>
                                      <strong>Order ID:</strong> ${orderId}<br>
                                      <strong>Payment ID:</strong> ${paymentId}
                                  </td>
                                  <td style="text-align: right;">
                                      <strong>Date:</strong> ${invoiceDate}
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>

              <!-- Shipping Address -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
                  <tr>
                      <td style="padding: 10px; background-color: #f9f9f9;">
                          <strong>Shipping Address:</strong><br>
                          ${shippingAddress}
                      </td>
                       <td style="padding: 10px; background-color: #f9f9f9;">
                          <strong>Name:</strong><br>
                          ${products.name}
                      </td>
                  </tr>
              </table>

              <!-- Products Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; border-collapse: collapse;">
                  <tr style="background-color: #f0f0f0;">
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">#</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item & Description</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Qty</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Rate</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Discount</th>
                      <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Net Amount</th>
                  </tr>
                  <tr>
             ${generateProductRows(products)}
          </tr>
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="5" cellspacing="0" style="margin-top: 20px;">
                  <tr>
                      <td width="70%"></td>
                      <td width="30%">
                          <table width="100%" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
                              <tr>
                                  <td><strong>Total Discount:</strong></td>
                                  <td style="text-align: right;">${totalDiscount} </td>
                              </tr>
                              <tr>
                                  <td><strong>Total:</strong></td>
                                  <td style="text-align: right;">${totalCost}</td>
                              </tr>
                              
                          </table>
                      </td>
                  </tr>
              </table>

              <!-- Footer -->
              <table width="100%" cellpadding="5" cellspacing="0" style="margin-top: 20px;">
                  <tr>
                      <td>
                          <p style="margin: 5px 0;">CARD DELIVERY WITH IN 14 DAYS</p>
                      </td>
                  </tr>
                  <tr>
                      <td style="padding-top: 30px;">
                          <table width="100%" cellpadding="5" cellspacing="0">
                              <tr>
                                  <td>
                                      <strong>Area Manager Name:</strong> ${areaManager}<br>
                                  </td>
                                  <td style="text-align: right; vertical-align: bottom;">
                                      <div style="margin-top: 40px; border-top: 1px solid #000; width: 200px; float: right;">
                                          <p style="margin: 5px 0; text-align: center;">Authorized Signature</p>
                                      </div>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </td>
      </tr>
  </table>
</body>
</html>
  `;
}



module.exports = router;
