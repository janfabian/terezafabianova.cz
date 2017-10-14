function gen_mail_to_link(lhs, rhs, subject) {
    document.write("<a href=\"mailto");
    document.write(":" + lhs + "@");
    document.write(rhs + "?subject=" + subject + "\">" + lhs + "@" + rhs + "<\/a>");
}

function onContactSubmit(data) {
  var $form = $("#contact-form");
  var formData = {};
  $form.find("[name]").each(function(i, el){
    var $el = $(el);
    formData[$el.attr("name")] = $el.val();
  });
  $.ajax({
    type: "POST",
    url: "https://api.terezafabianova.cz/sendEmail",
    data: JSON.stringify(formData),
    dataType: "json",
    contentType: "application/json; charset=utf-8"
  })
  .done(function(data) {
    alert("Vaše zpráva byla úspěšně odeslána");
    $form.find("[name]").val("");
  })
  .error(function(error) {
    alert(JSON.stringify(error));
  })
  .always(function() {
    grecaptcha.reset();
    $form.find("[type=submit]").prop("disabled", false);
  });
};
