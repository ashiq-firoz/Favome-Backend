var express = require('express');
var router = express.Router();
const axios = require("axios");
const crypto = require("crypto");
const {getOrderId,verifyPayment} = require("../helper/razopay_helper")


const MAILSERVER_URL = process.env.MAILSERVER_URL;
const NOTIFICATION_URL = process.env.NOTIFICATION_URL;
const MERCHANT_ID = process.env.MERCHANT_ID;
const PHONE_PE_HOST_URL = process.env.PHONE_PE_HOST_URL;
const SALT_INDEX = process.env.SALT_INDEX;
const SALT_KEY = process.env.SALT_KEY;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

async function SendNotification({
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
  Panchayath_Corporation_Municipality,
  orderId,
  paymentid
}){
  try {

   

    const url = new URL(NOTIFICATION_URL);
    
    // Append all parameters to URL
    url.searchParams.append('customerName', customerName);
    url.searchParams.append('companyAddress', companyAddress);
    url.searchParams.append('mobile', mobile);
    url.searchParams.append('product', product);
    url.searchParams.append('orderId', orderId);
    url.searchParams.append('paymentid', paymentid);
    url.searchParams.append('companyEmail', companyEmail);
    url.searchParams.append('whatsapp', whatsapp || mobile); // fallback to mobile if whatsapp not provided
    
    // Append optional parameters only if they exist
    if (googleProfileLink) url.searchParams.append('googleProfileLink', googleProfileLink);
    if (logourl) url.searchParams.append('logourl', logourl);
    if (areaManager) url.searchParams.append('areaManager', areaManager);
    if (remarks) url.searchParams.append('remarks', remarks);
    if (Panchayath_Corporation_Municipality) url.searchParams.append('Panchayath_Corporation_Municipality', Panchayath_Corporation_Municipality);

    // Send POST request to the mail server
    const response = await axios.post(url.toString());
    
    return {
      success: true,
      data: response.data
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
  companyAddress,
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
  paymentid
}) {
  try {
    const url = new URL(MAILSERVER_URL);
    
    // Append all parameters to URL
    url.searchParams.append('customerName', customerName);
    url.searchParams.append('companyAddress', companyAddress);
    url.searchParams.append('mobile', mobile);
    url.searchParams.append('product', product);
    url.searchParams.append('orderid', orderId);
    url.searchParams.append('paymentid', paymentid);
    url.searchParams.append('companyEmail', companyEmail);
    url.searchParams.append('whatsapp', whatsapp || mobile); // fallback to mobile if whatsapp not provided
    
    // Append optional parameters only if they exist
    if (googleProfileLink) url.searchParams.append('googleProfileLink', googleProfileLink);
    if (logourl) url.searchParams.append('logourl', logourl);
    if (areaManager) url.searchParams.append('areaManager', areaManager);
    if (remarks) url.searchParams.append('remarks', remarks);
    if (Panchayath_Corporation_Municipality) url.searchParams.append('Panchayath_Corporation_Municipality', Panchayath_Corporation_Municipality);

    // Send POST request to the mail server
    const response = await axios.post(url.toString());
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
    
    await  SendNotification({
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
      orderId,
      paymentid
    });
    return {
      success: true,
      data: response.data
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
  const companyAddress = req.query.companyAddress || "Not applicable";
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
    // console.log(req.body)
    // console.log(req.body.razorpay_signature);
    // console.log(req.body.razorpay_order_id);

    verifyPayment(req.body).then((response) => {
      if (response == false) {
        let url = process.env.FRONTEND_URL+"/products?status=failure";
        res.redirect(url);
      } else {
        let url = process.env.FRONTEND_URL+"/products?status=success";
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
          Panchayath_Corporation_Municipality,
          orderId,
          paymentid,
      });
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



module.exports = router;
