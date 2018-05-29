// Compiled using marko@4.10.0 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/src/html").t(__filename),
    marko_componentType = "/nmns$0.0.0/views/index.marko",
    components_helpers = require("marko/src/components/helpers"),
    marko_renderer = components_helpers.r,
    marko_defineComponent = components_helpers.c,
    marko_helpers = require("marko/src/runtime/html/helpers"),
    marko_loadTag = marko_helpers.t,
    component_globals_tag = marko_loadTag(require("marko/src/components/taglib/component-globals-tag")),
    marko_escapeXml = marko_helpers.x,
    init_components_tag = marko_loadTag(require("marko/src/components/taglib/init-components-tag")),
    await_reorderer_tag = marko_loadTag(require("marko/src/taglibs/async/await-reorderer-tag"));

function render(input, out, __component, component, state) {
  var data = input;

  out.w("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1, shrink-to-fit=no\"><meta name=\"description\" content=\"\"><meta name=\"author\" content=\"\"><title>No More No Show</title><link href=\"/index/vendor/bootstrap/css/bootstrap.min.css\" rel=\"stylesheet\"><link href=\"/index/vendor/font-awesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\"><link href=\"https://fonts.googleapis.com/css?family=Montserrat:400,700\" rel=\"stylesheet\" type=\"text/css\"><link href=\"https://fonts.googleapis.com/css?family=Lato:400,700,400italic,700italic\" rel=\"stylesheet\" type=\"text/css\"><link href=\"/index/vendor/magnific-popup/magnific-popup.css\" rel=\"stylesheet\" type=\"text/css\"><link href=\"/index/css/freelancer.min.css\" rel=\"stylesheet\"><link href=\"/index/css/ko_font.css\" rel=\"stylesheet\"></head><body id=\"page-top\">");

  component_globals_tag({}, out);

  out.w("<nav class=\"navbar navbar-expand-lg bg-secondary fixed-top text-uppercase\" id=\"mainNav\"><div class=\"container\"><a class=\"navbar-brand js-scroll-trigger\" href=\"#page-top\">No More No Show</a><button class=\"navbar-toggler navbar-toggler-right text-uppercase bg-primary text-white rounded\" type=\"button\" data-toggle=\"collapse\" data-target=\"#navbarResponsive\" aria-controls=\"navbarResponsive\" aria-expanded=\"false\" aria-label=\"Toggle navigation\">Menu <i class=\"fa fa-bars\"></i></button><div class=\"collapse navbar-collapse\" id=\"navbarResponsive\"><ul class=\"navbar-nav ml-auto\"><li class=\"nav-item mx-0 mx-lg-1\"><a class=\"nav-link py-3 px-0 px-lg-3 rounded js-scroll-trigger godo normal w700\" href=\"#portfolio\">노쇼전적공유</a></li><li class=\"nav-item mx-0 mx-lg-1\"><a class=\"nav-link py-3 px-0 px-lg-3 rounded js-scroll-trigger godo normal w700\" href=\"#about\">예약취소간소화</a></li><li class=\"nav-item mx-0 mx-lg-1\"><a class=\"nav-link py-3 px-0 px-lg-3 rounded js-scroll-trigger godo normal w700\" href=\"#contact\">무료이용신청</a></li></ul></div></div></nav><header class=\"masthead bg-primary text-white text-center\"><div class=\"container\"><h1 class=\"text-uppercase mb-0\">No More No Show</h1><hr class=\"star-light\"><h2 class=\"godo normal w700\">노쇼전적 조회 - 노쇼 신고 - 예약취소 간소화</h2></div></header><section class=\"portfolio\" id=\"portfolio\"><div class=\"container\"><h2 class=\"text-center text-uppercase godo normal w700\">노쇼전적공유" +
    marko_escapeXml(input.messgae) +
    "</h2><hr class=\"star-dark mb-5\"><div class=\"row\"><div class=\"col-lg-10 ml-auto mr-auto\"><p class=\"lead godo normal w700\">앱 설치 없이 카톡으로 간편하게 노쇼전적을 공유합니다.</p></div></div><div class=\"row\"><div class=\"col-lg-10 ml-auto mr-auto\"><p class=\"lead godo normal w700\">카카오톡 상단 검색창에 \"노쇼그만\" 또는 \"nmns\" 검색하여 바로 사용 가능합니다.</p></div></div><div class=\"row\"><div class=\"col-lg-10 ml-auto mr-auto\"><p class=\"lead godo normal w700\">우리가게에서 발생한 노쇼, 다른 가게에서 발생한 노쇼 모두 공유됩니다.</p></div></div><div class=\"row\"><div class=\"col-lg-10 ml-auto mr-auto\"><img src=\"/index/img/nmns_find_regist.png\" class=\"img-fluid\" alt=\"Responsive image\"></div></div></div></section><section class=\"bg-primary text-white mb-0 godo normal w700\" id=\"about\"><div class=\"container\"><h2 class=\"text-center text-uppercase text-white\">예약취소 간소화</h2><hr class=\"star-light mb-5\"><div class=\"row\"><div class=\"col-lg-4 ml-auto\"><p class=\"lead\">고객이 예약취소를 위해 가게에 연락하는게 번거롭고 부담스러워서 노쇼가 더욱 발생한다는 사실을 알고 계신가요?</p></div><div class=\"col-lg-4 mr-auto\"><p class=\"lead\">고객이 따로 연락하지 않고 간단히 카카오톡 버튼만 눌러서 예약취소를 할 수 있게 예약취소 버튼을 카톡으로 보내보세요! 노쇼가 줄어들거에요 :)</p></div></div><hr class=\"star-light mb-5\"><div class=\"row\"><div class=\"col-lg-6 ml-auto\"><p class=\"lead\">점주님과 고객이 직접 연락할 필요없이 No More No Show에 예약고객전화번호만 입력하면 예약취소버튼이 전송됩니다 !!</p></div><div class=\"col-lg-6 mr-auto\"><p class=\"lead\">고객이 예약을 취소 할 때도 예약취소버튼만 누르면 점주님께 예약취소카톡이 전송됩니다.</p></div></div><div class=\"row\"><div class=\"col-lg-6 ml-auto\"><img src=\"/index/img/nmns_cancel_1.png\" class=\"img-fluid\" alt=\"Responsive image\"></div><div class=\"col-lg-6 mr-auto\"><img src=\"/index/img/nmns_cancel_2.png\" class=\"img-fluid\" alt=\"Responsive image\"></div></div></div></section><section id=\"contact\"><div class=\"container godo normal w700\"><h2 class=\"text-center text-uppercase text-secondary mb-0\">무료이용신청</h2><hr class=\"star-dark mb-5\"><div class=\"row\"><div class=\"col-lg-8 ml-auto mr-auto\"><p class=\"lead\">예약취소버튼 보내기 기능 사용을 위해서 아래 신청서를 작성해주세요 ^^</p><p class=\"lead\">이용신청이 완료되면 이메일로 회신이 갑니다.</p></div></div><div class=\"row\"><div class=\"col-lg-8 mx-auto\"><form name=\"sentMessage\" id=\"contactForm\" novalidate=\"novalidate\"><div class=\"control-group\"><div class=\"form-group floating-label-form-group controls mb-0 pb-2\"><label>상호명(띄어쓰기없이 작성)</label><input class=\"form-control\" id=\"name\" type=\"text\" placeholder=\"상호명(띄어쓰기없이 작성)\" required=\"required\" data-validation-required-message=\"상호명을 입력해주세요.\"><p class=\"help-block text-danger\"></p></div></div><div class=\"control-group\"><div class=\"form-group floating-label-form-group controls mb-0 pb-2\"><label>이용신청결과를 받을 이메일 주소</label><input class=\"form-control\" id=\"email\" type=\"email\" placeholder=\"이용신청결과를 받을 이메일 주소\" required=\"required\" data-validation-required-message=\"이메일을 입력해주세요.\"><p class=\"help-block text-danger\"></p></div></div><div class=\"control-group\"><div class=\"form-group floating-label-form-group controls mb-0 pb-2\"><label>예약취소 알림을 받을 휴대전화번호(번호만 입력)</label><input class=\"form-control\" id=\"phone\" type=\"tel\" placeholder=\"예약취소 알림을 받을 휴대전화번호(번호만 입력)\" required=\"required\" data-validation-required-message=\"전화번호를 입력해주세요.\"><p class=\"help-block text-danger\"></p></div></div><div class=\"control-group\"><div class=\"form-group floating-label-form-group controls mb-0 pb-2\"><label>예약취소가능시간(예: 3시간전까지 가능하면, '3시간' 입력)</label><input class=\"form-control\" id=\"phone\" type=\"tel\" placeholder=\"예약취소가능시간(예: 3시간전까지 가능하면, '3시간' 입력)\" required=\"required\" data-validation-required-message=\"예약취소가능시간을 입력해주세요.\"><p class=\"help-block text-danger\"></p></div></div><div class=\"control-group\"><div class=\"form-group floating-label-form-group controls mb-0 pb-2\"><label>예약고객에게 전달 할 메시지(예: 샵 방문 준비사항, 카카오톡 알림톡 정책 상 광고성 메시지는 포함할 수 없습니다.)</label><textarea class=\"form-control\" id=\"message\" rows=\"5\" placeholder=\"예약고객에게 전달 할 메시지(예: 샵 방문 준비사항, 카카오톡 알림톡 정책 상 광고성 메시지는 포함할 수 없습니다.)\" required=\"required\" data-validation-required-message=\"고객전달사항을 입력해주세요.\"></textarea><p class=\"help-block text-danger\"></p></div></div><br><div id=\"success\"></div><div class=\"form-group\"><button type=\"submit\" class=\"btn btn-primary btn-xl\" id=\"sendMessageButton\">제출</button></div></form></div></div></div></section><footer class=\"footer text-center\"><div class=\"container\"><div class=\"row\"><div class=\"col align-self-center\"><h4 class=\"text-uppercase mb-4\">Around the Web</h4><ul class=\"list-inline mb-0\"><li class=\"list-inline-item\"><a class=\"btn btn-outline-light btn-social text-center rounded-circle\" href=\"#\"><i class=\"fa fa-fw fa-facebook\"></i></a></li><li class=\"list-inline-item\"><a class=\"btn btn-outline-light btn-social text-center rounded-circle\" href=\"#\"><i class=\"fa fa-fw fa-instagram\"></i></a></li></ul></div></div></div></footer><div class=\"copyright py-4 text-center text-white\"><div class=\"container\"><small>Copyright &copy; nomorenoshow.com 2018</small></div></div><div class=\"scroll-to-top d-lg-none position-fixed \"><a class=\"js-scroll-trigger d-block text-center text-white rounded\" href=\"#page-top\"><i class=\"fa fa-chevron-up\"></i></a></div><script src=\"/index/vendor/jquery/jquery.min.js\"></script><script src=\"/index/vendor/bootstrap/js/bootstrap.bundle.min.js\"></script><script src=\"/index/vendor/jquery-easing/jquery.easing.min.js\"></script><script src=\"/index/vendor/magnific-popup/jquery.magnific-popup.min.js\"></script><script src=\"/index/js/jqBootstrapValidation.js\"></script><script src=\"/index/js/contact_me.js\"></script><script src=\"/index/js/freelancer.min.js\"></script>");

  init_components_tag({}, out);

  await_reorderer_tag({}, out, __component, "134");

  out.w("</body></html>");
}

marko_template._ = marko_renderer(render, {
    ___implicit: true,
    ___type: marko_componentType
  });

marko_template.Component = marko_defineComponent({}, marko_template._);

marko_template.meta = {
    id: "/nmns$0.0.0/views/index.marko",
    tags: [
      "marko/src/components/taglib/component-globals-tag",
      "marko/src/components/taglib/init-components-tag",
      "marko/src/taglibs/async/await-reorderer-tag"
    ]
  };
