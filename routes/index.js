var express = require('express');
var router = express.Router();
const axios = require("axios");
const crypto = require("crypto");


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
  remarks
}){
  try {
    const url = new URL(NOTIFICATION_URL);
    
    // Append all parameters to URL
    url.searchParams.append('customerName', customerName);
    url.searchParams.append('companyAddress', companyAddress);
    url.searchParams.append('mobile', mobile);
    url.searchParams.append('product', product);
    url.searchParams.append('companyEmail', companyEmail);
    url.searchParams.append('whatsapp', whatsapp || mobile); // fallback to mobile if whatsapp not provided
    
    // Append optional parameters only if they exist
    if (googleProfileLink) url.searchParams.append('googleProfileLink', googleProfileLink);
    if (logourl) url.searchParams.append('logourl', logourl);
    if (areaManager) url.searchParams.append('areaManager', areaManager);
    if (remarks) url.searchParams.append('remarks', remarks);

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
  remarks
}) {
  try {
    const url = new URL(MAILSERVER_URL);
    
    // Append all parameters to URL
    url.searchParams.append('customerName', customerName);
    url.searchParams.append('companyAddress', companyAddress);
    url.searchParams.append('mobile', mobile);
    url.searchParams.append('product', product);
    url.searchParams.append('companyEmail', companyEmail);
    url.searchParams.append('whatsapp', whatsapp || mobile); // fallback to mobile if whatsapp not provided
    
    // Append optional parameters only if they exist
    if (googleProfileLink) url.searchParams.append('googleProfileLink', googleProfileLink);
    if (logourl) url.searchParams.append('logourl', logourl);
    if (areaManager) url.searchParams.append('areaManager', areaManager);
    if (remarks) url.searchParams.append('remarks', remarks);

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
}



router.post("/order", async(req,res)=>{
  try{
    let transactionid = req.body.transactionId
    const customerName = req.body.customerName;
    const companyAddress = req.body.companyAddress;
    const mobile = req.body.mobile;
    const product = req.body.product;
    const companyEmail = req.body.companyEmail;
    const whatsapp = req.body.whatsapp;
    const googleProfileLink = req.body.googleProfileLink;
    const logourl = req.body.logourl;
    const areaManager = req.body.areaManager;
    const remarks = req.body.remarks;

    
    const data = {
      merchantId:MERCHANT_ID,
      merchantTransactionId: transactionid,
      name:req.body.name,
      amount:req.body.amount * 100,
      redirectUrl:`${process.env.BACKEND_URL}/status?id=${transactionid}&customerName=${customerName}&companyAddress=${companyAddress}&logourl=${logourl}&product=${product}&mobile=${mobile}&companyEmail=${companyEmail}&whatsapp=${whatsapp}&googleProfileLink=${googleProfileLink}&areaManager=${areaManager}&remarks=${remarks  }`,
      redirectMode: "POST",
      mobileNumber: req.body.phone,
      paymentInstrument : {
        type : "PAY_PAGE"
      }
    }

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
  const merchantTransactionId = req.query.id;
  const customerName = req.query.customerName;
  const companyAddress = req.query.companyAddress;
  const logourl = req.query.logourl;
  const product = req.query.product;
  const mobile = req.query.mobile;
  const companyEmail = req.query.companyEmail;
  const whatsapp = req.query.whatsapp;
  const googleProfileLink = req.query.googleProfileLink;
  const areaManager = req.query.areaManager;
  const remarks = req.query.mobile;

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

  axios.request(options).then(function (response){
    if (response.data.success === true){
      SendMail(customerName,
        companyAddress,
        mobile,
        product,
        companyEmail,
        whatsapp,
        googleProfileLink,
        logourl,
        areaManager,
        remarks);
        
        SendNotification(customerName,
          companyAddress,
          mobile,
          product,
          companyEmail,
          whatsapp,
          googleProfileLink,
          logourl,
          areaManager,
          remarks);
      return res.redirect(process.env.SUCCESS_URL);
    }

  }).catch((err)=>{
    console.log(err);
    return res.redirect(process.env.FAILED_URL);
  })
})



module.exports = router;
