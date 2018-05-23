const request = require('request');
const formatter = require('./formatter');
const rejectUnauthorized = true;

export default function (server) {

  if (server.info.protocol == 'https') {
    rejectUnauthorized = getVerificationMode();
  }
  server.route({
    path: '/_prometheus/metrics',
    method: 'GET',
    handler(req, reply) {

      getMetrics(server.info.protocol,
        server.info.host,
        server.info.port,
        rejectUnauthorized,
        function getMetricsCallback(error, info) {

          if (error) {
            reply(error);
            return
          }

          reply(formatter(info)).type('text/plain').encoding('binary');
        });
    }
  });
}

function getMetrics(protocol, host, port, rejectUnauthorized = true, callback) {

  const url = `${protocol}://${host}:${port}/api/status`;

  request({
      url: url,
      method: 'GET',
      rejectUnauthorized: false
    },
    function (error, res, body) {
      if (error) {
        new Error('Error SSL----------------')
        callback(error);
        return;
      }

      callback(null, JSON.parse(body));
    });
}

function getVerificationMode() {
  const verificationMode = config.get('elasticsearch.ssl.verificationMode');

  switch (verificationMode) {
    case 'none':
      rejectUnauthorized = false;
      break;
    case 'certificate':
      rejectUnauthorized = true;
      break;
    case 'full':
      rejectUnauthorized = true;
      break;
    default:
      throw new Error(`Unknown ssl verificationMode: ${verificationMode}`);
  }

  return rejectUnauthorized;
}