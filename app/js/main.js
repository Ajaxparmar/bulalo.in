function mscToast(title = "Toast", msg = "This is a toast", color = "warning", icon = "", animation = "animate__slideInRight") {
    const toastID = "msc-toast__" + Math.floor(Math.random() * 100000);
    $(".msc-toast-container").append("<div id='" + toastID + "' class='msc-toast msc-toast-" + color + " animate__animated " + animation + "'><button class='btn msc-toast-close'><i class='fa fa-times' aria-hidden='true'></i></button><div class='msc-toast-title'><h5><i class='fas fa-" + icon + "'></i> " + title + "</h5></div><div class='msc-toast-text'><small>" + msg + "</small></div></div>");
    setTimeout(() => {
        $(".msc-toast#" + toastID).removeClass(animation).addClass(animation.replace("In", "Out"))
    }, 4000)
    setTimeout(() => {
        $(".msc-toast#" + toastID).remove();
    }, 5500)
}
function mscFetchInt(str) {
    return str.replace(/\D/g, '')
}
function mscFetchSpecialChars(str) {
    return str.replace(/[&\^\#+()$~%'";*?<>{}]/g, '')
}
function mscFetchURL(str) {
    return str.replace(/[&\^\#+()$~%'"*?<>{}]/g, '')
}
// function mscConfirm(title = "Confirm Modal", successBtnText = "Continue", cancelBtnText = "Cancel"){
//     $("#msc-confirmation-modal #msc-confirmation-modal-title").html(title);
//     $("#msc-confirmation-modal .msc-confirmation-response[data-response='1']").html(successBtnText);
//     $("#msc-confirmation-modal .msc-confirmation-response[data-response='0']").html(cancelBtnText);
//     $("#msc-confirmation-modal").modal("show");
//     $("#msc-confirmation-modal .msc-confirmation-response").click(function(){
//         if(response = $(this).data("response")){
//             if (response == 1) {
//                 $("#msc-confirmation-modal").modal("hide");
//                 return 1;
//             }else if (response == 0) {
//                 $("#msc-confirmation-modal").modal("hide");
//                 return;
//             }
//         }
//     })
// }
