var AWS = require('aws-sdk')
AWS.config.update({
  region: 'us-east-2'
})

var sns = new AWS.SNS();
var dynamodb = new AWS.DynamoDB.DocumentClient()
var table = process.env.dynamo_table
var sns_arn = process.env.sns_arn

function constructUrls() {
  var urls = []
  var params = {
    TableName: table
  }
  dynamodb.scan(params, function (err, data) {
    if (err) {
      console.error('Unable to get item. Error JSON:', JSON.stringify(err, null, 2))
    } else {
      for (var i = 0, len = data['Items'].length; i < len; i++) {
         urls.push(data['Items'][i]['pre_url']+data['Items'][i]['iterator']+data['Items'][i]['post_url'])
      }
    const exec = require('child_process').exec;
    var message_body = null
    for (var i = 0, len = urls.length; i < len; i++) {
        (function(i){
            var url = urls[i]
            const curls = exec('curl', ["-so", "/dev/null", "-w", "'%{response_code}'", url]);
        
            exec("curl -so /dev/null -w '%{response_code}' " + url, (err, stdout, stderr) => {
              if (err) {
                console.error(err);
                return;
              }
              console.log(stdout);
              if (stdout == 200) {
                  if (message_body){
                    message_body += 'New content: ' + url + '\n'
                  } else {
                    message_body = 'New content: ' + url + '\n'
                  }
                    var params = {
                          Key: { 
                            'web_id': data['Items'][i]['web_id']
                          },
                          TableName: table,
                          AttributeUpdates: {
                            iterator: {
                              Action: 'PUT',
                              Value: data['Items'][i]['iterator'] +1
                            }
                          }        
                      }
                    
                      dynamodb.update(params, function (err, data) {
                        if (err) {
                          console.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2))
                        } else {
                          console.log('Update succeeded:', JSON.stringify(data, null, 2))
                        }
                      })
                  
              }
              console.log('attention', i)
              if (i == urls.length -1) {
                  sendSNS(message_body)
              }
            });
        })(i)
    }
    }
  })    
}

function sendSNS(message_body) {
    console.log('message body:', message_body)
    if(message_body){
        var params = {
          Message: message_body,
          Subject: 'New Content available:',
          TopicArn: sns_arn
        };
        sns.publish(params, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else     console.log(data);           // successful response
        });
    } 
}

exports.handler = (event, context, callback) => {
    constructUrls()

}
