$(document).ready(function () {
    var mscPillsOnPage = false;
    $(".msc-nav-pills.msc-nav-pills-vertical").each(function () {
        mscPillsOnPage = true;
    })
    if (mscPillsOnPage == true) {
        $(".msc-nav-pills.msc-nav-pills-vertical").append("<div class='msc-nav-indicator'></div>")

        $(".msc-nav-pills.msc-nav-pills-vertical .msc-nav-indicator").css({ "top": ($(".msc-nav-pills.msc-nav-pills-vertical .msc-nav-link").position().top + 18) + "px" });

        $(".msc-nav-pills.msc-nav-pills-vertical .msc-nav-link").click(function () {
            $(".msc-nav-pills.msc-nav-pills-vertical .msc-nav-indicator").css({ "top": ($(this).position().top + 18) + "px" });
        })
    }

    $(".msc-bar").click(function () {
        $(".msc-bar").toggleClass("show");
        $(".msc-menu").toggleClass("show");
        $("html, body").toggleClass("overflow-y-hidden");
    });
    $('#ShowPassword').click(function (e) {
        e.preventDefault();
        $("#passWord").attr('type', 'text');
        $(this).fadeOut('slow');
        $('#HidePassword').fadeIn('slow');
    });
    $('#HidePassword').click(function (e) {
        e.preventDefault();
        $("#passWord").attr('type', 'password');
        $(this).fadeOut('slow');
        $('#ShowPassword').fadeIn('slow');
    });
});
$(document).ready(function () {
    $(".msc-date-picker").datepicker({
        changeMonth: true,
        changeYear: true,
        // minDate: '+0D',
        dateFormat: 'dd/mm/yy',
        // maxDate: '+3Y',
        yearRange: "1830:2999",
        // showAnim: "explode",
    })
    // $('.msc-time-picker').timepicker({
    //     timeFormat: 'h:mm p',
    //     interval: 15,
    //     minTime: '9:00am',
    //     maxTime: '6:00pm',
    //     // defaultTime: '9:00am',
    //     // startTime: '9:00',
    //     dynamic: false,
    //     dropdown: true,
    //     scrollbar: true
    // });

    // function mscDetectLocation(){
    //     if (navigator.geolocation) {
    //         return navigator.geolocation.getCurrentPosition(mscGetCityName);
    //       }
    // }

    // function mscGetCityName(position){
    //     let lat = position.coords.latitude;
    //     let long = position.coords.longitude;
    //     // console.log(lat+" "+long)
    //     $.ajax({
    //         type: "GET",
    //         url: "https://api.mapbox.com/geocoding/v5/mapbox.places/"+long+","+lat+".json?limit=1&access_token="+window.MAPBOX_ACCESS_TOKEN,
    //         beforeSend: ()=>{
    //             $("#msc-get-location-trigger").addClass("msc-anime-rotate")
    //             $("#msc-get-location-mobile-trigger").addClass("msc-anime-rotate")
    //         },
    //         success: function (response) {
    //             if (response) {
    //                 $("#msc-get-location-trigger").removeClass("msc-anime-rotate")
    //                 $("#msc-get-location-mobile-trigger").removeClass("msc-anime-rotate")
    //                 $("#msc-header-location").html(response.features[0].context[2].text)
    //                 $("#msc-mobile-header-location").html(response.features[0].context[2].text)
    //             }else{
    //                 $("#msc-header-location").html("Location")
    //             }
    //         }
    //     });
    //     // $("#msc-get-location-trigger").removeClass("msc-anime-rotate")
    //     //             $("#msc-get-location-mobile-trigger").removeClass("msc-anime-rotate")
    //     //             $("#msc-header-location").html("Jind")
    //     //             $("#msc-mobile-header-location").html("Jind")
    //     // return res
    // }

    // $("#msc-get-location-trigger").click(()=>{mscDetectLocation()});
    // $("#msc-get-location-mobile-trigger").click(()=>{mscDetectLocation()});
    // mscDetectLocation();

    // console.log(mscDetectLocation())
//     function getLocation() {
//         if (navigator.geolocation) {
//           navigator.geolocation.getCurrentPosition(showPosition);
//         } else {
//           console.log("Geolocation is not supported by this browser.");
//         }
//       }

//       function showPosition(position) {
//         console.log("Latitude: " + position.coords.latitude +
//         "Longitude: " + position.coords.longitude);
//       }
// getLocation()

    //   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    // console.log(mscGetCityName())
    // $(window).scroll(function () {
    //     if ($(window).width() < 1000) {
    //         if ($(this).scrollTop() > 100) {
    //             $(".msc-header").css({ "position": "fixed", "top": 0, })
    //             $("body, html").css({ "margin-top":"50px"})
    //         } else if ($(this).scrollTop() < 0) {
    //             $(".msc-header").css({ "position": "static", "top": 0, })
    //             $("body, html").css({ "margin-top":"0px"})
    //         }
    //     } else {
    //     }
    // });
    function RequestRespone(status = "success", url = "") {
        switch (status) {
            case "success":
                if (url == "") {
                    return true;
                } else {
                    window.location.href = url;
                }

                break;
            case "failed":
                if (url == "") {
                    return true;
                } else {
                    window.location.href = url;
                }

                break;
            case "reload":
                return window.location.reload();
                break;
            case "redirect":
                if (url == "") {
                    window.location.reload();
                } else {
                    window.location.href = url;
                }

                break;
            default:
                break;
        }
    }

    $('.msc-home-category-carousel').owlCarousel({
        loop: true,
        animateOut: 'animate__animated animate__fadeOutLeft',
        animateIn: 'animate__animated animate__fadeInRight',
        smartSpeed: 1200,
        margin: 10,
        nav: false,
        autoplay: true,
        autoplayTimeout: 3000,
        dots: true,
        responsive: {
            0: {
                items: 2
            },
            600: {
                items: 3
            },
            1000: {
                items: 6
            }
        }
    })
    $('.msc-banner-carousel').owlCarousel({
        loop: true,
        animateOut: 'animate__animated animate__fadeOutLeft',
        animateIn: 'animate__animated animate__fadeInRight',
        smartSpeed: 1200,
        margin: 10,
        nav: false,
        autoplay: true,
        autoplayTimeout: 3000,
        dots: true,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 1
            },
            1000: {
                items: 1
            }
        }
    })
    $('.msc-testimonial-carousel').owlCarousel({
        loop: true,
        // animateOut: 'animate__animated animate__fadeOutLeft',
        // animateIn: 'animate__animated animate__fadeInRight',
        smartSpeed: 1200,
        margin: 0,
        nav: true,
        autoplay: true,
        autoplayTimeout: 5000,
        dots: false,
        responsive: {
            0: {
                items: 1
            },
            600: {
                items: 1
            },
            1000: {
                items: 2
            }
        }
    })
    $(".msc-btn-password").click(function () {
        if ($("input[type=password]#" + $(this).data("target")).attr("type") == "password") {
            $("input[type=password]#" + $(this).data("target")).attr("type", "text");
            $(this).children("span").removeClass("fa-eye").addClass("fa-eye-slash");
        } else {
            $("input[type=text]#" + $(this).data("target")).attr("type", "password");
            $(this).children("span").removeClass("fa-eye-slash").addClass("fa-eye");
        }
    })
    $(document).on("click", ".msc-toast-close", function () {
        $(this).parent().hide(200);
    })

    $("#msc-register-form").submit(function (e) {
        e.preventDefault();
        if ($(".msc-register-btn").val() != "otp") {
            var mobile = $("#msc-mobile").val(mscFetchInt($("#msc-mobile").val()))
            var pass = $("#msc-password").val(mscFetchSpecialChars($("#msc-password").val()))
            var name = $("#msc-name").val(mscFetchSpecialChars($("#msc-name").val()))
            $("#msc-name").val(mscFetchSpecialChars($("#msc-name").val()))
            if (pass.val().length <= 6) {
                return mscToast("Warning", "Password length must be greater than 6 characters!");
            } else if (mobile.val().length !== 10) {
                return mscToast("Warning", "Please enter a valid mobile number!");
            } else if (name.val().length < 3 || name.val().length > 30) {
                return mscToast("Warning", "Name must contain atleast 3 and atmost 30 character!");
            }
        } else if ($(".msc-register-btn").val() == "otp") {
            var otp = $("#msc-otp").val(mscFetchInt($("#msc-otp").val()))
        }

        var data = $(this).serializeArray();
        $.ajax({
            type: "POST",
            url: $(this).attr("action"),
            data: data,
            beforeSend: () => {
                $(".msc-register-btn").html("Please Wait...").addClass("msc-waiting-wave").attr("disabled", "true");
            },
            success: function (response) {
                mscToast(response.title, response.msg, response.color);
                if (response.status == "success") {
                    $(".msc-register-btn").html("<i class='fas fa-check'></i> Account Created").removeClass("msc-waiting-wave").attr("disabled", "true");
                    setTimeout(() => {
                        window.location.href = "login";
                    }, 3000)
                } else {
                    if (response.status == "reload") {
                        window.location.reload();
                    } else {
                        $(".msc-register-btn").html("Register").removeClass("msc-waiting-wave").removeAttr("disabled");
                        $("#msc-register-form").trigger("reset");
                    }
                }
            }
        });
    })
    $("#msc-resend-otp").click(() => {
        var target = $("#msc-resend-otp").attr("data-msc-target");
        var form = $("#" + target);
        if ($("#msc-resend-otp").attr("disabled") == true) {
            mscToast("Please Wait", "Wait until the time over.")
        } else {
            $.ajax({
                type: "POST",
                url: form.attr("action"),
                data: { "_token": $("meta[name=msc_token]").attr("content"), "resend_otp": true },
                success: function (response) {
                    if (response.status == "success") {
                        mscToast(response.title, response.msg, response.color);
                        $("#msc-resend-otp").attr("disabled", true)
                        var timer_count = 30;
                        setInterval(() => {
                            $("#msc-resend-otp").text(timer_count - 1);
                        }, 1000);
                        setTimeout(() => {
                            $("#msc-resend-otp").removeAttr("disabled")
                        }, 30000)
                    } else {
                        mscToast(response.title, response.msg, response.color);
                    }
                }
            });
        }
    })
    $("#msc-login-form").submit(function (e) {
        e.preventDefault();
        var mobile = mscFetchInt($("#msc-login-form #msc-mobile").val())
        var otp = mscFetchInt($("#msc-login-form #msc-otp").val())
        // console.log(mobile);
        $("#msc-login-form #msc-mobile").val(mobile);
        var formData = $(this).serializeArray();
        // console.log(formData)
        if (mobile.length == 10) {
            $.ajax({
            type: "POST",
            url: $(this).attr("action"),
            data: { "_token": $("meta[name=msc_token]").attr("content"), "mobile": mobile, "otp": otp, "submit": true, "referal_code":mscFetchInt($("#msc-login-form #msc-referal-code").val()) },
            beforeSend: () => {
                $("#msc-login-form .msc-login-btn").addClass("msc-waiting-wave");
            },
            success: (response) => {
                if (response.status == "success") {
                    mscToast(response.title, response.msg, response.color);
                    $("#msc-login-form .msc-otp-container").addClass("msc-show");
                    $("#msc-login-form #msc-mobile").attr("readonly", true)
                    $("#msc-login-form .msc-otp-container #msc-otp").removeAttr("disabled");
                    $("#msc-login-form .msc-referal-code-container #msc-referal-code").removeAttr("disabled");
                    $("#msc-login-form .msc-login-btn").removeClass("msc-waiting-wave").html("Login");
                    if (response.referal_code == "success") {
                        $("#msc-login-form .msc-referal-code-container").addClass("msc-show");
                    }

                    if (response.url) {
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000)
                    }
                } else {
                    mscToast(response.title, response.msg, response.color);
                    $("#msc-login-form .msc-login-btn").removeClass("msc-waiting-wave");
                }
            }
        })
        }else{
            mscToast("Warning", "Please enter a valid mobile number", "danger", "exclamation-circle");
        }
    });

    // $(".msc-location").text(mscDetectLocation())
    $(".msc-autofill-location-trigger").click(function(){
        navigator.geolocation.getCurrentPosition((position)=>{
            let lat = position.coords.latitude;
            let long = position.coords.longitude;
            // console.log(lat+" "+long)
            $.ajax({
                type: "GET",
                url: "https://api.mapbox.com/geocoding/v5/mapbox.places/"+long+","+lat+".json?limit=1&access_token="+window.MAPBOX_ACCESS_TOKEN,
                beforeSend: ()=>{
                    $(".msc-autofill-location-trigger").html('<div class="d-flex justify-content-center msc-text-theme-white align-items-center"><div class="spinner-border text-white spinner-border-sm me-2" role="status"><span class="visually-hidden">Loading...</span></div>Please Wait</div>').attr("disabled", true)
                },
                success: (response)=>{
                    $(".msc-autofill-location-trigger").html('<i class="fas fa-map-marker-alt"></i> Detect Location').removeAttr("disabled")
                    console.log(response.features[0])
                    $("#address").val(response.features[0].text+", "+response.features[0].context[1].text)
                    $("#pincode").val(response.features[0].context[0].text)
                    $("#city").val(response.features[0].context[2].text)
                    $("#state").val(response.features[0].context[3].text)
                    $("#country").val(response.features[0].context[4].text)
                }
            })
        })
    })
    $(document).on('focusout', $(".msc-form-control"), function(el) {
        $(el.target).val(mscFetchSpecialChars($(el.target).val()));
    });
});
$("#msc-lost-password-form").submit(function (e) {
    e.preventDefault();
    var password_screen = false;
    var mobile_screen = false;
    $("input[type=password]").each(function () {
        password_screen = true
    })
    $("#msc-mobile").each(function () {
        mobile_screen = true
    })
    if (mobile_screen == true) {
        var mobile = $("#msc-mobile").val(mscFetchInt($("#msc-mobile").val()))
    }

    if (password_screen == true) {
        var new_pass = $("#msc-new-password").val(mscFetchSpecialChars($("#msc-new-password").val()))
        var confirm_pass = $("#msc-confirm-password").val(mscFetchSpecialChars($("#msc-confirm-password").val()))
    }

    console.log(mobile_screen + " " + password_screen)
    if (password_screen == true && new_pass.val().length <= 6) {
        return mscToast("Warning", "New Password length must be greater than 6 characters!");
    }

    if (password_screen == true && new_pass.val() !== confirm_pass.val()) {
        return mscToast("Warning", "Password doesn't matched!");
    } else if (mobile_screen == true && mobile.val().length <= 3) {
        return mscToast("Warning", "Please enter a valid mobile number");
    } else {
        var data = $(this).serializeArray();
        $.ajax({
            type: "POST",
            url: $(this).attr("action"),
            data: data,
            beforeSend: () => {
                $(".msc-login-btn").html("Please Wait...").addClass("msc-waiting-wave").attr("disabled", "true");
            },
            success: function (response) {
                mscToast(response.title, response.msg, response.color);
                if (response.status == "success") {
                    $(".msc-login-btn").html("<i class='fas fa-check'></i> Logged In").removeClass("msc-waiting-wave").attr("disabled", "true");
                    setTimeout(() => {
                        window.location.href = "account";
                    }, 3000)
                } else {
                    RequestRespone(response.status, response.url)
                    $(".msc-login-btn").html("Login").removeClass("msc-waiting-wave").removeAttr("disabled");
                    $("#msc-lost-password-form").trigger("reset");
                }
            }
        });
    }
})
$(".msc-otp-timer").html($(".msc-otp-timer").data("count") + " second")
setInterval(() => {
    $(".msc-otp-timer").data("count", ($(".msc-otp-timer").data("count") - 1))
    $(".msc-otp-timer").html($($(".msc-otp-timer")).data("count") + " second")
}, 1000)
setTimeout(() => {
    $(".msc-otp-link").removeClass("text-muted").text("Resend OTP").removeAttr("data-count disabled");
}, 3000);
$(".msc-otp-link").click(function () {
    $.ajax({
        type: "POST",
        url: "resend-otp",
        data: { "_token": $("meta[name=token]").attr("content") },
        beforeSend: () => { },
        success: function (response) {
            mscToast(response.title, response.msg, response.color, response.icon);
        }
    });
});
$(document).ready(function () {
    setInterval(() => {
        $(".msc-animated-translate").toggleClass('animate-now');
    }, 3000);
});
    // $("#msc-otp").hide(500)
    var ratedIndex = -1;
    $(document).ready(function () {
        $(".msc-rating-star").on('click', function () {
            ratedIndex = parseInt($(this).data('index'));
            $("#getRatedIndex").val(ratedIndex + 1);
        });
        reSetColorsStar();
        $(".msc-rating-star").mouseover(function () {
            reSetColorsStar();
            var currentIndex = parseInt($(this).data('index'));
            for (var i = 0; i <= currentIndex; i++)
                $('.msc-rating-star:eq(' + i + ')').css('color', '#ffc107');
        });
        $(".msc-rating-star").mouseleave(function () {
            reSetColorsStar();
            if (ratedIndex != -1)
                for (var i = 0; i <= ratedIndex; i++)
                    $('.msc-rating-star:eq(' + i + ')').css('color', '#ffc107');
        });
        function reSetColorsStar() {
            $(".msc-rating-star").css('color', '#b9b9b9');
        }
    });
