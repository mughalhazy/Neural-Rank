const creativeMessagingLayerService = require("../../../modules/creative-messaging-layer/service");

function createCreativeMessagingCompatibilityAdapter() {
  return {
    moduleKey: "creative_messaging_layer",
    domainKey: "content_operations",
    run: creativeMessagingLayerService.run,
  };
}

module.exports = {
  createCreativeMessagingCompatibilityAdapter,
};
