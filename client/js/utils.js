export default {
  splitBlood: blood => {
    let rh_factor = blood.match(/\+|-/);
    rh_factor = rh_factor[0].toString();
    let group = blood.replace(/\+|-/, "");
    return { rh_factor, group };
  },
  copyText: id => {
    var text = "";
    let tableId = id.replace("Text", "");
    $(`#${tableId} tr`).each(function () {
      if ($(this)[0].style.display !== "none") {
        text += $(this).find("td").eq(1).text();
        text += " " + $(this).find("td").eq(2).text() + ", ";
      }
    });
    text = text.replace(/,\s*$/, "");
    var input = document.getElementById(id);
    input.setAttribute("value", text);

    var isiOSDevice = navigator.userAgent.match(/ipad|iphone/i);

    if (isiOSDevice) {
      var editable = input.contentEditable;
      var readOnly = input.readOnly;

      input.contentEditable = true;
      input.readOnly = false;

      var range = document.createRange();
      range.selectNodeContents(input);

      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      input.setSelectionRange(0, 999999);
      input.contentEditable = editable;
      input.readOnly = readOnly;
    } else {
      input.select();
    }
    document.execCommand("copy");
    if (text.length > 40) {
      $("#barText").text(text.substring(0, 30) + "...   copied.");
    } else {
      $("#barText").text(text + "   copied.");
    }
    $(".notification").toggleClass("active");
  }
};
