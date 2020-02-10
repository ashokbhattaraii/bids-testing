import Service from "./service";

$(document).ready(function() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
  localStorage.removeItem("permissions");

  $("#loginForm").submit(async e => {
    e.preventDefault();
    hideMessages();

    try {
      let data = await Service.login({
        username: $("input[name='username']").val(),
        password: $("input[name='password']").val()
      });

      if (data) {
        window.location.replace("/passport-control");
      }
    } catch (e) {
      $("#msg").html(e.message);
      $("#msg").show();
    }
  });

  $("#frmForgotPass").submit(async e => {
    e.preventDefault();
    hideMessages();

    try {
      let data = await Service.forgetPassword({
        email: $("#forgot_email").val()
      });

      $("#info").html("Please check your email for further instructions.");
      $("#info").show();
      $("#forgotPassModal").modal("hide");
    } catch (e) {
      $("#info").html("Please check your email for further instructions.");
      $("#info").show();
      $("#forgotPassModal").modal("hide");
    }
  });
});

const hideMessages = () => {
  $("#msg").hide();
  $("#info").hide();
};
