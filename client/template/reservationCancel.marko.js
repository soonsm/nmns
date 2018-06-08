// Compiled using marko@4.10.0 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_componentType = "/nmns$0.0.0/client/template/reservationCancel.marko",
    components_helpers = require("marko/src/components/helpers"),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_escapeXml = marko_helpers.x,
    marko_loadTag = marko_helpers.t,
    component_globals_tag = marko_loadTag(require("marko/src/components/taglib/component-globals-tag")),
    init_components_tag = marko_loadTag(require("marko/src/components/taglib/init-components-tag")),
    await_reorderer_tag = marko_loadTag(require("marko/src/taglibs/async/await-reorderer-tag"));

function render(input, out, __component, component, state) {
  var data = input;

  out.w("<html lang=\"en\"><head><meta charset=\"UTF-8\"><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><meta name=\"description\" content=\"\"><meta name=\"author\" content=\"\"><link rel=\"icon\" href=\"../../favicon.ico\"><title>" +
    marko_escapeXml(input.title) +
    "</title><link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css\"></head><body data-spy=\"scroll\" data-target=\".scrollspy\">");

  component_globals_tag({}, out);

  out.w("<nav class=\"navbar navbar-default\" role=\"navigation\"><div class=\"navbar-header\"><button class=\"navbar-toggle collapsed\" type=\"button\" data-toggle=\"collapse\" data-target=\"#undefined\" aria-expanded=\"false\" aria-controls=\"navbar\"><span class=\"sr-only\">Toggle navigation</span><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span><span class=\"icon-bar\"></span></button><a class=\"navbar-brand\">No More No Show</a></div><div class=\"collapse navbar-collapse\"><ul class=\"nav navbar-nav\"></ul></div></nav><div style=\"margin:10px\"><div class=\"panel panel-success\"><div class=\"panel-heading\"><h3 class=\"panel-title\">" +
    marko_escapeXml(input.message) +
    "</h3></div><div class=\"panel-body\"><p>" +
    marko_escapeXml(input.contents) +
    "</p></div></div></div><script src=\"https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js\"></script><script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js\"></script>");

  init_components_tag({}, out);

  await_reorderer_tag({}, out, __component, "29");

  out.w("</body></html>");
}

marko_template._ = marko_renderer(render, {
    ___implicit: true,
    ___type: marko_componentType
  });

marko_template.Component = marko_defineComponent({}, marko_template._);

marko_template.meta = {
    id: "/nmns$0.0.0/client/template/reservationCancel.marko",
    tags: [
      "marko/src/components/taglib/component-globals-tag",
      "marko/src/components/taglib/init-components-tag",
      "marko/src/taglibs/async/await-reorderer-tag"
    ]
  };