$(document).ready(function () {
    $("#submitRating").on("submit",function(e){
        e.preventDefault();
        const comment = $("#comment").val();
        const listing_id = $("#defListingId").val();
        const receivedRating = $("#receivedRating").val();
        if(comment == ""){
            $(".alert-rat").html("Please enter remarks first!!");
        }else{
            const data = {'comment':comment,'listing_id':listing_id,'rating':receivedRating,'_token':$("meta[name=msc_token]").attr("content")};
            $.ajax({
                method: "post",
                url: "submit-review",
                data: data,
                dataType:"json",
                beforeSend:function () { $(".alert-rat").html('<i class="fa fa-spinner fa-spin"></i> Please wait we validating your details..').removeClass('text-danger').addClass('text-success'); },
                success: function (response) {
                    if(response.status == "success"){
                        $(".alert-rat").html("We have successfully save your review, once approved, it will bes published, Thankyou ❤️").addClass("text-success").removeClass('text-danger');
                        setTimeout(() => {
                            window.location.href= response.url;
                        }, 5000);
                    }else{
                        $(".alert-rat").html('<i class="fa fa-check"></i> '+ response.status).removeClass('text-success').addClass('text-danger');
                    }
                }
            });
        }

        // setTimeout(() => {
        //     $(".alert-rat").html('');
        // }, 5000);
        // console.log($(this).serializeArray());
    });
    // $("#loginFormModal").on('submit',function(e){
    //     e.preventDefault();
    //     const userMobileNo = $("#userMobileNo").val();
    //     const userName = $("#userName").val();
    //     const comment = $("#comment").val();
    //     const listing_id = $("#defListingId").val();
    //     const userSessionGet = $("#userSessionGet").val();
    //     const receivedRating = $("#receivedRating").val();
    //     const data = {'mobile':userMobileNo,'username':userName,'comment':comment,'list_id':listing_id,'rating':receivedRating,'_token':$("meta[name=msc_token]").attr("content")};
    //     if(userMobileNo == "" ){
    //         $(".login-alert").html("Please enter mobile no.");
    //     } else if(userName == ""){
    //         $(".login-alert").html("Please enter user name");
    //     }else{
    //         $(".login-alert").html('');
    //         $("#msc-otp-submit").attr("disabled","true");
    //         $.ajax({
    //             method: "post",
    //             url: "check-user-mobile-data",
    //             data: data,
    //             beforeSend:function () { $(".otp-alert").html('<i class="fa fa-spinner fa-spin"></i> Please wait we sending OTP on your mobile no..').removeClass('text-danger').addClass('text-success'); },
    //             success: function (response) {
    //                 if(response == "Thanks for rating us, you have already rated us."){
    //                     $(".login-alert").html(response).addClass("text-success");
    //                     $(".otp-alert").html('');
    //                     $("#userMobileNo").val('');
    //                     $("#userName").val('');
    //                     setTimeout(() => {
    //                         $(".login-alert").html('');
    //                     }, 5000);
    //                 }else{
    //                     $(".msc-rating-login-from").html('');
    //                     $(".msc-print-otp-form").html(response);
    //                     $(".otp-alert").html('');
    //                 }
    //             }
    //         });
    //     }

    //     setTimeout(() => {
    //         $(".login-alert").html('');
    //     }, 10000);
    // });
    // function checkUserData(list_id,mobile){
    //     $.ajax({
    //         method: "post",
    //         url: "check-user-rating",
    //         data: {"list_id":list_id,"mobile":mobile},
    //         success: function (response) {
    //             if(response == 1){
    //                 return true;
    //             }else{
    //                 return false;
    //             }
    //         }
    //     });
    // }

    // function checkOtpSession(){
    //     $.ajax({
    //         type: "get",
    //         url: "distroy-session-data",
    //         success: function (response) {
    //             if(response != "error"){
    //                 return true;
    //             }
    //         }
    //     });
    // }

    // setInterval(() => {
    //     checkOtpSession();
    // }, 60000);
    // $("#otp").keyup(function (e) {
    //     const otp = $(this).val();
    //     if(otp.length != 6){
    //         $(".otp-alert").html('enter 6 digit OTP');
    //     }else if(!parseInt(otp)){
    //         $(".otp-alert").html('enter numeric OTP only');
    //     }else{
    //         $.ajax({
    //             type: "post",
    //             url: "verifyOtp",
    //             data: {'otp':otp,'_token':$("meta[name=msc_token]").attr("content")},
    //             success: function (response) {
    //                 if(response=='success'){
    //                     $(".otp-alert").html('OTP matched, successfully').removeClass("text-danger").addClass('text-success');
    //                     $(".verifiyNsave").removeAttr("disabled");
    //                     $(".mpin-container").html("");
    //                 }else{
    //                     $(".otp-alert").html(response).removeClass('text-success').addClass('text-danger');
    //                 }
    //             }
    //         });
    //     }
    // });
    // $("#msc-otp-form").on("submit",function(e){
    //     e.preventDefault() ;
    //     var data = $(this).serializeArray();
    //     $.ajax({
    //         type: "post",
    //         url: "submit-review",
    //         data: data,
    //         dataType:"json",
    //         beforeSend:function(){
    //             $(".mpin-container").html("Please wait we saving your review....").addClass("text-success");
    //         },
    //         success: function (response) {
    //             if(response.status == "success"){
    //                 $(".mpin-container").html("We have successfully save your review, once approved, it will bes published, Thankyou 😊").addClass("text-success");
    //                setTimeout(() => {
    //                 window.location.href= response.url;
    //                }, 5000);
    //             }else{
    //                 $(".mpin-container").html(response.status).addClass("text-danger").removeClass("text-success");
    //             }
    //         }
    //     });
    // });
});
$(document).ready(function(){
    $('#msc-searchbox').autocomplete({
      source: "search-data",
      minLength: 3,
      select: function(event, ui)
      {
        $('#msc-searchbox').val(ui.item.value);
      }
    }).data('ui-autocomplete')._renderItem = function(ul, item){
      return $("<li class='ui-autocomplete-row'></li>")
        .data("item.autocomplete", item)
        .append(item.label)
        .appendTo(ul);
    };
  });
  function getCity_StateName(lat="",lng=""){
    $.get({
        url: "https://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lng+"&key=AIzaSyCBZLsyw3cWBaCwO1Nl8Gi5PlnuDhd62Rw",
        success: function(data)
        {
            data.results[3].address_components.forEach(function(element){
                // console.log(element.types);
                if(element.types[0] == 'locality' && element.types[1] == 'political') {
                    $(".getCityName").val(element.long_name);
                    $(".print-city-name").text(element.long_name);
                }

                if(element.types[0] == 'administrative_area_level_1' && element.types[1] == 'political') {
                    // console.log('State:')
                    // console.log(element.long_name);
                    document.getElementById("getMyState").value = element.long_name;
                    document.getElementById("getMyHiddenState").value = element.long_name;
                }

                if(element.types[0] == 'postal_code') {
                    $(".getPincode").val(element.long_name);
                }

                if( data.results[3].formatted_address) {
                    $(".getBusinessAddress").val(data.results[2].formatted_address);
                }
            });
        }
    })
}

  function getLocation() {
    $("#changeRequestIcn").removeClass('fa-search-location').addClass('fa-spinner fa-spin');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
      setTimeout(() => {
        $("#changeRequestIcn").removeClass('fa-spinner fa-spin').addClass('fa-check');
        $(this).css('');
      }, 2000);
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  function showPosition(position) {
    var lat = position.coords.latitude;
     var lng = position.coords.longitude;
   //  var latitude = toDegreesMinutesAndSeconds(lat);
   // var latitudeCardinal = lat >= 0 ? "N" : "S";

   // var longitude = toDegreesMinutesAndSeconds(lng);
   // var longitudeCardinal = lng >= 0 ? "E" : "W";
   $(".LatiTude").val(lat);
   $(".LongiTude").val(lng);
   getCity_StateName(lat,lng);
   // $(".LatiTude").val(latitudeCardinal+" "+latitude);
   // $(".LongiTude").val(longitudeCardinal+" "+longitude);
   }

   function getTopCityName(lat="",lng=""){
    $.get({
        url: "https://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lng+"&key=AIzaSyCBZLsyw3cWBaCwO1Nl8Gi5PlnuDhd62Rw",
        success: function(data)
        {
            data.results[0].address_components.forEach(function(element){
                // console.log(element.types);
                if(element.types[0] == 'locality' && element.types[1] == 'political') {
                    $(".print-city-name").text(element.long_name);
                }
            });
        }
    })
}

   function detectLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showTopCityPosition);
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  function showTopCityPosition(position) {
    var lat = position.coords.latitude;
     var lng = position.coords.longitude;
     getTopCityName(lat,lng);
   }

