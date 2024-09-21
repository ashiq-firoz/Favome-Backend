var express = require('express');
var router = express.Router();
const axios = require("axios");
const crypto = require("crypto");


const MAILSERVER_URL = process.env.MAILSERVER_URL;
const MERCHANT_ID = process.env.MERCHANT_ID;
const PHONE_PE_HOST_URL = process.env.PHONE_PE_HOST_URL;
const SALT_INDEX = process.env.SALT_INDEX;
const SALT_KEY = process.env.SALT_KEY;


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


async function  SendMail(name,address,email,product,contact){
  try {
   
    const url = new URL(MAILSERVER_URL);
    url.searchParams.append('name', name);
    url.searchParams.append('email', email);
    url.searchParams.append('address', address);
    url.searchParams.append('product', product);
    url.searchParams.append('contact', contact);

    // Send GET request to the Google Apps Script
    const response = await axios.post(url.toString());

    // res.json({
    //   success: true,
    //   data: response.data
    // });
    
  } catch (error) {
    console.error('Error sending request to Google Apps Script:', error);
    // res.status(500).json({
    //   success: false,
    //   error: 'Failed to send request to Google Apps Script'
    // });
  }
}



router.post("/order", async(req,res)=>{
  try{
    let transactionid = req.body.transactionId
    const name = req.body.name;
    const email = req.body.email;
    const address = req.body.address;
    const product = req.body.product;
    const contact = req.body.phone;
    
    const data = {
      merchantId:MERCHANT_ID,
      merchantTransactionId: transactionid,
      name:req.body.name,
      amount:req.body.amount * 100,
      redirectUrl:`${process.env.BACKEND_URL}/status?id=${transactionid}&name=${name}&email=${email}&address=${address}&product=${product}&contact=${contact}`,
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
  const name = req.query.name;
  const email = req.query.email;
  const address = req.query.address;
  const product = req.query.product;
  const contact = req.query.phone;

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
      SendMail(name,address,email,product,contact);
      return res.redirect(process.env.SUCCESS_URL);
    }

  }).catch((err)=>{
    console.log(err);
    return res.redirect(process.env.FAILED_URL);
  })
})



module.exports = router;
