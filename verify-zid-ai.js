const handler = require('./api/zid-ai.js');

(async () => {
  let status = 200;
  let payload;

  const res = {
    setHeader() {},
    status(code) {
      status = code;
      return this;
    },
    json(obj) {
      payload = obj;
    },
    end(str) {
      payload = JSON.parse(str || '{}');
    }
  };

  await handler({ method: 'POST', body: { question: 'How do I sign up for Zidea?' } }, res);

  console.log('STATUS=' + status);
  console.log(JSON.stringify(payload));
})();
