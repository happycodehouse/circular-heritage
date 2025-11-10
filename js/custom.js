const custom = {};
const mediaQuery = window.matchMedia("(min-width: 1025px)");
const body = document.body;
let lenis, scrollT, currentT, windowWidth, isTouchDevice;

gsap.registerPlugin(ScrollTrigger);

custom.utils = {
    smoothScroll: () => {
        function breakPoint(mediaQuery) {
            if (mediaQuery.matches) {
                if (!lenis) {
                    lenis = new Lenis({
                        duration: 1
                    });

                    lenis.on("scroll", ScrollTrigger.update);
                    gsap.ticker.add(function (time) {
                        lenis.raf(time * 1000);
                    });

                    gsap.ticker.lagSmoothing(0);
                }
            }
        }

        breakPoint(mediaQuery);
        mediaQuery.addEventListener("change", breakPoint);
    },
    dataMotion: () => {
        if ($("[data-motion]").length > 0) {
            $("[data-motion]").each((idx, item) => {
                ScrollTrigger.create({
                    id: "dataMotion" + idx,
                    trigger: $(item),
                    scrub: 0.5,
                    start: "top 70%",
                    markers: false,
                    invalidateOnRefresh: true,
                    onEnter: () => $(item).addClass("active"),
                    // onLeaveBack: () => $(item).removeClass("active")
                });
            });
        }
    },
    circularMotion: () => {
        const
            $header = $("header"),
            $secHeritage = $(".sec_heritage"),
            $timelineWrap = $("#timelineWrap"),
            $timelineItem = $timelineWrap.find("li"),
            $quarterBox = $("#quarterBox"),
            $circleImgList = $("#circle").find("ul"),
            $circleImg = $circleImgList.find("li"),
            $descArea = $secHeritage.find(".desc_area"),
            $desc = $descArea.find(".desc"),
            $descTxt = $desc.find("li");

        let pcSecHeritageTl,
            moSecHeritageTl,
            moDescTl,
            isPc = false,
            mouseenterTimeout;

        function pcInit(){
            $timelineWrap.removeClass("fixed");
            $timelineItem.eq(0).addClass("active");
            $circleImgList.eq(0).find("li").eq(0).addClass("active");
            $desc.find("li").eq(0).addClass("active");
        }

        function moInit() {
            $circleImg.removeClass("active");
            $descTxt.removeClass("active");
        }

        $desc.find("li").on("mouseenter", function () {
            clearTimeout(mouseenterTimeout);
            mouseenterTimeout = setTimeout(() => {
                let _$this = $(this);
                let _$thisYear = $(this).data("year");

                _$this.siblings().removeClass("active");
                _$this.addClass("active");

                $circleImg.each(function () {
                    if ($(this).data("year-img") === _$thisYear) {
                        $circleImg.removeClass("active");
                        $(this).addClass("active");
                    }
                });
            }, 250);
        });

        function scrollToItem(idx) {
            let _$scroll = $timelineWrap.find(".scroll");
            let _$item = $timelineItem.eq(idx);

            if (_$item.length > 0) {
                let _scrollLeft = _$item.position().left + _$item.outerWidth() / 2 - _$scroll.outerWidth() / 2;
                _$scroll.animate({ scrollLeft: _scrollLeft }, 300);
            }
        }

        function activeTimeline(idx) {
            if (idx === -1) {
                idx = 0;
            }

            if (isPc) {
                $timelineItem.removeClass("active").eq(idx).addClass("active");
                $circleImg.removeClass("active");
                $circleImgList.eq(idx).find("li").eq(0).addClass("active");
                $descTxt.removeClass("active");
                $desc.eq(idx).find("li").eq(0).addClass("active");

                gsap.to($descArea, {
                    translateY: 100 * -idx + "vh",
                    ease: "power1.easeOut"
                });
                gsap.to($quarterBox, {
                    rotate: (90 * idx) + "deg",
                    ease: "power1.easeOut"
                });
            } else {
                gsap.to(window, {
                    scrollTo: $desc.eq(idx).offset().top,
                    ease: "none",
                    onComplete: () => scrollToItem(idx)
                });
            }
        }

        ScrollTrigger.matchMedia({
            // PC
            "(min-width: 1025px)": function() {
                pcSecHeritageTl = gsap.timeline({
                    scrollTrigger: {
                        id: "pcSecHeritageTl",
                        trigger: $secHeritage,
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 1,
                        invalidateOnRefresh: true,
                        markers: false
                    }
                }).to($(".blank"), {
                    y: 100,
                    ease: "none"
                });

                $timelineItem.each(function(idx) {
                    pcSecHeritageTl.to({}, {
                        onStart: () => activeTimeline(idx),
                        onReverseComplete: () => {
                            activeTimeline(idx - 1);
                        }
                    });
                });
            },
            // 모바일
            "(max-width: 1024px)": function() {
                moSecHeritageTl = gsap.timeline({
                    scrollTrigger: {
                        id: "moSecHeritageTl",
                        trigger: $secHeritage,
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 1,
                        invalidateOnRefresh: true,
                        markers: false,
                        onEnter: () => {
                            $timelineWrap.addClass("fixed");
                            $header.css("opacity", "0");
                        },
                        onLeaveBack: () => {
                            $timelineWrap.removeClass("fixed");
                            $header.css("opacity", "1");
                        }
                    }
                });

                $desc.each(function (idx, item) {
                    moDescTl = gsap.timeline({
                        scrollTrigger: {
                            trigger: $(item),
                            start: "top-=" + $timelineWrap.height() * 2 + " top",
                            end: "bottom bottom",
                            scrub: 1,
                            invalidateOnRefresh: true,
                            markers: false,
                            onEnter: () => {
                                $timelineItem.removeClass("active");
                                $timelineItem.eq(idx).addClass("active");
                                scrollToItem(idx);
                            },
                            onLeaveBack: () => {
                                $timelineItem.removeClass("active");
                                $timelineItem.eq(idx - 1).addClass("active");
                                scrollToItem(idx);

                                if (idx === 0) {
                                    $timelineItem.removeClass("active");
                                    $timelineItem.eq(0).addClass("active");
                                }
                            }
                        }
                    })
                })
            }
        });

        $timelineItem.on("click", function () {
            let idx = $(this).index();
            activeTimeline(idx);
        });

        function breakPoint(mediaQuery){
            if (mediaQuery.matches) {
                // pc
                pcInit();
                isPc = true;
            } else {
                // mo
                moInit();
                isPc = false;
            }
        }

        breakPoint(mediaQuery);
        mediaQuery.addEventListener("change", breakPoint);
    },
    init: () => {
        custom.utils.smoothScroll();
        custom.utils.dataMotion();
        custom.utils.circularMotion();
    }
}

$(window).on('load resize', function () {
    windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    isTouchDevice = (getComputedStyle(document.documentElement).getPropertyValue("--pointer")) == "coarse";
});

custom.utils.init();