//    detectLocation();

$(document).on("submit","#submitRequestForListing",function(e){
    e.preventDefault();
    let formData= $(this).serializeArray();

    $.ajax({
        type: "post",
        url: "save-listing-user-side",
        data: formData,
        dataType: "json",
        beforeSend:function(){
            $(".print-result-success").html('<i class="fas fa-spinner fa-spin"></i> wait, we are saving your data in to server, relax and wait...');
            $("#saveSubmitList").attr("disabled",true);
        },
        success: function (response) {
            $(".print-result-success").html('');
            if(response.status == "success"){
                $(".print-result-success").html('<i class="fas fa-check-circle"></i> we have successfully save your data, our agent will call you shortly');
                setTimeout(() => {
                    $("#saveSubmitList").css({'visibility':'hidden'}).attr('disabled',true);
                    $(".print-result-success").html('');
                    $(".print-result-error").html('');
                    $('#submitRequestForListing')[0].reset();
                    $("#getOTPId").css({'visibility':'hidden'}).attr('disabled',true);
                    $("#mobile_no").attr('readonly',true);
                    $("#print-otp").html('');
                }, 5000);
            }else{
                $("#saveSubmitList").removeAttr("disabled");
                $(".print-result-error").html('<i class="fas fa-exclamation"></i> '+response.status);
            }
        }
    });
})
$(document).on("submit","#msc-contact-form",function(e){
    e.preventDefault();
    let formData= $(this).serializeArray();
    $.ajax({
        type: "post",
        url: "save-user-email-query",
        data: formData,
        dataType: "json",
        beforeSend:function(){
            $(".print-query-success").html('<i class="fas fa-spinner fa-spin"></i> wait, we are saving your data in to server, relax and wait...');
            $("#submitQuery").attr("disabled",true);
        },
        success: function (response) {
            $(".print-query-success").html('');
            if(response.status == "success"){
                $(".print-query-success").html('<i class="fas fa-check-circle"></i> we have successfully save your request, our agent will call you shortly');
                setTimeout(() => {
                    $(".print-query-error").html('');
                    $('#msc-contact-form')[0].reset();
                    $("#submitQuery").removeAttr('disabled');
                }, 5000);
                setTimeout(() => {
                    $(".print-query-success").html('');
                }, 15000);
            }else{
                $(".print-query-error").html('<i class="fas fa-exclamation"></i> '+response.status);
                $("#submitQuery").removeAttr('disabled');
            }
        }
    });
});
// my query
var width = $("body").innerWidth();
if(width < 361){
//$(".hide-bbm-at-360").css({'display':'none'});
//$(".bbm-fz-at-360").css({'font-size':'20px'});
}
if(width < 1600){
// msc-main-listing-banner msc-business-listing-details
var getListBoxHeight = $('.msc-main-listing-banner').innerHeight() + $(".msc-business-listing-details").innerHeight();
var lastScrollPos = 0;
// console.log(getListBoxHeight);
$('#bottom-box').css('bottom','-' + getListBoxHeight + 'px');
$(window).scroll(function(){
    var currentScrollPos = $(window).scrollTop();
  
// console.log($(window).scrollTop());
   if( $(window).scrollTop() > getListBoxHeight+300 ){
        $('.msc-main-page-view').addClass('active-bottom-box').css('padding-top,transition',getListBoxHeight,'0.5s ease-in-out');
         $('#bottom-box').css('bottom',0);
       if(currentScrollPos < lastScrollPos)
           {
               $('#bottom-box').css('bottom','-' + getListBoxHeight + 'px');
           }
       lastScrollPos = currentScrollPos;
   }
    
    else{
        $('.msc-main-page-view').removeClass('active-bottom-box');
        
        
   }
});
}
