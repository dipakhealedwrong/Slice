$(document).ready(function () {

    // Navbar shadow on scroll
    $(window).scroll(function () {
        if ($(this).scrollTop() > 50) {
            $('.navbar').addClass('shadow');
        } else {
            $('.navbar').removeClass('shadow');
        }
    });

    // Smooth scroll for navbar links
    $('.nav-link').click(function (e) {

        if (this.hash !== "") {

            e.preventDefault();

            let hash = this.hash;

            $('html, body').animate({
                scrollTop: $(hash).offset().top - 70
            }, 800);
        }
    });

    // Feature card hover animation
    $('.feature-card').hover(
        function () {
            $(this).css({
                "transform": "translateY(-10px)",
                "transition": "0.3s"
            });
        },
        function () {
            $(this).css({
                "transform": "translateY(0)"
            });
        }
    );

    // Progress bar animation on scroll
    let animated = false;

    $(window).scroll(function () {

        let trackingSection = $("#tracking").offset().top - 400;

        if (!animated && $(window).scrollTop() > trackingSection) {

            animated = true;

            $(".progress-bar").each(function () {

                let width = $(this).css("width");

                $(this).css("width", "0");

                $(this).animate({
                    width: width
                }, 1500);

            });
        }

    });

    // Download button click effect
    $(".btn-dark").click(function () {

        let btn = $(this);

        if (btn.text() === "Download App" || btn.text() === "Get Started") {

            btn.text("Downloading...");

            setTimeout(function () {
                btn.text("Download Complete ✓");
            }, 2000);
        }
    });

    // Fade in sections while scrolling
    $("section").css({
        opacity: 0,
        position: "relative",
        top: "40px"
    });

    function revealSections() {

        $("section").each(function () {

            let top = $(this).offset().top;
            let scroll = $(window).scrollTop();
            let windowHeight = $(window).height();

            if (scroll > top - windowHeight + 150) {

                $(this).animate({
                    opacity: 1,
                    top: 0
                }, 700);
            }

        });
    }

    revealSections();

    $(window).scroll(function () {
        revealSections();
    });

});