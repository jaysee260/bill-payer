const AWS = require('aws-sdk');
const region = 'us-east-2';
const secretName = 'bill_payer_config_values';

const client = new AWS.SecretsManager({ region });

client.getSecretValue({ SecretId: secretName }, function(err, data) {
  if (err) {
    throw err;
  } else {
    // const secretString = JSON.parse(data.SecretString);
    // const secretBinary = JSON.parse(data.SecretBinary);
    // console.log({ secretString });
    // console.log({ secretBinary });
    console.log({ data });

    if ('SecretString' in data) {
      const secretString = data.SecretString;
      console.log({ secretString });
    } else {
      const buffer = Buffer.from(data.SecretBinary, 'base64');
      const decodedBinarySecret = buffer.toString('ascii');
    }
  }
});