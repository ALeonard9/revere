# Revere

This is a service that takes in a list of URLS for things like tv shows or comic books, attempts to reach the next page and notifies a subscriber list when new content becomes available.

Example: Notify me when the next Walking Dead comic is available online.

## Technology used
* AWS Lambda
* AWS SNS
* AWS Dynamo DB
* Node.js

## Usage

1. Create a dynamodb table with the following columns: 

| column | usage | example |
|---|---|---|
| web_id | unique identifier | 1 |
| iterator  | (integer) numeric identifier for an instance |  19 |
| pre_url  | (string) the url before the iterator | http://www.adamtv.com/myshow/  |
| post_url | (string) the url after the iterator | /fullvideo |

Example site to be checked: http://www.adamtv.com/myshow/19/fullvideo

2. Create an sns topic and subscribe.

3. Create a lambda function using the index.js included in the repository. Set the following environment variables:

| env variable | usage | example |
|---|---|---|
| dynamo_table | table created in step 1 | Websites |
| sns_arn | arn of the topic created in step 2 | arn:aws:sns:us-east-2:your_account:NewComic |

4. Set a trigger for the function that will run it once a day (or more frequently if you wish).

## Support

Please [open an issue](https://github.com/ALeonard9/revere/issues/new) for support.

## Contributing

Please contribute using [Github Flow](https://guides.github.com/introduction/flow/). Create a branch, add commits, and open a pull request.

