const Queue = require('bull');
const job = require('../jobs/compressImg');

const queues = {
  bull: new Queue(job.key, {
    redis: {
      host: process.env.REDIS_HOTS,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
    },
  }),
  name: job.key,
  handle: job.handle,
  options: job.options,
};

module.exports = {
  queues,
  add(name, data) {
    return queues.bull.add(data, queues.options);
  },
  process() {
    queues.bull.process(queues.handle);

    queues.bull.on("failed", (job, err) => {
      console.log("Job failed", queues.key, job.data);
      console.log(err);
    });
    queues.bull.on("completed", (job, err) => {
      job.remove();
    });
  },
};