/* hb.js — 藥戰手冊網頁（藥戰手冊 12）。放在 GitHub 網站上的一頁：hb.html（後端是藥戰手冊自己的 Apps Script 專案）。
 * 給：核可名單上的同事看手冊；開發者在這裡編輯、管理（核可名單、員工名單、設定）。
 * 登入：從 LINE「藥戰手冊」按「🌐 網頁」開，或代號登入（網頁出代號 → 貼到 LINE「藥戰手冊」→ 回 6 位數驗證碼）。
 * 閒置超過設定的分鐘數：自動登出、內容從畫面上拿掉。手冊內容只放在記憶體，不存進瀏覽器、不留在網址列。
 * 這個檔裡沒有任何手冊內容（章名、標題、內文、圖片都要登入、驗證後才向後端要）。
 * 原始碼在分支的 yz/（shared/rt.js、shared/cards.js、front/*.js），用 yz/build_front.py 組成這一個檔。 */
(function () {
/* ════════ logo ════════ */
var HB_LOGO_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"153 123 1009 1009\"><path fill=\"#064742\" fill-rule=\"evenodd\" d=\"M616.0 1094.2C567.2 1033.0 485.4 991.3 389.6 978.9C358.2 974.8 314.9 975.2 281.3 979.7L269.0 981.4L252.3 964.8C231.6 944.3 213.5 928.6 194.2 914.6C189.1 910.8 185.1 907.3 185.3 906.6C186.1 904.2 219.1 903.3 247.0 905.0C327.9 909.9 413.6 931.9 479.5 964.8C516.7 983.3 543.9 1002.2 572.3 1029.2C588.4 1044.4 596.9 1054.1 609.8 1071.4C623.4 1089.7 622.3 1088.5 624.0 1086.8C624.8 1085.9 628.0 1081.8 631.0 1077.5C669.0 1023.6 712.4 986.8 771.3 958.5C803.8 942.8 834.2 932.1 878.0 920.7C930.3 907.0 1006.5 900.1 1054.8 904.7C1062.5 905.4 1062.7 906.9 1055.6 912.0C1037.5 925.1 1003.3 954.7 987.8 970.9C982.4 976.4 977.4 981.0 976.7 981.0C976.0 981.0 969.2 980.1 961.5 979.0C885.2 968.3 802.8 981.1 733.5 1014.4C693.0 1033.8 660.8 1058.0 634.0 1088.9C628.3 1095.6 623.1 1101.0 622.5 1101.0C621.9 1101.0 618.9 1098.0 616.0 1094.2ZM609.0 1047.8C587.8 1021.0 559.6 993.7 533.3 974.6C479.2 935.2 376.1 895.9 298.0 884.9C290.0 883.8 283.1 882.4 282.5 881.9C281.9 881.3 280.3 876.1 278.9 870.2C276.8 861.8 276.5 859.2 277.5 858.2C282.0 853.3 333.9 851.8 359.0 855.8C433.7 867.9 503.3 902.4 553.0 952.0C583.5 982.4 602.9 1011.7 612.4 1041.9C615.9 1053.1 614.8 1055.1 609.0 1047.8ZM631.6 1049.1C630.5 1047.3 635.2 1028.2 641.6 1008.9C654.8 968.6 683.4 927.3 716.8 900.1C722.0 895.9 728.3 890.8 730.8 888.7C738.0 882.9 753.3 872.9 766.5 865.2C777.5 858.9 788.9 852.8 822.5 835.5C829.1 832.1 842.9 824.9 853.3 819.6L872.0 809.8L874.9 811.7C876.4 812.7 883.7 818.1 891.1 823.7C898.5 829.3 908.5 836.9 913.5 840.6C924.0 848.5 952.7 867.8 962.3 873.5C975.8 881.5 976.0 882.4 963.8 883.4C932.9 886.0 876.3 898.3 840.5 910.1C748.5 940.6 681.5 984.5 639.5 1041.8C633.5 1050.0 632.6 1050.8 631.6 1049.1ZM621.2 1008.8C619.5 994.1 615.5 975.6 611.4 962.6C607.6 950.8 594.8 923.3 588.7 913.7C584.1 906.6 584.0 905.6 588.2 906.3C590.0 906.6 595.3 907.6 600.0 908.4C632.7 914.4 669.2 903.6 689.5 881.9C703.1 867.4 709.8 851.4 708.7 836.3C707.8 823.9 702.0 814.3 689.9 805.2C671.3 791.1 643.2 782.6 587.5 774.0C550.8 768.3 528.5 759.7 514.7 745.7C495.7 726.6 495.3 699.6 513.8 675.7C519.8 667.8 528.7 660.6 541.8 653.1C558.0 643.9 595.0 629.6 597.2 631.8C599.1 633.7 592.7 642.3 578.5 657.0C567.2 668.7 563.8 672.9 560.7 679.0C552.7 695.0 552.3 711.1 559.6 725.1C567.6 740.3 582.5 748.5 619.5 758.1C659.3 768.3 681.9 776.6 696.6 786.3C708.6 794.2 709.5 791.7 698.8 780.4C691.1 772.4 681.0 765.5 668.5 759.9C664.4 758.0 661.0 755.9 661.0 755.2C661.0 753.2 666.2 749.1 668.8 749.0C670.1 749.0 675.0 750.6 679.8 752.6C710.9 765.4 730.9 784.0 738.0 806.6C744.7 828.2 739.5 852.9 724.2 872.2C721.0 876.2 709.5 888.0 698.7 898.4C687.8 908.7 676.3 920.7 673.0 924.9C654.3 948.6 640.2 974.3 630.4 1002.2C627.2 1011.5 624.1 1019.0 623.5 1019.0C622.8 1019.0 621.9 1014.8 621.2 1008.8ZM599.1 983.7C555.5 914.2 497.0 868.5 421.5 845.2C374.5 830.7 316.8 829.0 279.7 841.2C273.8 843.1 272.8 843.2 271.6 841.9C270.8 841.1 267.4 833.1 264.0 824.0C236.5 751.5 208.2 684.8 181.5 629.4C176.1 618.1 172.6 609.7 173.0 609.0C173.9 607.5 176.5 608.3 204.5 618.7C298.2 653.6 364.3 689.1 424.0 736.6C446.1 754.3 478.9 787.6 496.9 810.9C499.3 814.0 503.1 818.8 505.4 821.5C510.1 827.1 538.5 864.6 552.6 884.0C569.7 907.4 586.8 934.8 593.2 949.0C602.4 969.3 609.6 994.0 606.2 994.0C605.8 994.0 602.6 989.4 599.1 983.7ZM937.5 843.7C929.8 838.0 918.3 829.5 912.0 824.9C885.0 805.3 882.0 802.8 882.0 800.4C882.0 799.1 884.3 793.6 887.1 788.3C890.0 782.9 895.7 771.8 900.0 763.5C904.2 755.2 910.2 743.8 913.2 738.0C916.3 732.2 925.4 714.7 933.5 699.0C956.2 655.1 966.1 636.7 968.4 634.2C969.5 632.9 978.6 626.6 988.5 620.3C998.4 613.9 1008.5 607.4 1010.9 605.8C1015.6 602.7 1019.6 602.4 1021.3 605.1C1022.1 606.3 1021.7 609.2 1019.8 615.6C1013.3 638.0 1002.9 674.7 999.6 686.5C997.7 693.6 992.9 711.0 989.1 725.0C981.2 753.5 980.3 757.0 966.7 810.0C961.4 830.6 956.6 848.9 956.2 850.5C954.8 855.6 952.4 854.7 937.5 843.7ZM524.0 826.9C520.7 822.4 518.0 817.7 518.0 816.6C518.0 807.5 527.3 787.3 535.6 778.2L540.7 772.5L546.6 773.8C555.8 775.7 556.1 776.6 550.1 784.0C540.4 796.2 534.6 810.3 533.2 825.9C532.8 831.0 532.0 834.5 531.3 834.7C530.6 835.0 527.4 831.4 524.0 826.9ZM681.8 743.8C679.2 742.7 676.9 741.3 676.7 740.6C676.4 740.0 678.0 736.5 680.2 733.0C690.2 716.5 691.3 696.8 683.2 680.5C678.9 671.9 675.0 666.9 661.5 653.0C646.3 637.4 643.5 632.7 643.6 623.5C643.7 619.1 644.4 616.1 646.3 612.3C652.1 601.1 649.1 587.8 638.5 577.5C627.9 567.1 611.5 560.3 569.0 548.5C550.8 543.5 532.2 535.2 523.4 528.2C504.9 513.6 502.5 483.9 518.0 460.8C534.0 436.8 562.9 417.3 611.9 397.3C652.3 380.8 659.7 377.6 673.0 371.2C712.4 352.3 736.1 332.7 747.7 309.6C760.4 284.4 756.2 258.2 736.2 236.8C727.2 227.3 720.2 222.4 706.4 215.8C668.0 197.8 613.1 201.3 589.2 223.5C585.7 226.7 581.7 231.4 580.3 233.9C565.0 260.4 546.7 277.8 516.5 294.4C503.9 301.3 498.0 303.9 488.8 306.4C483.5 307.9 483.0 308.3 482.0 311.8C480.5 317.5 480.9 324.9 483.1 331.0C486.3 339.9 486.4 340.0 484.7 340.0C483.9 340.0 481.1 337.7 478.6 334.9C473.2 328.9 470.0 320.0 470.0 310.8C470.0 306.3 469.4 303.8 467.8 301.2C466.1 298.4 465.5 295.6 465.2 288.9C464.0 264.5 483.0 226.5 507.7 204.0C527.9 185.6 560.9 168.7 591.3 161.0C638.1 149.3 690.3 154.3 732.7 174.5C784.5 199.3 815.0 241.3 815.0 287.9C815.0 342.2 777.4 384.6 702.5 415.0C695.4 417.9 674.0 425.5 655.0 432.0C604.2 449.3 594.4 453.5 579.8 464.2C570.9 470.7 564.8 477.7 560.8 485.8C554.6 498.4 556.8 513.8 566.4 524.8C574.6 534.1 590.5 541.3 620.0 549.0C653.1 557.7 669.0 563.5 681.1 571.6C706.8 588.6 710.1 617.7 689.0 640.4C685.9 643.7 682.8 647.5 682.1 648.7C679.5 653.7 681.2 658.6 688.1 666.6C698.6 678.8 702.3 688.7 702.4 705.0C702.5 720.4 698.3 733.5 690.5 742.9C687.4 746.5 687.9 746.4 681.8 743.8ZM1122.5 688.9C1113.2 685.1 1097.4 678.6 1087.5 674.6C1041.4 655.8 1024.4 648.6 1022.8 647.1C1021.2 645.6 1021.4 644.4 1026.9 626.6C1030.0 616.1 1033.2 607.4 1033.9 607.2C1034.5 607.0 1037.6 608.7 1040.8 611.1C1049.4 617.5 1084.5 645.6 1092.6 652.4C1096.5 655.8 1105.9 663.7 1113.5 670.0C1145.7 696.8 1145.0 696.1 1141.3 695.9C1140.3 695.9 1131.8 692.8 1122.5 688.9ZM578.4 625.9C578.2 625.4 577.8 620.7 577.7 615.3C577.4 602.8 575.1 597.3 567.1 589.7C559.4 582.4 557.9 581.7 535.8 576.1C500.2 567.0 482.4 560.7 457.0 548.1C401.5 520.5 361.6 481.8 337.0 431.5C328.9 415.1 322.2 396.4 323.7 394.9C324.4 394.2 327.8 394.8 334.4 396.9C354.8 403.4 398.2 409.0 452.0 412.0C470.8 413.0 526.3 415.0 537.8 415.0C542.3 415.0 544.0 415.4 544.0 416.4C544.0 417.1 541.2 419.9 537.8 422.6C507.2 446.4 490.9 476.1 494.9 501.1C497.4 516.8 502.8 526.6 514.3 536.1C524.8 544.9 535.2 549.5 568.7 560.0C580.6 563.7 587.7 568.2 593.2 575.5C598.3 582.2 600.1 587.8 600.7 598.5C601.2 607.2 601.1 607.7 597.8 614.0C594.9 619.8 593.9 620.8 589.0 623.2C582.8 626.2 579.2 627.1 578.4 625.9ZM744.0 610.9C727.2 609.8 726.0 609.3 726.0 604.1C726.0 601.9 726.4 599.9 726.9 599.6C727.3 599.3 735.3 598.8 744.6 598.5C785.1 597.0 811.8 592.7 847.0 581.8C868.8 575.1 880.3 570.5 899.1 560.9C968.6 525.4 1017.8 466.4 1041.3 390.0C1043.8 382.0 1046.1 373.6 1046.5 371.2C1047.2 367.0 1049.2 365.6 1050.4 368.6C1051.4 371.3 1051.0 381.1 1049.5 391.5C1044.3 426.1 1027.7 462.5 1001.4 497.2C991.5 510.3 965.8 536.0 951.5 547.1C893.7 592.3 817.0 615.9 744.0 610.9ZM707.9 575.8C701.0 562.9 683.6 551.8 656.5 543.0C616.7 530.2 604.7 523.6 598.0 511.0C595.6 506.5 596.2 496.2 599.2 489.7C607.2 472.6 631.1 458.1 691.7 433.4C699.0 430.4 711.6 424.9 719.7 421.2L734.5 414.3L753.0 413.6C818.1 411.2 875.2 404.6 899.9 396.8C905.5 395.0 909.6 394.2 910.1 394.7C911.4 396.0 905.2 413.4 898.6 427.3C879.0 468.7 844.9 506.0 802.0 533.2C781.7 546.1 761.7 555.6 737.5 563.9C720.6 569.8 718.5 570.8 714.6 574.9C711.1 578.6 709.5 578.8 707.9 575.8ZM482.5 398.9C413.9 396.8 342.0 390.1 326.2 384.2C320.7 382.1 319.5 379.1 323.2 376.6C332.6 370.4 387.4 365.6 477.0 363.0C529.8 361.5 662.0 361.7 662.0 363.3C662.0 364.7 646.4 371.8 622.9 381.0C614.4 384.3 600.5 390.0 592.0 393.5L576.5 400.0L541.5 399.8C522.2 399.8 495.7 399.3 482.5 398.9ZM768.4 396.9C767.6 395.6 767.3 396.0 778.0 387.9C782.7 384.4 790.5 377.7 795.3 373.1L804.2 364.6L811.3 364.8C846.8 366.0 890.1 370.4 904.9 374.4C919.1 378.3 915.2 383.7 896.0 387.0C892.4 387.6 887.0 388.5 884.0 389.0C869.2 391.6 854.1 393.1 813.0 396.0C781.7 398.3 769.4 398.5 768.4 396.9ZM522.3 250.1C526.1 246.6 528.8 241.2 529.2 236.4C529.5 233.0 529.2 232.5 527.3 232.2C524.7 231.8 516.3 236.0 513.3 239.2C508.5 244.4 505.2 256.2 508.2 257.3C510.0 257.9 518.9 253.4 522.3 250.1Z\"/><path fill=\"#A78448\" fill-rule=\"evenodd\" d=\"M604.1 897.9C590.4 895.2 578.3 889.0 568.1 879.4C541.0 853.9 540.2 813.4 566.3 786.7L573.0 779.7L579.8 780.3C591.1 781.4 629.7 788.6 641.8 791.9C664.9 798.2 679.6 805.4 688.0 814.6C693.7 820.8 695.0 824.4 695.0 834.3C695.0 864.8 672.4 890.5 639.4 897.5C631.9 899.1 611.4 899.3 604.1 897.9ZM633.0 752.4C630.0 751.6 624.6 750.6 621.0 750.0C589.5 744.9 572.0 731.2 568.8 709.2C567.7 701.9 567.8 700.5 569.9 692.9C573.0 681.2 575.4 677.6 591.0 661.5C608.9 642.9 611.7 637.3 614.0 614.4C615.6 598.4 612.6 585.0 605.0 574.8C603.4 572.5 602.0 570.2 602.0 569.8C602.0 566.6 616.9 573.5 624.5 580.2C627.1 582.5 630.2 586.7 632.1 590.5C635.6 597.7 635.7 600.8 632.5 615.0C628.9 631.3 633.3 642.6 649.6 658.7C667.5 676.5 672.1 683.7 674.1 697.5C676.7 715.0 667.9 733.3 652.2 743.0C649.6 744.6 645.8 747.7 643.8 750.0C641.8 752.2 639.8 754.0 639.3 753.9C638.9 753.8 636.0 753.2 633.0 752.4ZM1002.6 511.2C1002.3 510.8 1003.9 508.4 1006.0 505.9C1008.1 503.4 1014.1 495.3 1019.4 487.9C1036.1 464.5 1037.3 462.8 1045.5 454.6C1062.4 437.4 1085.7 426.1 1109.1 423.4C1116.6 422.6 1116.9 423.4 1113.5 433.6C1102.0 467.5 1082.6 489.4 1053.6 501.2C1036.4 508.3 1004.6 514.5 1002.6 511.2ZM961.3 508.2C959.7 507.0 950.2 489.9 946.4 481.2C939.6 465.4 937.7 455.6 937.6 437.5C937.6 421.1 938.6 413.5 943.1 396.8C946.3 385.0 946.6 385.0 957.3 396.1C972.0 411.3 978.5 424.4 981.2 444.0C983.4 460.6 979.2 480.1 969.4 499.1C965.0 507.6 963.3 509.5 961.3 508.2ZM1014.8 420.2C999.8 399.1 990.2 379.0 984.8 357.0C982.8 348.7 982.5 345.1 982.5 328.0C982.6 310.2 982.8 307.5 985.3 297.5C989.7 279.8 994.3 265.8 995.8 265.2C998.8 264.1 1012.5 282.3 1021.5 299.2C1036.6 327.6 1039.4 359.7 1029.9 397.5C1027.6 406.8 1022.4 421.9 1020.8 423.7C1019.1 425.7 1018.4 425.3 1014.8 420.2Z\"/></svg>";   // 第 40 批：藥戰手冊的 LOGO（向量）

/* ════════ pdf ════════ */
var HB_PDF_V = "345a5b5057";   // 第 43 批：hbpdf.js、hbcmap.js 的版本（換了才重新下載）

/* ════════ rt.js ════════ */
/* rt.js — 「格式文字」：粗體、斜體、底線、刪除線、文字顏色、文字大小、標題、分隔線、標註、引用、連結到標題。
 * 存起來的就是一段普通文字，格式用方括號標記（[b]粗體[/b]、[c=red]紅字[/c]）；沒有標記的舊內容照原樣顯示。
 * 純函式、不碰畫面，寫法照 Apps Script（函式名字尾有底線），之後原封不動搬進 LINE 專案的「藥戰手冊」檔。
 *
 * 一行的寫法：
 *   開頭（可有）：[h1]～[h4] 標題　[hr] 分隔線　[q] 引用　[box=info|warn|bad|ok] 標註　[go=標題代號] 連結到標題
 *               第 39 批：標註多了紫（purple）、灰（gray）；符號可以另外選：[box=顏色-符號]，例如 [box=warn-pin]（黃框📌）、[box=info-none]（藍框、不要符號）
 *               [img=圖的代號] 一張圖（第 28 批：文字和圖片放在同一塊；圖的網址、圖說放在這一塊的 pics 裡）
 *               [tbl=表格的代號] 一張表格（第 29 批：表格也能「併到上一塊」；表格的內容放在這一塊的 tbls 裡）
 *   行內（可疊）：[b]粗體[/b]　[i]斜體[/i]　[u]底線[/u]　[s]刪除線[/s]　[c=red]顏色[/c]　[z=lg]大小[/z]　[m=yellow]螢光筆[/m]（第 30 批）
 *   公式（第 31 批）：[fx]1/6[/fx]　裡面照 Word 的打法（1/6＝上下排的分數、m^2、C_max、√(…)）；整個公式算一個字，不能從中間切開
 *   反灰可複製（第 32 批）：[cp]要給藥師複製的字[/cp]　灰底的一條，旁邊一顆「📋 複製」（網頁、LINE 都是按了就複製好）；裡面是一般的字（不放格式），一樣不能從中間切開
 *   縮排：開頭的全形空格（一格＝一層，最多 3 層）
 *   字本身有「[b]」這種長得像標記的字，寫成「[[b]」（兩個左括號）；其他情況不用管。
 *   標記只管「這一行」，不會跨行。 */

var YZ_RT_COLOR_ORDER = ["gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"];
// 字的顏色（白底上的對比都 ≥ 4.5:1，手機上看得清楚）
var YZ_RT_COLORS = { gray: "#6B7280", brown: "#92572A", orange: "#C2410C", yellow: "#A16207", green: "#15803D", blue: "#1D4ED8", purple: "#7E22CE", pink: "#BE185D", red: "#B91C1C" };
var YZ_RT_COLOR_LABEL = { gray: "灰", brown: "咖啡", orange: "橘", yellow: "黃", green: "綠", blue: "藍", purple: "紫", pink: "粉", red: "紅" };
// 字的大小（普通＝不加標記）。line＝LINE 卡片上的字級；em＝網頁上是內文的幾倍
var YZ_RT_SIZE_ORDER = ["sm", "lg", "xl"];
var YZ_RT_SIZES = { sm: { label: "小", line: "xs", em: 0.86, pt: 10 }, lg: { label: "大", line: "lg", em: 1.25, pt: 15 }, xl: { label: "特大", line: "xxl", em: 1.7, pt: 20 } };   // 第 39 批以前的三種（照樣認得）
// 第 40 批：字的大小像 Word：點數（8～72；內文 12 點＝不寫）。存成 [z=14]、[z=10.5]。網頁、編輯器照比例放大縮小（12 點＝1 倍），LINE 換成 px，Word 匯出就是這個點數
var YZ_RT_PT = [8, 9, 10, 10.5, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72];
var YZ_RT_PT_MIN = 6, YZ_RT_PT_MAX = 96;
var YZ_LINE_PX = { xxs: 11, xs: 13, sm: 14, md: 16, lg: 19, xl: 22, xxl: 29, "3xl": 35, "4xl": 48, "5xl": 74 };   // LINE 的字級大約幾 px
function _yzRtSz_(z) {   // → { pt, em, kw（舊的三種：LINE 字級）}；不是大小、12 點（＝內文）＝null
  if (!z) return null;
  var L = YZ_RT_SIZES[z]; if (L) return { pt: L.pt, em: L.em, kw: L.line };
  if (!/^\d{1,2}(\.5)?$/.test(String(z))) return null;
  var pt = parseFloat(z); if (!(pt >= YZ_RT_PT_MIN && pt <= YZ_RT_PT_MAX) || pt === 12) return null;
  return { pt: pt, em: Math.round(pt / 12 * 1000) / 1000 };
}
function _yzRtSzLine_(z, base) {   // LINE 一小段字的 size：照這一行本來的字級等比例（內文 12 點＝本來的大小）
  var s = _yzRtSz_(z); if (!s) return base;
  if (s.kw) return s.kw;
  var b = YZ_LINE_PX[base] || +((/^(\d+(?:\.\d+)?)px$/.exec(String(base || "")) || [0, 14])[1]);
  return Math.max(6, Math.round(b * s.pt / 12 * 2) / 2) + "px";
}
// 標題 1～4（整行粗體）
var YZ_RT_HEAD = {
  h1: { label: "標題 1", line: "xl", em: 1.5, color: "#1F1F1F" },
  h2: { label: "標題 2", line: "lg", em: 1.25, color: "#1F1F1F" },
  h3: { label: "標題 3", line: "md", em: 1.1, color: "#0B7A75" },
  h4: { label: "標題 4", line: "sm", em: 1, color: "#4A5565" }
};
// 標註（整行底色的提示框，有圖示和框線；一段字的底色用第 30 批的螢光筆）
// 第 39 批：6 種顏色（多了紫、灰）；符號可以另外選（ic＝這個顏色預設的符號）。存起來是 [box=顏色] 或 [box=顏色-符號]（符號跟預設一樣就不寫）。
//   退回舊程式：舊程式認不得「顏色-符號」、紫、灰 → 變成藍色💡的框（字都在、不會壞）
var YZ_RT_TONE_ORDER = ["info", "warn", "bad", "ok", "purple", "gray"];
var YZ_RT_TONES = {
  info: { icon: "💡", ic: "tip", bg: "#EAF3FB", bd: "#BBD7EE", ink: "#1B3A57", label: "提示", color: "藍" },
  warn: { icon: "⚠️", ic: "warn", bg: "#FFF6DB", bd: "#F0D78A", ink: "#5B4300", label: "注意", color: "黃" },
  bad: { icon: "⛔", ic: "stop", bg: "#FDECEC", bd: "#F2B8B8", ink: "#7A1F1F", label: "警告", color: "紅" },
  ok: { icon: "✅", ic: "ok", bg: "#E8F5EC", bd: "#B5DDC2", ink: "#1F5130", label: "完成", color: "綠" },
  purple: { icon: "📌", ic: "pin", bg: "#F4EEFD", bd: "#D5C4F3", ink: "#40296E", label: "重點", color: "紫" },
  gray: { icon: "📖", ic: "book", bg: "#F1F3F5", bd: "#D3D9E0", ink: "#374151", label: "備註", color: "灰" }
};
// 第 39 批：標註框可以選的符號（none＝不要符號）
var YZ_RT_ICON_ORDER = ["tip", "warn", "stop", "ok", "ex", "q", "pin", "book", "tel", "time", "lock", "pill", "shot", "cold", "fire", "hand", "none"];
var YZ_RT_ICONS = { tip: "💡", warn: "⚠️", stop: "⛔", ok: "✅", ex: "❗", q: "❓", pin: "📌", book: "📖", tel: "📞", time: "⏰", lock: "🔒", pill: "💊", shot: "💉", cold: "❄️", fire: "🔥", hand: "👉", none: "" };
function _yzRtToneOk_(v) { var m = /^([a-z]+)(?:-([a-z]+))?$/.exec(String(v === null || v === undefined ? "" : v)); return !!(m && YZ_RT_TONES.hasOwnProperty(m[1]) && (!m[2] || YZ_RT_ICONS.hasOwnProperty(m[2]))); }
function _yzRtToneKey_(c, ic) { c = YZ_RT_TONES.hasOwnProperty(c) ? c : "info"; return !ic || !YZ_RT_ICONS.hasOwnProperty(ic) || ic === YZ_RT_TONES[c].ic ? c : c + "-" + ic; }
// 標註的樣子：顏色＋符號（icon 可能是空的＝不要符號）。認不得的＝藍色💡
function _yzRtTone_(tone) {
  var m = /^([a-z]+)(?:-([a-z]+))?$/.exec(String(tone === null || tone === undefined ? "" : tone)), c = m && YZ_RT_TONES.hasOwnProperty(m[1]) ? m[1] : "info", T = YZ_RT_TONES[c];
  var ic = m && m[2] && YZ_RT_ICONS.hasOwnProperty(m[2]) ? m[2] : T.ic;
  return { key: _yzRtToneKey_(c, ic), c: c, ic: ic, icon: YZ_RT_ICONS[ic], bg: T.bg, bd: T.bd, ink: T.ink, label: T.label, color: T.color };
}
// 第 30 批：螢光筆（字的底色，6 色）。bg＝網頁、編輯器的底色；ink＝LINE 只畫一行裡的一部分時，改用的同色系字色（LINE 不能幫一段字加底色）
var YZ_RT_MARK_ORDER = ["yellow", "green", "blue", "pink", "orange", "purple"];
var YZ_RT_MARKS = {
  yellow: { label: "黃", bg: "#FFF176", ink: "#7A5C00" },
  green: { label: "綠", bg: "#B9F6CA", ink: "#1E6B2E" },
  blue: { label: "藍", bg: "#B3E5FC", ink: "#0F5A99" },
  pink: { label: "粉", bg: "#FFCCE5", ink: "#A12A63" },
  orange: { label: "橘", bg: "#FFD7A8", ink: "#9A4A00" },
  purple: { label: "紫", bg: "#E1D2FF", ink: "#5B2FA6" }
};
var YZ_RT_ORDER = ["m", "x", "b", "i", "u", "s", "c", "z"];   // 寫出標記時的固定順序（疊起來才會剛好蓋住；螢光筆包在最外面，文字框其次）
// 第 41 批：文字框（像 Word 的「字元框線」）：[x=樣式]…[/x]、[x=樣式-顏色]…[/x]。框裡的字照樣可以粗體、變色、改大小…
//   樣式：solid 實線、dash 虛線、dot 點線、dbl 雙線、thick 粗線、round 圓角（像按鍵）；顏色：沒寫＝跟字一樣（9 種字的顏色都可以）
//   網頁、編輯器、流程圖：真的框；LINE 不能幫一段字加框 → 前後加［］（雙線、粗線：【】）；Word：字元框線
var YZ_RT_BOX_ORDER = ["solid", "dash", "dot", "dbl", "thick", "round"];
var YZ_RT_BOX = {
  solid: { label: "實線", css: "1px solid", word: "single", sz: 4 },
  dash: { label: "虛線", css: "1px dashed", word: "dashed", sz: 4 },
  dot: { label: "點線", css: "2px dotted", word: "dotted", sz: 6 },
  dbl: { label: "雙線", css: "3px double", word: "double", sz: 4, heavy: 1 },
  thick: { label: "粗線", css: "2px solid", word: "single", sz: 12, heavy: 1 },
  round: { label: "圓角（像按鍵）", css: "1px solid", word: "single", sz: 4, round: 1 }
};
function _yzRtBox_(v) {   // "dash-red" → { st:"dash", c:"red", key:"dash-red", def }；不合格＝null
  var m = /^([a-z]+)(?:-([a-z]+))?$/.exec(String(v === null || v === undefined ? "" : v));
  if (!m || !Object.prototype.hasOwnProperty.call(YZ_RT_BOX, m[1]) || (m[2] && !Object.prototype.hasOwnProperty.call(YZ_RT_COLORS, m[2]))) return null;
  return { st: m[1], c: m[2] || "", key: m[1] + (m[2] ? "-" + m[2] : ""), def: YZ_RT_BOX[m[1]] };
}
var YZ_RT_MAXLV = 3;                                 // 最多縮排 3 層
var YZ_CP_MAX = 500;                                 // 第 32 批：反灰可複製一段最多幾個字（LINE 的「複製」最多 1000 字）
function _yzCpClean_(s) { return String(s === null || s === undefined ? "" : s).replace(/\[\/cp\]/gi, "").replace(/[ \t]*[\r\n]+[ \t]*/g, " ").replace(/\t/g, " ").replace(/^\s+|\s+$/g, "").slice(0, YZ_CP_MAX); }   // 換行＝一個空白（路徑裡本來的空白不動）
// 項目符號／編號／核對清單的記號（跟以前的「文字」一樣：行首打 1. (1) ① • - 就會自動排整齊）
// 第 39 批：項目符號 14 種（編輯器「• 項目符號 ▾」可以選）、編號 15 種樣式（「1. 編號 ▾」）；舊的寫法照樣認得
var YZ_RT_UL_MARKS = ["•", "◦", "▪", "◆", "➤", "✓", "★", "※", "\uD83D\uDD39", "\uD83D\uDD38", "\uD83D\uDCCC", "\u2757", "\u2705", "\uD83D\uDC49"];   // • ◦ ▪ ◆ ➤ ✓ ★ ※ 🔹 🔸 📌 ❗ ✅ 👉
var YZ_RT_OL_STYLES = [["1.", "1. 2. 3."], ["1、", "1、2、3、"], ["（1）", "（1）（2）（3）"], ["①", "① ② ③"], ["一、", "一、二、三、"], ["（一）", "（一）（二）（三）"], ["壹、", "壹、貳、參、"],
  ["甲、", "甲、乙、丙、"], ["（甲）", "（甲）（乙）（丙）"], ["A.", "A. B. C."], ["（A）", "（A）（B）（C）"], ["a.", "a. b. c."], ["（a）", "（a）（b）（c）"], ["I.", "I. II. III."], ["i.", "i. ii. iii."]];
var YZ_RT_ITEM = /^((?:\d{1,2}[.、)）](?!\d)|\(\d{1,2}\)|（\d{1,2}）|[①-⑳]|[一二三四五六七八九十]{1,3}、|[（(][一二三四五六七八九十]{1,3}[）)]|[壹貳參肆伍陸柒捌玖拾]{1,3}、|[甲乙丙丁戊己庚辛壬癸]、|[（(][甲乙丙丁戊己庚辛壬癸][）)]|(?=[IVX])X{0,3}(?:IX|IV|V?I{0,3})\.(?=\s)|(?=[ivx])x{0,3}(?:ix|iv|v?i{0,3})\.(?=\s)|[A-Za-z]\.(?=\s)|[（(][A-Za-z][）)]|[•・●☐☑◦▪◆➤✓★※\u2757\u2705]\uFE0F?|\uD83D[\uDD39\uDD38\uDCCC\uDC49]|-(?=\s)))\s*/;

// ── 小工具 ──
function _yzRtRunsText_(runs) { var s = ""; for (var i = 0; i < (runs || []).length; i++) s += runs[i].t; return s; }
function _yzRtAttrKey_(r) { var k = ""; for (var i = 0; i < YZ_RT_ORDER.length; i++) k += (r[YZ_RT_ORDER[i]] ? YZ_RT_ORDER[i] + "=" + r[YZ_RT_ORDER[i]] + ";" : ""); return k + (r.fx ? "fx;" : "") + (r.cp ? "cp;" : ""); }
function _yzRtMerge_(runs) {   // 相鄰、格式一樣的合併；空字串丟掉
  var out = [];
  (runs || []).forEach(function (r) {
    if (!r || !r.t) return;
    var last = out[out.length - 1];
    if (last && !last.fx && !r.fx && !last.cp && !r.cp && _yzRtAttrKey_(last) === _yzRtAttrKey_(r)) last.t += r.t; else out.push(_yzRtCopy_(r));   // 公式、反灰可複製：一個一個分開（不跟旁邊的合併）
  });
  return out;
}
function _yzRtCopy_(r) { var o = { t: r.t }; for (var i = 0; i < YZ_RT_ORDER.length; i++) if (r[YZ_RT_ORDER[i]]) o[YZ_RT_ORDER[i]] = r[YZ_RT_ORDER[i]]; if (r.fx) o.fx = 1; if (r.cp) o.cp = 1; return o; }
function _yzRtCut_(runs, n) {   // 去掉前 n 個字（算出「記號」之後，剩下的才是內文）
  var out = [];
  (runs || []).forEach(function (r) {
    if (n >= r.t.length) { n -= r.t.length; return; }
    var c = _yzRtCopy_(r); if (n > 0) { c.t = c.t.slice(n); n = 0; } out.push(c);
  });
  return out;
}
function _yzRtSlice_(runs, a, b) {   // 取第 a～b 個字
  var out = [], pos = 0;
  (runs || []).forEach(function (r) {
    var s = pos, e = pos + r.t.length; pos = e;
    var x = Math.max(a, s), y = Math.min(b, e);
    if (y > x) { var c = _yzRtCopy_(r); c.t = r.t.slice(x - s, y - s); out.push(c); }
  });
  return out;
}

// ── 字 → 一行的資料 ──
// 行內：把「[b]…[/b]」這種標記拆開，變成一小段一小段（每段有自己的格式）
function _yzRtInline_(s) {
  var runs = [], cur = {}, buf = "", i = 0, n = s.length;
  function flush() { if (buf) { var r = { t: buf }; for (var k in cur) r[k] = cur[k]; runs.push(r); buf = ""; } }
  while (i < n) {
    var ch = s.charAt(i);
    if (ch === "[") {
      if (s.charAt(i + 1) === "[") { buf += "["; i += 2; continue; }   // 「[[」＝一個真的「[」
      if (s.substr(i, 4) === "[fx]") {   // 第 31 批：公式（到 [/fx] 為止整段原封不動；沒有結尾＝當成字）
        var fe = s.indexOf("[/fx]", i + 4);
        if (fe > i + 4) { flush(); var fr = { t: s.slice(i + 4, fe), fx: 1 }; for (var fk in cur) fr[fk] = cur[fk]; runs.push(fr); i = fe + 5; continue; }
      }
      if (s.substr(i, 4) === "[cp]") {   // 第 32 批：反灰可複製（到 [/cp] 為止整段原封不動；沒有結尾＝當成字）
        var ce = s.indexOf("[/cp]", i + 4), ct = ce > i + 4 ? _yzCpClean_(s.slice(i + 4, ce)) : "";
        if (ct) { flush(); var cr = { t: ct, cp: 1 }; for (var ck in cur) cr[ck] = cur[ck]; runs.push(cr); i = ce + 5; continue; }
      }
      var m = /^\[(\/?)(b|i|u|s|c|z|m|x)(?:=([a-z0-9]+(?:\.5|-[a-z]+)?))?\]/.exec(s.substr(i, 24));
      if (m) {
        var close = m[1] === "/", key = m[2], val = m[3], ok = false;
        if (close) { if (!val) { flush(); delete cur[key]; ok = true; } }
        else if (key === "c") { if (val && YZ_RT_COLORS[val]) { flush(); cur.c = val; ok = true; } }
        else if (key === "z") { if (val && _yzRtSz_(val)) { flush(); cur.z = val; ok = true; } else if (val === "12") { flush(); delete cur.z; ok = true; } }   // 第 40 批：點數；12＝內文（不算大小）
        else if (key === "m") { if (val && YZ_RT_MARKS[val]) { flush(); cur.m = val; ok = true; } }
        else if (key === "x") { var bx = _yzRtBox_(val); if (bx) { flush(); cur.x = bx.key; ok = true; } }   // 第 41 批：文字框
        else if (!val) { flush(); cur[key] = 1; ok = true; }
        if (ok) { i += m[0].length; continue; }
      }
    }
    buf += ch; i++;
  }
  flush();
  return _yzRtMerge_(runs);
}
// 一行 → { k:"p|h1..h4|hr|q|box|go|img|tbl", lv:縮排層數, tone, go, img, tbl, runs:[{t, b,i,u,s,c,z,m}] }
// plain＝true：這段字不含標記（備註用），整行就是一段字
function _yzRtParseLine_(ln, plain) {
  ln = String(ln === null || ln === undefined ? "" : ln).replace(/\r/g, "");
  var lead = /^[ 　\t]*/.exec(ln)[0], full = 0, sp = 0, c;
  for (c = 0; c < lead.length; c++) { if (lead.charAt(c) === " ") sp++; else full++; }
  var L = { k: "p", lv: Math.min(YZ_RT_MAXLV, full + Math.floor(sp / 2)), runs: [] };
  ln = ln.slice(lead.length);
  if (!plain) {
    var pm = /^\[(h[1-4]|hr|q|box|go|img|tbl)(?:=([A-Za-z0-9_-]+))?\] ?/.exec(ln);
    if (pm) {
      L.k = pm[1];
      if (L.k === "box") L.tone = _yzRtToneOk_(pm[2]) ? _yzRtTone_(pm[2]).key : "info";   // 第 39 批：顏色-符號
      if (L.k === "go") L.go = pm[2] || "";
      if (L.k === "img") L.img = pm[2] || "";
      if (L.k === "tbl") L.tbl = pm[2] || "";
      ln = ln.slice(pm[0].length);
      if (L.k === "hr" || L.k === "go" || L.k === "img" || L.k === "tbl") return L;   // 這幾種沒有字
    }
  }
  L.runs = plain ? (ln ? [{ t: ln }] : []) : _yzRtInline_(ln);
  return L;
}
function _yzRtParse_(text) {   // 一段字 → 一行一行（編輯器載入用；至少一行）
  var out = String(text === null || text === undefined ? "" : text).split("\n").map(function (ln) { return _yzRtParseLine_(ln); });
  return out.length ? out : [{ k: "p", lv: 0, runs: [] }];
}

// ── 一行的資料 → 字 ──
function _yzRtEsc_(s) {   // 字本身長得像標記的，左括號寫成兩個；結尾的「[」也寫成兩個（後面可能接標記）
  return String(s).replace(/\[(?=\[|$|\/?(?:b|i|u|s|fx|cp)\]|\/(?:c|z|m|x)\]|(?:c|z|m)=[a-z0-9]+(?:\.5)?\]|x=[a-z]+(?:-[a-z]+)?\]|(?:h[1-4]|hr|q|box|go|img|tbl)(?:=[A-Za-z0-9_-]+)?\])/g, "[[");
}
function _yzRtSerRuns_(runs) {
  var out = "", stack = [], x;
  (runs || []).forEach(function (r) {
    var want = [];
    YZ_RT_ORDER.forEach(function (k) { if (r[k]) want.push(k === "c" || k === "z" || k === "m" || k === "x" ? k + "=" + r[k] : k); });
    var j = 0; while (j < stack.length && j < want.length && stack[j] === want[j]) j++;
    for (x = stack.length - 1; x >= j; x--) out += "[/" + stack[x].charAt(0) + "]";
    stack = stack.slice(0, j);
    for (x = j; x < want.length; x++) { out += "[" + want[x] + "]"; stack.push(want[x]); }
    out += r.fx ? "[fx]" + _yzFxClean_(r.t) + "[/fx]" : r.cp ? "[cp]" + _yzCpClean_(r.t) + "[/cp]" : _yzRtEsc_(r.t);   // 公式、反灰可複製：原封不動放在 [fx]…[/fx]、[cp]…[/cp] 裡
  });
  for (x = stack.length - 1; x >= 0; x--) out += "[/" + stack[x].charAt(0) + "]";
  return out;
}
function _yzRtSerLine_(L) {
  var ind = "", i;
  for (i = 0; i < (L.lv || 0); i++) ind += "　";
  if (L.k === "hr") return ind + "[hr]";
  if (L.k === "go") return ind + "[go=" + (L.go || "") + "]";
  if (L.k === "img") return ind + "[img=" + (L.img || "") + "]";
  if (L.k === "tbl") return ind + "[tbl=" + (L.tbl || "") + "]";
  var pre = L.k === "box" ? "[box=" + (L.tone || "info") + "] " : (L.k && L.k !== "p" ? "[" + L.k + "] " : "");
  var body = _yzRtSerRuns_(L.runs || []);
  if (L.k === "p" && !body) return "";
  return ind + pre + body;
}
function _yzRtSerialize_(lines) { return (lines || []).map(_yzRtSerLine_).join("\n"); }

// ── 不要標記的版本（搜尋、字數用）──
function _yzRtPlainLines_(text) {
  var out = [];
  String(text === null || text === undefined ? "" : text).split("\n").forEach(function (ln) {
    var L = _yzRtParseLine_(ln); if (L.k === "hr" || L.k === "go" || L.k === "img" || L.k === "tbl") return;
    var t = _yzRtRunsText_(L.runs).replace(/^\s+|\s+$/g, ""); if (t) out.push(t);
  });
  return out;
}
function _yzRtPlain_(text) { return _yzRtPlainLines_(text).join("\n"); }
// 這段字有沒有用到格式標記（LINE 裡改字時，要提醒「請保留標記」）
function _yzRtHas_(text) { return /\[(?:\/?(?:b|i|u|s|fx|cp)|\/(?:c|z|m|x)|(?:c|z|m)=[a-z0-9]+|x=[a-z]+(?:-[a-z]+)?|(?:h[1-4]|hr|q|box|go|img|tbl)(?:=[A-Za-z0-9_-]+)?)\]/.test(String(text === null || text === undefined ? "" : text)); }
// 第 41 批：文字框的樣子（網頁、編輯器、流程圖：直接寫在元件上）。框沒選顏色：裡面的字都同一個顏色＝跟字一樣，不然跟著外面的字
function _yzRtBoxCss_(x, runs) {
  var bx = _yzRtBox_(x); if (!bx) return "";
  var c = bx.c ? YZ_RT_COLORS[bx.c] : "";
  if (!c && runs && runs.length) { var c0 = runs[0].c || ""; if (c0 && YZ_RT_COLORS[c0] && runs.every(function (r) { return (r.c || "") === c0; })) c = YZ_RT_COLORS[c0]; }
  return "border:" + bx.def.css + (c ? " " + c : "") + ";padding:0 " + (bx.def.round ? ".5em" : ".22em") + ";margin:0 .12em;border-radius:" + (bx.def.round ? ".75em" : "2px") + ";-webkit-box-decoration-break:clone;box-decoration-break:clone";
}
// 第 41 批：文字框：一行裡連在一起、框一樣的那幾段 → 一組（畫成一個框）：[{ x:框（沒有＝""）, runs:[…] }]
function _yzRtBoxGroups_(runs) {
  var out = [];
  (runs || []).forEach(function (r) { var k = r && r.x ? r.x : "", last = out[out.length - 1]; if (last && last.x === k) last.runs.push(r); else out.push({ x: k, runs: [r] }); });
  return out;
}
// 第 30 批：這一行是不是「整行都畫了同一色螢光筆」（空白不算）→ 那個顏色；不是 → ""（LINE 整行的才能畫成底色）
function _yzRtBand_(runs) {
  var m = "", any = false;
  for (var i = 0; i < (runs || []).length; i++) {
    var r = runs[i]; if (!String(r.t || "").replace(/\s/g, "")) continue;
    if (!r.m || !YZ_RT_MARKS[r.m] || (m && r.m !== m)) return "";
    m = r.m; any = true;
  }
  return any ? m : "";
}
// 這段字裡有哪些圖（[img=代號] 那幾行，照順序、不重複）
function _yzImgIds_(text) {
  var out = [];
  String(text === null || text === undefined ? "" : text).split("\n").forEach(function (ln) { var m = /^[ 　\t]*\[img=([A-Za-z0-9_-]+)\]/.exec(ln); if (m && out.indexOf(m[1]) < 0) out.push(m[1]); });
  return out;
}

// 這段字裡有哪些表格（[tbl=代號] 那幾行，照順序、不重複；第 29 批）
function _yzTblIds_(text) {
  var out = [];
  String(text === null || text === undefined ? "" : text).split("\n").forEach(function (ln) { var m = /^[ 　\t]*\[tbl=([A-Za-z0-9_-]+)\]/.exec(ln); if (m && out.indexOf(m[1]) < 0) out.push(m[1]); });
  return out;
}

// ── 給畫面（網頁、LINE）用：一行一行的「種類」。網頁和 LINE 共用這一份，兩邊排出來才會一樣。
//   plain＝一般行　item＝有記號的行（編號、圓點、核對框）　head＝標題　hr＝分隔線　box＝標註　quote＝引用　go＝連結到標題　gap＝空行
//   runs＝這一行的字（每段有自己的格式）；text＝不含格式的字；lv＝縮排層數；indent＝有沒有縮排（舊欄位）
function _yzParseLines_(text, plain) {
  var out = [];
  String(text === null || text === undefined ? "" : text).split("\n").forEach(function (ln) {
    var L = _yzRtParseLine_(ln, plain);
    if (L.k === "hr") { out.push({ k: "hr", lv: L.lv }); return; }
    if (L.k === "go") { out.push({ k: "go", go: L.go, lv: L.lv }); return; }
    if (L.k === "img") { out.push({ k: "img", img: L.img, lv: L.lv }); return; }
    if (L.k === "tbl") { out.push({ k: "tbl", tbl: L.tbl, lv: L.lv }); return; }
    var pl = _yzRtRunsText_(L.runs);
    if (!pl.replace(/\s/g, "")) { out.push({ k: "gap" }); return; }
    if (L.k === "p") {
      var m = YZ_RT_ITEM.exec(pl);
      if (m && pl.length > m[0].length) { out.push({ k: "item", mark: m[1], runs: _yzRtCut_(L.runs, m[0].length), text: pl.slice(m[0].length), lv: L.lv, indent: L.lv > 0 }); return; }
      out.push({ k: "plain", runs: L.runs, text: pl, lv: L.lv, indent: L.lv > 0 });
      return;
    }
    if (L.k === "box") out.push({ k: "box", tone: L.tone, runs: L.runs, text: pl, lv: L.lv });
    else if (L.k === "q") out.push({ k: "quote", runs: L.runs, text: pl, lv: L.lv });
    else out.push({ k: "head", h: +L.k.charAt(1), runs: L.runs, text: pl, lv: L.lv });
  });
  return out;
}
// 編輯器用：這一行的字有沒有記號（按 Enter 要不要接下一個）、下一個記號是什麼
function _yzRtItem_(s) {
  var m = YZ_RT_ITEM.exec(String(s === null || s === undefined ? "" : s));
  return m ? { mark: m[1], len: m[0].length, rest: String(s).slice(m[0].length) } : null;
}
// 第 39 批：中文數字（一～九十九）、大寫（壹～玖拾玖）、天干（甲～癸）、羅馬數字（I～XXXIX）
var YZ_CN_D = "零一二三四五六七八九", YZ_CN_U = "零壹貳參肆伍陸柒捌玖", YZ_GAN = "甲乙丙丁戊己庚辛壬癸";
function _yzCnToNum_(s, D, ten) {
  if (s === ten) return 10;
  var i = s.indexOf(ten);
  if (i < 0) return s.length === 1 ? D.indexOf(s) : -1;
  if (s.length > 3 || s.indexOf(ten, i + 1) >= 0) return -1;
  var a = i === 0 ? 1 : (i === 1 ? D.indexOf(s.charAt(0)) : -1), b = i === s.length - 1 ? 0 : (i === s.length - 2 ? D.indexOf(s.charAt(s.length - 1)) : -1);
  return a > 0 && b >= 0 ? a * 10 + b : -1;
}
function _yzNumToCn_(n, D, ten) { if (n <= 0 || n > 99) return ""; if (n < 10) return D.charAt(n); var a = Math.floor(n / 10), b = n % 10; return (a === 1 ? "" : D.charAt(a)) + ten + (b ? D.charAt(b) : ""); }
function _yzRomanToNum_(s) { var v = { i: 1, v: 5, x: 10 }, t = 0, p = 0; s = String(s).toLowerCase(); for (var k = s.length - 1; k >= 0; k--) { var c = v[s.charAt(k)] || 0; if (c < p) t -= c; else { t += c; p = c; } } return t; }
function _yzNumToRoman_(n) { var r = "", T = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]]; if (n < 1 || n > 39) return ""; for (var k = 0; k < T.length; k++) while (n >= T[k][0]) { r += T[k][1]; n -= T[k][0]; } return r; }
// 下一個記號（編輯器按 Enter 接下一個用）。prev＝上一行的記號（有的話）：I、V、X 可能是字母也可能是羅馬數字，上一個是 H.／U.／W. 的就當字母
function _yzRtNextMark_(mark, prev) {
  var m;
  mark = String(mark === null || mark === undefined ? "" : mark);
  if ((m = /^(\d{1,2})([.、)）])$/.exec(mark))) return (+m[1] + 1) + m[2];
  if ((m = /^\((\d{1,2})\)$/.exec(mark))) return "(" + (+m[1] + 1) + ")";
  if ((m = /^（(\d{1,2})）$/.exec(mark))) return "（" + (+m[1] + 1) + "）";
  if (/^[①-⑳]$/.test(mark)) { var c = mark.charCodeAt(0); return c < 0x2473 ? String.fromCharCode(c + 1) : "①"; }
  if ((m = /^([（(]?)([一二三四五六七八九十]{1,3})([、）)])$/.exec(mark))) { var n1 = _yzCnToNum_(m[2], YZ_CN_D, "十"); return n1 > 0 && n1 < 99 ? m[1] + _yzNumToCn_(n1 + 1, YZ_CN_D, "十") + m[3] : mark; }
  if ((m = /^([壹貳參肆伍陸柒捌玖拾]{1,3})、$/.exec(mark))) { var n2 = _yzCnToNum_(m[1], YZ_CN_U, "拾"); return n2 > 0 && n2 < 99 ? _yzNumToCn_(n2 + 1, YZ_CN_U, "拾") + "、" : mark; }
  if ((m = /^([（(]?)([甲乙丙丁戊己庚辛壬癸])([、）)])$/.exec(mark))) return m[1] + YZ_GAN.charAt((YZ_GAN.indexOf(m[2]) + 1) % 10) + m[3];
  if ((m = /^([（(]?)([A-Za-z]{1,6})([.）)])$/.exec(mark))) {
    var w = m[2], low = w === w.toLowerCase(), isR = /^(x{0,3})(ix|iv|v?i{0,3})$/i.test(w) && (w === w.toUpperCase() || low);
    var pw = prev ? (/^[（(]?([A-Za-z]{1,6})[.）)]$/.exec(String(prev)) || [])[1] : "";
    if (isR && w.length === 1 && pw && pw.length === 1 && pw.charCodeAt(0) === w.charCodeAt(0) - 1) isR = false;   // H. 後面的 I.：字母
    if (isR) { var rs = _yzNumToRoman_(_yzRomanToNum_(w) + 1); return rs ? m[1] + (low ? rs.toLowerCase() : rs) + m[3] : mark; }
    if (w.length === 1) { var cc = w.charCodeAt(0), zz = (low ? "z" : "Z").charCodeAt(0); return m[1] + (cc === zz ? (low ? "a" : "A") : String.fromCharCode(cc + 1)) + m[3]; }
    return mark;
  }
  if (mark === "☑") return "☐";
  return mark;
}
// 第 39 批：這個記號是哪一種：ul＝項目符號、todo＝核對清單、ol＝編號
function _yzRtMarkKind_(m) {
  m = String(m === null || m === undefined ? "" : m).replace(/\uFE0F/g, "");
  if (/^[☐☑]$/.test(m)) return "todo";
  if (/^[•・●-]$/.test(m) || YZ_RT_UL_MARKS.indexOf(m) >= 0) return "ul";
  return "ol";
}

// ═══ 第 31 批：公式（數學公式）═══
// 打法跟 Word 的方程式一樣（一行打完）：1/6＝上下排的分數　m^2＝次方　C_max＝下標　√(…) 或 sqrt(…)＝根號
//   括號包起來＝一整塊（當分子、分母、次方時括號會拿掉）：((140-年齡)×體重)/(72×Scr)　{…}＝看不見的括號
//   * → ×　<= → ≤　>= → ≥　!= → ≠　~= → ≈　+- → ±　-> → →　//＝真的斜線（不要上下排）
// 公式存成 [fx]原本打的字[/fx]（搜尋照樣找得到）；網頁、編輯器畫成上下排的分數；LINE 夾在句子裡用 ¹⁄₆、m² 這種小字代替，整行只有公式時排成上下排。
var YZ_FX_MAX = 200;   // 一個公式最多幾個字
var YZ_FX_OPS = { "*": "×", "·": "·", "-": "−", "−": "−", "+": "+", "=": "=", "<": "<", ">": ">", "×": "×", "÷": "÷", "±": "±", "≤": "≤", "≥": "≥", "≠": "≠", "≈": "≈", "→": "→", "⇒": "⇒", ",": ",", "，": "，", ":": ":", ";": ";", "%": "%", "°": "°", "!": "!", "|": "|", "∕": "/", "…": "…", "∞": "∞", "∑": "∑", "∆": "Δ" };
var YZ_FX_TWO = { "<=": "≤", ">=": "≥", "!=": "≠", "~=": "≈", "+-": "±", "->": "→", "=>": "⇒", "//": "/" };
var YZ_FX_SUP = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "+": "⁺", "−": "⁻", "=": "⁼", "(": "⁽", ")": "⁾", "n": "ⁿ", "i": "ⁱ", "x": "ˣ" };
var YZ_FX_SUB = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉", "+": "₊", "−": "₋", "=": "₌", "(": "₍", ")": "₎", "a": "ₐ", "e": "ₑ", "o": "ₒ", "x": "ₓ", "h": "ₕ", "k": "ₖ", "l": "ₗ", "m": "ₘ", "n": "ₙ", "p": "ₚ", "s": "ₛ", "t": "ₜ" };
var YZ_FX_SP = { "=": 1, "≈": 1, "≠": 1, "≤": 1, "≥": 1, "<": 1, ">": 1, "→": 1, "⇒": 1, "±": 1, "+": 1, "−": 1 };   // 前後空一點的符號（二元運算）

// 存之前整理：換行變空白、拿掉會跟標記打架的字（[/fx]）、太長的切掉
function _yzFxClean_(s) {
  s = String(s === null || s === undefined ? "" : s);
  while (s.indexOf("[/fx]") >= 0) s = s.split("[/fx]").join("");   // 拿掉以後又湊出一個（[/f[/fx]x]）：再拿一次
  return s.replace(/\s+/g, " ").replace(/^ | $/g, "").slice(0, YZ_FX_MAX);
}
// 字 → 一個一個的「記號」
function _yzFxTok_(src) {
  var s = _yzFxClean_(src).replace(/[０-９]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
    .replace(/[（]/g, "(").replace(/[）]/g, ")").replace(/[／]/g, "/").replace(/[＾]/g, "^").replace(/[＿]/g, "_").replace(/[＊]/g, "*").replace(/[＝]/g, "=").replace(/[＋]/g, "+").replace(/[－]/g, "-");
  var out = [], i = 0, n = s.length, m;
  while (i < n) {
    var c = s.charAt(i), two = s.substr(i, 2);
    if (/\s/.test(c)) { while (i < n && /\s/.test(s.charAt(i))) i++; out.push({ k: "sp" }); continue; }
    if ((m = /^\d+(?:\.\d+)?/.exec(s.slice(i)))) { out.push({ k: "num", t: m[0] }); i += m[0].length; continue; }
    if (YZ_FX_TWO[two]) { out.push({ k: "op", t: YZ_FX_TWO[two] }); i += 2; continue; }
    if (/^sqrt\s*\(/i.test(s.slice(i))) { out.push({ k: "sqrt" }); i += 4; continue; }
    if (c === "√") { out.push({ k: "sqrt" }); i++; continue; }
    if (c === "/" || c === "^" || c === "_") { out.push({ k: c }); i++; continue; }
    if (c === "(" || c === "[" || c === "{") { out.push({ k: "open", t: c }); i++; continue; }
    if (c === ")" || c === "]" || c === "}") { out.push({ k: "close", t: c }); i++; continue; }
    if (YZ_FX_OPS[c]) { out.push({ k: "op", t: YZ_FX_OPS[c] }); i++; continue; }
    if ((m = /^[A-Za-zµͰ-Ͽ′″']+/.exec(s.slice(i)))) { out.push({ k: "id", t: m[0] }); i += m[0].length; continue; }
    if ((m = /^[^\s\d()[\]{}\/^_*·+\-−=<>×÷±≤≥≠≈→⇒,，:;%°!|√A-Za-z]+/.exec(s.slice(i)))) { out.push({ k: "id", t: m[0] }); i += m[0].length; continue; }
    out.push({ k: "op", t: c }); i++;
  }
  return out;
}
// 記號 → 樹：{k:"seq",a:[…]}、{k:"num"|"id"|"op",t}、{k:"sp"}、{k:"frac",n,d}、{k:"sup",b,s}、{k:"sub",b,s}、{k:"subsup",b,sub,sup}、{k:"sqrt",a}、{k:"par",o,c,a}（看得到的括號）、{k:"grp",a}
// 寫錯也不會壞：多的、少的括號、單獨的 / ^ _ 都當成一般的字
function _yzFxParse_(src) {
  var tk = _yzFxTok_(src), p = 0;
  var CL = { "(": ")", "[": "]", "{": "}" };
  function nextAt(k) { var q = p; while (tk[q] && tk[q].k === "sp") q++; return tk[q] && tk[q].k === k ? q : -1; }
  function unwrap(x) { return x && ((x.k === "par" && x.o === "(") || x.k === "grp") ? x.a : x; }
  function seq(inner) {
    var a = [];
    while (p < tk.length) {
      var t = tk[p];
      if (t.k === "close") { if (inner) break; p++; a.push({ k: "op", t: t.t }); continue; }
      if (t.k === "sp") { p++; if (a.length && a[a.length - 1].k !== "sp") a.push({ k: "sp" }); continue; }
      if (t.k === "op") { p++; a.push({ k: "op", t: t.t }); continue; }
      a.push(frac());
    }
    while (a.length && a[a.length - 1].k === "sp") a.pop();
    while (a.length && a[0].k === "sp") a.shift();
    return a.length === 1 ? a[0] : { k: "seq", a: a };
  }
  function frac() {
    var x = script(), q;
    while ((q = nextAt("/")) >= 0) {
      var save = p; p = q + 1; while (tk[p] && tk[p].k === "sp") p++;
      if (!tk[p] || tk[p].k === "close" || tk[p].k === "op" || tk[p].k === "/") { p = save; break; }   // 「1/」後面沒東西：斜線當字
      var y = script();
      x = { k: "frac", n: unwrap(x), d: unwrap(y) };
    }
    return x;
  }
  function script() {
    var b = prim(), sub = null, sup = null, q;
    while ((q = nextAt("^")) >= 0 || (q = nextAt("_")) >= 0) {
      var w = tk[q].k; p = q + 1;
      if (!tk[p] || tk[p].k === "sp" || tk[p].k === "close") { p = q; break; }
      var s = prim();
      if (w === "^") sup = unwrap(s); else sub = unwrap(s);
    }
    if (sub && sup) return { k: "subsup", b: b, sub: sub, sup: sup };
    if (sup) return { k: "sup", b: b, s: sup };
    if (sub) return { k: "sub", b: b, s: sub };
    return b;
  }
  function prim() {
    var t = tk[p];
    if (!t) return { k: "seq", a: [] };
    p++;
    if (t.k === "num" || t.k === "id") return { k: t.k, t: t.t };
    if (t.k === "sqrt") { while (tk[p] && tk[p].k === "sp") p++; return { k: "sqrt", a: unwrap(prim()) }; }
    if (t.k === "open") {
      var inner = seq(true), c = "";
      if (tk[p] && tk[p].k === "close") { c = tk[p].t; p++; }
      return t.t === "{" ? { k: "grp", a: inner } : { k: "par", o: t.t, c: c || CL[t.t], a: inner };
    }
    if (t.k === "op") return { k: "op", t: t.t };
    return { k: "op", t: t.k === "close" ? t.t : t.k };   // 單獨的 / ^ _ ）
  }
  return seq(false);
}
// 這一塊是不是「黏得比斜線緊」（數字、字、括號、根號；次方、下標看它的底）：一行的寫法當分子分母、次方的底時，不用另外加括號
function _yzFxFlat_(n) {
  if (!n) return false;
  if (n.k === "num" || n.k === "id" || n.k === "par" || n.k === "sqrt") return true;
  return (n.k === "sup" || n.k === "sub" || n.k === "subsup") && _yzFxFlat_(n.b);
}
function _yzFxMap_(s, tbl) { var o = ""; for (var i = 0; i < s.length; i++) { var c = tbl[s.charAt(i)]; if (!c) return null; o += c; } return o; }
// 樹 → 一行字（LINE 夾在句子裡、搜尋結果、小視窗的「LINE 上」）：¹⁄₆、m²、C_max、√(…)
function _yzFxLin_(n) {
  if (!n) return "";
  switch (n.k) {
    case "num": case "id": return n.t;
    case "sp": return " ";
    case "op": return n.t;
    case "seq":
      var out = "";
      n.a.forEach(function (x, i) {
        var pv = n.a[i - 1], bin = x.k === "op" && YZ_FX_SP[x.t] && pv && !(pv.k === "op") && !(pv.k === "sp");
        if (x.k === "sp" && (out.slice(-1) === " " || !out)) return;
        out += bin ? (out.slice(-1) === " " ? "" : " ") + x.t + " " : _yzFxLin_(x);
      });
      return out.replace(/\s+$/, "").replace(/ {2,}/g, " ");
    case "par": return n.o + _yzFxLin_(n.a) + n.c;
    case "grp": return _yzFxLin_(n.a);
    case "frac":
      var a = _yzFxLin_(n.n), b = _yzFxLin_(n.d);
      if (/^\d{1,4}$/.test(a) && /^\d{1,4}$/.test(b)) return _yzFxMap_(a, YZ_FX_SUP) + "⁄" + _yzFxMap_(b, YZ_FX_SUB);   // 1/6 → ¹⁄₆
      return (_yzFxFlat_(n.n) ? a : "(" + a + ")") + "/" + (_yzFxFlat_(n.d) ? b : "(" + b + ")");
    case "sup": case "sub": case "subsup":
      var base = _yzFxLin_(n.b), bw = _yzFxFlat_(n.b) ? base : "(" + base + ")";
      var up = n.k === "sub" ? "" : _yzFxLin_(n.k === "sup" ? n.s : n.sup), dn = n.k === "sup" ? "" : _yzFxLin_(n.k === "sub" ? n.s : n.sub);
      var u2 = up ? (_yzFxMap_(up.replace(/-/g, "−").replace(/\s+/g, ""), YZ_FX_SUP) || "^" + (up.length > 1 ? "(" + up + ")" : up)) : "";   // 小字裡不要空白：AUC₀₋₂₄
      var d2 = dn ? (_yzFxMap_(dn.replace(/-/g, "−").replace(/\s+/g, ""), YZ_FX_SUB) || "_" + (dn.length > 1 ? "(" + dn + ")" : dn)) : "";
      return bw + d2 + u2;
    case "sqrt":
      var r = _yzFxLin_(n.a);
      return "√" + (_yzFxFlat_(n.a) && n.a.k !== "sqrt" ? r : "(" + r + ")");
  }
  return "";
}
function _yzFxLinear_(src) { return _yzFxLin_(_yzFxParse_(src)); }
// 一段字裡的公式 → 一般的字（搜尋、純文字用；不管格式）
function _yzRtRunsLin_(runs) { var s = ""; (runs || []).forEach(function (r) { s += r.fx ? _yzFxLinear_(r.t) : r.t; }); return s; }

/* ════════ cards.js ════════ */
/* cards.js — 藥戰手冊的 LINE 卡片（純函式：進去資料，出來 Flex JSON；不讀不寫任何東西）。
 * 寫法照 Apps Script 的樣子（函式名字尾有底線、不碰 DOM、不用瀏覽器才有的東西），之後原封不動搬進 LINE 專案的「藥戰手冊」檔。
 * 預覽用的就是這份，所以預覽上看到的卡片 ＝ 之後機器人真的送出去的卡片。 */
var YZ_ACCENT = "#0B7A75";
var YZ_ACCENT_SOFT = "#CFEDEA";
var YZ_PG_BG = "#DDF1EE", YZ_PG_BD = "#8CCBC5", YZ_PG_INK = "#0B5F5B", YZ_PG_STRONG = "#064B47";   // 備註裡「藥戰手冊頁數」小框的顏色（青綠色）
var YZ_NOTICE = "內部資料，請勿外傳";
var YZ_BUBBLE_SAFE = 27e3;   // 一張卡片的安全上限（LINE 的上限約 30 KB，留一點空）
var YZ_MSG_SAFE = 45e3;      // 一則訊息的安全上限（LINE 的上限 50 KB）
var YZ_CAROUSEL_MAX = 12;    // 一排最多 12 張（LINE 的規定）
var YZ_REPLY_MAX = 5;        // 一次回覆最多 5 則訊息（LINE 的規定）
// LINE 卡片大小：最小 nano … 最大 giga，共 7 級（LINE 的規定）
var YZ_SIZES = ["nano", "micro", "deca", "hecto", "kilo", "mega", "giga"];
// 各級卡片的寬度（px）。這是照 LINE 畫面抓的估計值，實機才準（待實機確認）；預覽畫卡片、算表格欄寬都用這一份。
var YZ_BUBBLE_PX = { nano: 120, micro: 160, deca: 200, hecto: 230, kilo: 260, mega: 300, giga: 340 };
// 設定（真的程式會在每次回覆前，從「設定」那一頁讀進來；預覽裡可以手動切換）
var YZ_CFG = { imgDirect: true, animDirect: true, footer: true, webUrl: "https://example.invalid/hb" };
// 動畫（LINE 官方規定：卡片裡「會自己動的圖」只認 APNG；超過 300 KB 不播；一則訊息最多 10 張；圖最長邊 1024 px）
var YZ_ANIM_MAX_BYTES = 300 * 1024;
var YZ_ANIM_MAX_PX = 1024;
var YZ_ANIM_PER_MSG = 10;
var YZ_ANIM_WEB_MAX = 10 * 1024 * 1024;   // 網頁這邊動畫檔的上限（我抓的，不是 LINE 規定；Apps Script 能收多大，寫程式時再實測）
var YZ_STEPS_MAX = 8;                     // 分步動畫最多幾步（LINE 一排最多 12 張卡片）

// 一個字串／物件在 LINE 眼中有幾個位元組（UTF-8）。不用 TextEncoder，Apps Script 也能跑。
function _yzBytes_(o) {
  var s = JSON.stringify(o), n = 0;
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    if (c < 0x80) n += 1; else if (c < 0x800) n += 2;
    else if (c >= 0xD800 && c <= 0xDBFF) { n += 4; i++; } else n += 3;
  }
  return n;
}

// 圖片比例：LINE 規定「高」不能超過「寬」的 3 倍，兩邊都不能超過 100000
function _yzAR_(w, h) {
  w = Math.max(1, Math.round(w)); h = Math.max(1, Math.round(h));
  if (h > 3 * w) h = 3 * w;
  var a = w, b = h; while (b) { var t = a % b; a = b; b = t; }
  w = w / a; h = h / a;
  while (w > 100000 || h > 100000) { w = Math.max(1, Math.round(w / 2)); h = Math.max(1, Math.round(h / 2)); }
  return w + ":" + h;
}

function _yzT_(text, o) {
  text = (text === null || text === undefined ? "" : String(text));
  if (!text) return null;
  var t = { type: "text", text: text, wrap: true };
  for (var k in (o || {})) t[k] = o[k];
  return t;
}

// 一段文字 → 一行一行的「種類」：寫在 rt.js 的 _yzParseLines_（網頁和 LINE 共用，兩邊排出來才會一樣）。

// 一行字（含格式）→ LINE 的一個 text。沒有格式就是一般的 text；有格式就拆成一小段一小段（span），每段都寫明字級和顏色，不靠「繼承」。
// base.band：這一行整行畫了同一色螢光筆（外面會包一層底色）→ 螢光筆不用再改字色
// 第 41 批：文字框（[x=…]）：LINE 不能幫一段字加框 → 框的前後加［］（雙線、粗線：【】），顏色跟框一樣（沒選顏色＝跟字一樣）
function _yzRtBoxLine_(runs) {
  if (!(runs || []).some(function (r) { return r && r.x; })) return runs;
  var out = [];
  _yzRtBoxGroups_(runs).forEach(function (g) {
    var bx = g.x ? _yzRtBox_(g.x) : null;
    if (!bx) { out = out.concat(g.runs); return; }
    var br = bx.def.heavy ? ["【", "】"] : ["［", "］"];
    var mk = function (t, ref) { var o = { t: t }; if (bx.c) o.c = bx.c; else if (ref.c) o.c = ref.c; if (ref.z) o.z = ref.z; if (ref.b) o.b = 1; return o; };
    out.push(mk(br[0], g.runs[0]));
    out = out.concat(g.runs);
    out.push(mk(br[1], g.runs[g.runs.length - 1]));
  });
  return out;
}
function _yzRtTextNode_(runs, base) {
  base = base || {};
  runs = _yzRtBoxLine_(runs);
  var simple = true, i;
  for (i = 0; i < (runs || []).length; i++) { var r0 = runs[i]; if (r0.b || r0.i || r0.u || r0.s || r0.c || r0.z || (r0.m && !base.band)) { simple = false; break; } }
  var node = { type: "text", wrap: true, size: base.size || "sm", color: base.color || "#1F1F1F" };
  if (base.weight) node.weight = base.weight;
  if (base.style) node.style = base.style;
  if (base.flex !== undefined) node.flex = base.flex;
  if (base.margin) node.margin = base.margin;
  if (simple) { node.text = _yzRtRunsLin_(runs); return node.text ? node : null; }   // 第 31 批：公式 → ¹⁄₆、m² 這種一行的寫法
  node.contents = runs.map(function (r) {
    var sp = { type: "span", text: r.fx ? _yzFxLinear_(r.t) || " " : r.t };
    sp.size = r.z ? _yzRtSzLine_(r.z, node.size) : node.size;   // 第 40 批：點數＝照這一行的字級等比例（px）
    sp.color = r.c ? YZ_RT_COLORS[r.c] : node.color;
    var mk = !base.band && r.m && YZ_RT_MARKS[r.m];   // 第 30 批：只畫一部分的螢光筆：LINE 不能加底色 → 同色系的粗體字
    if (mk && !r.c) sp.color = mk.ink;
    if (r.b || mk || base.weight === "bold") sp.weight = "bold";
    if (r.i || base.style === "italic") sp.style = "italic";
    if (r.s) sp.decoration = "line-through"; else if (r.u) sp.decoration = "underline";   // LINE 一段字只能選一種：兩個都有時留刪除線
    return sp;
  });
  return node;
}

// 第 31 批：這一行是不是「只有一個公式」（前後的空白不算）→ 那一段；不是 → null
function _yzFxOnly_(runs) {
  var hit = null;
  for (var i = 0; i < (runs || []).length; i++) {
    var r = runs[i];
    if (r.fx) { if (hit) return null; hit = r; continue; }
    if (String(r.t || "").replace(/\s/g, "")) return null;
  }
  return hit;
}
// 第 31 批：整行的公式 → LINE 的一排：分數＝直的一小塊（分子、一條線、分母）；其他的照一行的寫法。
// 沒有分數、或太長（LINE 一行放不下）→ null（照一般的字：¹⁄₆ 那種）
var YZ_FX_LINE_MAX = 24;
function _yzFxFlex_(src, base) {
  var ast = _yzFxParse_(src), items = ast.k === "seq" ? ast.a : [ast];
  var rootFrac = function (x) { return x.k === "sqrt" && x.a && x.a.k === "frac"; };   // 根號裡面是分數（BSA 那種）：√＋上面一條線＋上下排
  if (!items.some(function (x) { return x.k === "frac" || rootFrac(x); })) return null;
  var parts = [], seg = [], total = 0, size = base.size || "sm", color = base.color || "#1F1F1F";
  var tx = function (t, al) { var o = { type: "text", text: t, size: size, color: color, flex: 0 }; if (al) o.align = al; if (base.weight === "bold") o.weight = "bold"; return o; };
  var flush = function () {
    var t = _yzFxLin_({ k: "seq", a: seg }).replace(/^\s+|\s+$/g, ""); seg = [];
    if (t) { parts.push(tx(t)); total += t.length; }
  };
  var fracBox = function (x) {
    var a = _yzFxLin_(x.n) || " ", b = _yzFxLin_(x.d) || " ";
    total += Math.max(a.length, b.length);
    return { type: "box", layout: "vertical", flex: 0, contents: [tx(a, "center"), { type: "separator", color: color }, tx(b, "center")] };
  };
  items.forEach(function (x) {
    if (x.k === "frac") { flush(); parts.push(fracBox(x)); return; }
    if (rootFrac(x)) { flush(); total += 1; parts.push({ type: "box", layout: "horizontal", flex: 0, alignItems: "center", contents: [tx("√"), { type: "box", layout: "vertical", flex: 0, contents: [{ type: "separator", color: color }, fracBox(x.a)] }] }); return; }
    seg.push(x);
  });
  flush();
  if (total > YZ_FX_LINE_MAX || parts.length > 9) return null;
  return { type: "box", layout: "horizontal", alignItems: "center", spacing: "sm", contents: parts };
}

// 第 30 批：整行畫了同一色螢光筆 → 包一層那個顏色的底色（LINE 只能幫「一整塊」加底色）；它前面的間距（margin）搬到外面
function _yzMarkBand_(node, m) {
  if (!node || !m || !YZ_RT_MARKS[m]) return node;
  var c = Object.assign({}, node), w = { type: "box", layout: "vertical", backgroundColor: YZ_RT_MARKS[m].bg, cornerRadius: "4px", paddingStart: "6px", paddingEnd: "6px", paddingTop: "2px", paddingBottom: "2px", contents: [c] };
  if (c.margin) { w.margin = c.margin; delete c.margin; }
  if (c.flex !== undefined) { w.flex = c.flex; delete c.flex; }
  return w;
}
// 第 32 批：反灰可複製（[cp]…[/cp]）：LINE 一段字裡不能放按鍵 → 那一行下面接「灰底的字＋📋 複製」（按了就複製好，最多 1000 字）。
//   整行只有反灰的字：不重複寫那一行，只放灰條。藥師的 LINE 太舊（或電腦版）按了沒反應：請改用網頁（一樣按「📋 複製」）。
var YZ_CP_BG = "#EEF1F5", YZ_CP_BD = "#C5CED8", YZ_CP_INK = "#1F2937";
function _yzCpRow_(text, size) {
  return { type: "box", layout: "horizontal", spacing: "sm", alignItems: "center", contents: [
    { type: "box", layout: "vertical", flex: 1, backgroundColor: YZ_CP_BG, borderColor: YZ_CP_BD, borderWidth: "1px", cornerRadius: "6px", paddingTop: "5px", paddingBottom: "5px", paddingStart: "8px", paddingEnd: "8px", contents: [{ type: "text", text: text, size: size || "sm", color: YZ_CP_INK, wrap: true }] },
    { type: "button", style: "primary", color: YZ_ACCENT, height: "sm", flex: 0, action: { type: "clipboard", label: "📋 複製", clipboardText: String(text).slice(0, 1000) } }
  ] };
}
function _yzCpOnly_(runs) {   // 這一行是不是只有反灰可複製的字（空白不算）
  var any = false;
  for (var i = 0; i < (runs || []).length; i++) { var r = runs[i]; if (r.cp) { any = true; continue; } if (String(r.t || "").replace(/\s/g, "")) return false; }
  return any;
}
function _yzCpWrap_(node, runs, size) {   // node＝這一行原本畫出來的樣子（可能是 null）→ 後面接灰條；沒有反灰的字就原樣
  var cps = (runs || []).filter(function (r) { return r.cp && r.t; });
  if (!cps.length) return node;
  var rows = cps.map(function (r) { return _yzCpRow_(r.t, size); }), only = _yzCpOnly_(runs) || !node;
  var c = node ? Object.assign({}, node) : null, w = { type: "box", layout: "vertical", spacing: "xs", contents: only ? rows : [c].concat(rows) };
  if (c && c.margin) { w.margin = c.margin; delete c.margin; }
  if (c && c.flex !== undefined) { w.flex = c.flex; delete c.flex; }
  return w;
}
// 縮排（第 27 批：任何內容都能縮排）：把一個元件包進「左邊留 px」的方塊裡；它前面的間距（margin）搬到外面那一層，才算得到
function _yzIndent_(node, px) {
  if (!node || !px) return node;
  var c = Object.assign({}, node), w = { type: "box", layout: "vertical", paddingStart: px + "px", contents: [c] };
  if (c.margin) { w.margin = c.margin; delete c.margin; }
  return w;
}
function _yzIndentNodes_(nodes, px) { return px ? (nodes || []).map(function (n) { return _yzIndent_(n, px); }) : nodes; }
var YZ_IND_PX = 18;   // LINE：縮排一層幾 px（跟文字的縮排一樣）
var YZ_IND_MAX = 3;   // 整塊最多縮排 3 層（跟文字一樣）
var YZ_BOX_ICW = { xxs: "15px", xs: "17px", sm: "19px", md: "22px", lg: "25px", xl: "28px" };   // 好幾行的標註：左邊圖示那一欄多寬（每一列的字才對齊）
function _yzBlockInd_(b) { var n = Math.floor(Number(b && b.ind) || 0); return Math.max(0, Math.min(YZ_IND_MAX, n)); }

// 一段文字 → LINE 的幾行。編號行做成「記號＋內文」（內文換行時對齊內文，不會縮回記號下面）。
// 連續的「標註」（同一種）、連續的「引用」各合成一個框。o.go(標題代號)→{label}：「連結到標題」的行要用（找不到就不顯示）；o.plain：整段當一般文字（備註用，不看標記）
function _yzTextLines_(text, o) {
  o = o || {};
  var size = o.size || "sm", color = o.color || "#1F1F1F", out = [], ls = _yzParseLines_(text, o.plain), i = 0, first = true;
  while (i < ls.length) {
    var L = ls[i], pad = (L.lv || 0) * 18, j, node = null;
    if (L.k === "gap") { out.push({ type: "separator", margin: "sm", color: "#FFFFFF" }); i++; continue; }   // 空一行（LINE 已經不收 spacer：用一條白色、看不見的分隔線）
    if (L.k === "hr") { out.push(_yzIndent_({ type: "separator", margin: "md", color: "#D5DAE1" }, pad)); i++; first = false; continue; }
    if (L.k === "go") {
      var tg = o.go ? o.go(L.go) : null;
      if (tg && tg.label) {
        out.push({
          type: "box", layout: "horizontal", spacing: "sm", backgroundColor: "#F1F7F6", cornerRadius: "8px", paddingAll: "9px", paddingStart: (9 + pad) + "px",
          action: _yzPB_((tg.kind === "c" ? "yz=c&c=" : "yz=t&t=") + L.go, String(tg.label).slice(0, 20)),   // 第 27 批：也能連到整章
          contents: [
            { type: "text", text: "→", size: size, color: YZ_ACCENT, flex: 0 },
            { type: "text", text: tg.label, size: size, color: YZ_ACCENT, weight: "bold", wrap: true, flex: 1 },
            { type: "text", text: "›", size: size, color: YZ_ACCENT, flex: 0 }
          ]
        });
        first = false;
      }
      i++; continue;
    }
    if (L.k === "img") {   // 第 28 批：文字和圖片放在同一塊（圖的網址、圖說在這一塊的 pics 裡）；找不到那張圖就不顯示
      var P = o.pics && o.pics[L.img], im = P && P.url ? _yzImage_(P, o.pact ? o.pact(L.img) : null) : null;
      if (im) { out.push(_yzIndent_(im, pad)); first = false; }
      i++; continue;
    }
    if (L.k === "tbl") {   // 第 29 批：文字裡的表格（表格的內容在這一塊的 tbls 裡）；找不到就不顯示
      var TB = o.tbls && o.tbls[L.tbl], tn = TB ? _yzTable_(TB, { bs: o.bs }) : null;
      if (tn) { out.push(_yzIndent_(tn, pad)); first = false; }
      i++; continue;
    }
    if (L.k === "box") {
      var T = _yzRtTone_(L.tone), kids = [];   // 第 39 批：顏色＋符號（符號可能是空的＝不要符號：LINE 不能放空的字，那一欄整個拿掉）
      for (j = i; j < ls.length && ls[j].k === "box" && ls[j].tone === L.tone && (ls[j].lv || 0) === (L.lv || 0); j++) { var bb = _yzRtBand_(ls[j].runs), bn = _yzCpWrap_(_yzMarkBand_(_yzRtTextNode_(ls[j].runs, { size: size, color: T.ink, band: !!bb }), bb), ls[j].runs, size); if (bn) kids.push(bn); }   // 第 30 批：整行螢光＝底色
      if (kids.length === 1) out.push(_yzIndent_({
        type: "box", layout: "horizontal", spacing: "sm", backgroundColor: T.bg, borderColor: T.bd, borderWidth: "1px", cornerRadius: "8px", paddingAll: "9px",
        contents: (T.icon ? [{ type: "text", text: T.icon, size: size, flex: 0 }] : []).concat([{ type: "box", layout: "vertical", flex: 1, spacing: "xs", contents: kids }])
      }, pad));
      else if (kids.length > 1) {   // 第 28 批：好幾行的標註：一行一列、中間一條線（跟編輯器裡看到的一樣）；圖示只在第一列，每一列的字對齊
        var icw = YZ_BOX_ICW[size] || "22px", rows = [];
        kids.forEach(function (k, n) {
          if (n) rows.push({ type: "separator", color: T.bd });
          rows.push({ type: "box", layout: "horizontal", spacing: "sm", paddingAll: "9px", contents: (T.icon ? [
            { type: "box", layout: "vertical", width: icw, contents: [{ type: "text", text: n ? " " : T.icon, size: size }] }
          ] : []).concat([Object.assign({}, k, { flex: 1 })]) });
        });
        out.push(_yzIndent_({ type: "box", layout: "vertical", backgroundColor: T.bg, borderColor: T.bd, borderWidth: "1px", cornerRadius: "8px", contents: rows }, pad));
      }
      i = j; first = false; continue;
    }
    if (L.k === "quote") {
      var qk = [];
      for (j = i; j < ls.length && ls[j].k === "quote" && (ls[j].lv || 0) === (L.lv || 0); j++) { var qb = _yzRtBand_(ls[j].runs), qn = _yzCpWrap_(_yzMarkBand_(_yzRtTextNode_(ls[j].runs, { size: size, color: "#4A5565", band: !!qb }), qb), ls[j].runs, size); if (qn) qk.push(qn); }
      // 左邊那條線：外框塗灰色、只留 3px，裡面的白底蓋掉其餘的（比「單邊框線」可靠，LINE 沒有單邊框線）
      if (qk.length) out.push(_yzIndent_({ type: "box", layout: "horizontal", backgroundColor: "#B8C2CC", paddingStart: "3px", contents: [{ type: "box", layout: "vertical", backgroundColor: "#FFFFFF", paddingStart: "10px", spacing: "xs", contents: qk }] }, pad));
      i = j; first = false; continue;
    }
    var fxl = L.k === "plain" ? _yzFxOnly_(L.runs) : null, fxn = fxl ? _yzFxFlex_(fxl.t, { size: size, color: L.runs.length && fxl.c && YZ_RT_COLORS[fxl.c] ? YZ_RT_COLORS[fxl.c] : color, weight: fxl.b ? "bold" : "" }) : null;
    if (fxn) {   // 第 31 批：整行只有一個公式（裡面有分數）→ 上下排的分數（LINE 只能這樣排；夾在句子裡的照下面一般的字，用 ¹⁄₆）
      out.push(_yzIndent_(fxl.m && YZ_RT_MARKS[fxl.m] ? _yzMarkBand_(fxn, fxl.m) : fxn, pad));   // 整行的公式畫了螢光筆：一樣有底色
      first = false; i++; continue;
    }
    var band = _yzRtBand_(L.runs);   // 第 30 批：整行畫了同一色螢光筆
    if (L.k === "item") {
      var body = _yzCpWrap_(_yzMarkBand_(_yzRtTextNode_(L.runs, { size: size, color: color, flex: 1, band: !!band }), band), L.runs, size);   // 第 32 批：反灰可複製
      if (body) { var irow = { type: "box", layout: "horizontal", spacing: "sm", contents: [{ type: "text", text: L.mark, size: size, color: o.markColor || "#4A5565", flex: 0 }, body] }; if (pad) irow.paddingStart = pad + "px"; out.push(irow); }   // 沒縮排就不放 paddingStart（不留 undefined）
      i++; first = false; continue;
    }
    if (L.k === "head") {
      var H = YZ_RT_HEAD["h" + L.h];
      node = _yzMarkBand_(_yzRtTextNode_(L.runs, { size: H.line, color: H.color, weight: "bold", margin: first ? undefined : (L.h <= 2 ? "xxl" : "xl"), band: !!band }), band);   // 第 27 批：標題前面空大一點（太擠）
    } else node = _yzMarkBand_(_yzRtTextNode_(L.runs, { size: size, color: color, band: !!band }), band);
    node = _yzCpWrap_(node, L.runs, size);   // 第 32 批：反灰可複製（灰條＋📋 複製）
    if (node) {
      out.push(_yzIndent_(node, pad));   // 第 27 批：標題也能縮排（以前標題不縮）
      first = false;
    }
    i++;
  }
  return out;
}

// ── 表格 ──
// 一段字在 LINE 上大概多寬（px）：中文一個字佔一格；英數字照一般無襯線字體的寬度估（m、W 比較寬，i、l 比較窄），再多留 6% 的餘地。
// 只是估計，實機才準（待實機確認）。估得偏寬一點沒關係，頂多欄寬多給一點；估太窄才會把「00003」「100mL/BT」硬拆成兩行。
var YZ_CW_ = (function () {
  var m = {};
  function put(chars, w) { for (var i = 0; i < chars.length; i++) m[chars.charAt(i)] = w; }
  put("ijl", 0.222); put(" !,./:;I[\\]ft", 0.278); put("()-r`", 0.333); put("*", 0.389);
  put("ckJsvxyz", 0.5); put("0123456789abdeghnopquL?_#$", 0.556); put("+<=>~", 0.584);
  put("FTZ", 0.611); put("ABEKPSVXY&", 0.667); put("CDHNRUw", 0.722); put("GOQ", 0.778);
  put("mM", 0.833); put("%", 0.889); put("W", 0.944); put("'", 0.191); put("|", 0.26);
  put("\"", 0.355); put("^", 0.469); put("{}", 0.334); put("@", 1.015);
  return m;
})();
var YZ_CW_SAFE = 1.06;
function _yzCharW_(c, ch) {   // 一個字的寬度（單位：字級的幾倍）
  if (c >= 0x2E80 || (c >= 0x2460 && c <= 0x25FF)) return 1;            // 中文、全形符號、圈號
  if (c >= 0x2010 && c <= 0x2027) return 0.7;                            // – — … 之類
  if (c >= 0x2000) return 1;
  var w = YZ_CW_[ch]; return w === undefined ? 0.6 : w;
}
function _yzTxtW_(s, px) {
  var w = 0; s = String(s === null || s === undefined ? "" : s);
  for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); w += _yzCharW_(c, s.charAt(i)) * (c >= 0x2E80 ? 1 : YZ_CW_SAFE); }
  return w * px;
}
// 一格字「最少要多寬」才不會被硬拆開：英文數字連在一起的（例如 10mL/BT）不能拆；中文可以在任何字後面換行，至少留兩個字寬
function _yzNeedW_(s, px) {
  var need = 0, run = 0, cjk = 0;
  s = String(s === null || s === undefined ? "" : s);
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i), ch = s.charAt(i);
    if (/\s/.test(ch)) { if (run > need) need = run; run = 0; cjk = 0; continue; }
    if (c >= 0x2E80 || (c >= 0x2460 && c <= 0x25FF)) {
      if (run > need) need = run; run = 0; cjk++;
      var cw = Math.min(cjk, 2) * px; if (cw > need) need = cw;
    } else { cjk = 0; run += _yzTxtW_(ch, px); }
  }
  if (run > need) need = run;
  return need;
}
// 第 29 批：合併儲存格。tb.mg＝[[列, 欄, 跨幾列, 跨幾欄], …]（左上角那一格的字代表整塊；重疊、超出表格的不算）
// → { rows, nr, nc, at[列][欄]＝屬於第幾塊, ps:[{ r, c, rs, cs, v }]（每一塊：合併的、一般的一格）, merged：有沒有合併 }
function _yzTblGrid_(tb) {
  var rows = (tb && Array.isArray(tb.rows) ? tb.rows : []).map(function (r) { return Array.isArray(r) ? r : []; }), nr = rows.length, nc = 0, at = [], ps = [], i, j;
  rows.forEach(function (r) { nc = Math.max(nc, r.length); });
  for (i = 0; i < nr; i++) { at.push([]); for (j = 0; j < nc; j++) at[i].push(-1); }
  (tb && Array.isArray(tb.mg) ? tb.mg : []).forEach(function (m) {
    if (!Array.isArray(m) || m.length !== 4) return;
    var r = Math.floor(+m[0]), c = Math.floor(+m[1]), rs = Math.floor(+m[2]), cs = Math.floor(+m[3]), a, b;
    if (!(r >= 0 && c >= 0 && rs >= 1 && cs >= 1 && rs * cs >= 2 && r + rs <= nr && c + cs <= nc)) return;
    for (a = r; a < r + rs; a++) for (b = c; b < c + cs; b++) if (at[a][b] >= 0) return;   // 跟前面的重疊：不算
    for (a = r; a < r + rs; a++) for (b = c; b < c + cs; b++) at[a][b] = ps.length;
    ps.push({ r: r, c: c, rs: rs, cs: cs });
  });
  var merged = ps.length > 0;
  for (i = 0; i < nr; i++) for (j = 0; j < nc; j++) if (at[i][j] < 0) { at[i][j] = ps.length; ps.push({ r: i, c: j, rs: 1, cs: 1 }); }
  ps.forEach(function (p) { var v = rows[p.r][p.c]; p.v = v === undefined || v === null ? "" : String(v); });
  return { rows: rows, nr: nr, nc: nc, at: at, ps: ps, merged: merged };
}
function _yzTblMg_(tb) { if (!tb || !Array.isArray(tb.mg) || !tb.mg.length) return null; var G = _yzTblGrid_(tb); return G.merged ? G : null; }   // 有合併的格子才給
// 算這張表在某一級卡片上怎麼排：每欄分多寬（flex 比例）、要不要把字縮小一號、還是太擠
function _yzTableFit_(tb, bs) {
  var G = _yzTblMg_(tb);   // 有合併的格子：跨好幾欄的字不算在左上角那一欄（不然那一欄會被撐得很寬）、被蓋住的格子不算
  var rows = G ? G.rows : (tb && tb.rows || []).filter(function (r) { return r && r.length; });
  var nc = 0; rows.forEach(function (r) { nc = Math.max(nc, r.length); });
  var out = { nc: nc, size: "xs", flex: [], tooWide: false, shrunk: false, minTotal: 0, avail: 0, xsMin: [], alloc: [] };
  if (!nc) return out;
  var head = !tb || tb.head !== false;
  // 可用寬度 ＝ 卡片寬 − 內文左右各 13 − 外框 2 − 欄與欄之間的分隔線
  var avail = (YZ_BUBBLE_PX[bs || "giga"] || 340) - 26 - 2 - (nc - 1);
  var tries = [[13, "xs"], [11, "xxs"]], best = null;
  for (var t = 0; t < tries.length; t++) {
    var px = tries[t][0], minW = [], maxW = [], sMin = 0, sMax = 0;
    for (var c = 0; c < nc; c++) {
      var mn = 0, mx = 0;
      for (var ri = 0; ri < rows.length; ri++) {
        if (G) { var pp = G.ps[G.at[ri][c]]; if (pp.r !== ri || pp.c !== c || pp.cs > 1) continue; }
        var v = rows[ri][c], str = (v === undefined || v === null) ? "" : String(v), f = head && ri === 0 ? 1.07 : 1;
        mn = Math.max(mn, _yzNeedW_(str, px) * f); mx = Math.max(mx, _yzTxtW_(str, px) * f);
      }
      var a = Math.ceil(mn) + 12, b = Math.max(a, Math.min(Math.ceil(mx) + 12, 200));
      minW.push(a); maxW.push(b); sMin += a; sMax += b;
    }
    if (t === 0) out.xsMin = minW.slice();
    best = { size: tries[t][1], minW: minW, maxW: maxW, sMin: sMin, sMax: sMax };
    if (sMin <= avail) break;      // 這個字級放得下，就用它
  }
  var alloc;
  if (best.sMax <= avail) alloc = best.maxW.slice();                       // 每一欄都放得下單行
  else if (best.sMin <= avail) {                                           // 先給每欄「最少要的」，剩下的照「還想要多少」分
    var left = avail - best.sMin, want = best.sMax - best.sMin;
    alloc = best.minW.map(function (m, c) { return m + (want ? left * (best.maxW[c] - m) / want : 0); });
  } else { alloc = best.minW.slice(); out.tooWide = true; }
  out.size = best.size; out.shrunk = best.size !== "xs"; out.minTotal = best.sMin; out.avail = Math.floor(avail); out.alloc = alloc;
  out.flex = alloc.map(function (a) { return Math.max(1, Math.round(a)); });
  return out;
}
// 給編輯器提醒用：這張表在這個大小的卡片上會不會太擠？（自動欄寬、手動比例都算）
function _yzTableCheck_(tb, bs) {
  var fit = _yzTableFit_(tb, bs), nc = fit.nc;
  fit.manual = !!(tb && tb.w && tb.w.length === nc);
  fit.narrow = [];
  if (fit.manual) {
    var sum = 0; tb.w.forEach(function (x) { sum += Number(x) || 1; });
    tb.w.forEach(function (x, c) { var got = fit.avail * (Number(x) || 1) / sum; if (got < fit.xsMin[c] - 1) fit.narrow.push(c + 1); });
  }
  return fit;
}
// 表格：外框一圈、格與格之間用細線（separator）隔開；每一列自己決定高度。
// 沒指定欄寬比例（w）就自動算；指定了就照比例（flex 一律取整數）。
function _yzTable_(tb, o) {
  var G = _yzTblMg_(tb);
  if (G) {   // 第 29 批：有合併的格子
    var fitM = _yzTableFit_(tb, o && o.bs), wM, sizeM = "xs";
    if (tb.w && tb.w.length === G.nc) wM = tb.w.map(function (x) { return Math.max(1, Math.round((Number(x) || 1) * 10)); });
    else { wM = fitM.flex; sizeM = fitM.size; }
    var mn = _yzTableMgNode_(G, wM, sizeM, tb.head !== false);
    if (mn) return mn;
    tb = Object.assign({}, tb, { mg: [], rows: G.rows.map(function (r, i) { return r.map(function (v, j) { var p = G.ps[G.at[i][j]]; return p.r === i && p.c === j ? v : ""; }); }) });   // 切不開的怪形狀：照一般的一列一列排（合併的字留在左上角那一格）
  }
  var rows = (tb && tb.rows || []).filter(function (r) { return r && r.length; });
  if (!rows.length) return null;
  var nc = 0; rows.forEach(function (r) { nc = Math.max(nc, r.length); });
  var fit = _yzTableFit_(tb, o && o.bs), size = "xs", w;
  if (tb.w && tb.w.length === nc) w = tb.w.map(function (x) { return Math.max(1, Math.round((Number(x) || 1) * 10)); });
  else { w = fit.flex; size = fit.size; }
  var head = tb.head !== false;
  var rowBoxes = [];
  rows.forEach(function (r, ri) {
    var isHead = head && ri === 0;
    var cells = [];
    for (var ci = 0; ci < nc; ci++) {
      if (ci > 0) cells.push({ type: "separator", color: "#CBD2DA" });
      cells.push({
        type: "box", layout: "vertical", flex: w[ci], paddingAll: "4px",
        contents: [{ type: "text", text: String(r[ci] === undefined || r[ci] === null || r[ci] === "" ? " " : r[ci]), size: size, wrap: true, align: "center", weight: isHead ? "bold" : "regular", color: "#1F1F1F" }]
      });
    }
    if (ri > 0) rowBoxes.push({ type: "separator", color: "#CBD2DA" });
    rowBoxes.push({ type: "box", layout: "horizontal", spacing: "none", backgroundColor: isHead ? "#F1F3F4" : "#FFFFFF", contents: cells });
  });
  return { type: "box", layout: "vertical", spacing: "none", borderWidth: "1px", borderColor: "#CBD2DA", cornerRadius: "4px", contents: rowBoxes };
}

// 第 29 批：有合併儲存格的表格。LINE 的卡片沒有「跨欄、跨列」：照「能整條切開的地方」一層一層切成上下、左右的小框，
// 合併的那一格就是一個大框（字在正中間）。切不開的怪形狀（很少見）回 null（照一般的排）
function _yzTableMgNode_(G, w, size, head) {
  var line = "#CBD2DA";
  var sumW = function (a, b) { var s = 0; for (var c = a; c < b; c++) s += w[c] || 1; return Math.max(1, Math.round(s)); };
  var leaf = function (p) {
    var isHead = head && p.r === 0;
    return { type: "box", layout: "vertical", paddingAll: "4px", justifyContent: "center", backgroundColor: isHead ? "#F1F3F4" : "#FFFFFF",
      contents: [{ type: "text", text: p.v === "" ? " " : p.v, size: size, wrap: true, align: "center", weight: isHead ? "bold" : "regular", color: "#1F1F1F" }] };
  };
  var bad = false;
  var node = function (r0, r1, c0, c1) {
    var p = G.ps[G.at[r0][c0]], r, c, ok, cuts = [], kids = [], k, n;
    if (p.r === r0 && p.c === c0 && p.rs === r1 - r0 && p.cs === c1 - c0) return leaf(p);
    for (r = r0 + 1; r < r1; r++) { ok = true; for (c = c0; c < c1 && ok; c++) if (G.at[r - 1][c] === G.at[r][c]) ok = false; if (ok) cuts.push(r); }
    if (cuts.length) {   // 上下切（整條橫線）
      cuts = [r0].concat(cuts, [r1]);
      for (k = 0; k + 1 < cuts.length; k++) { if (k) kids.push({ type: "separator", color: line }); kids.push(node(cuts[k], cuts[k + 1], c0, c1)); }
      return { type: "box", layout: "vertical", spacing: "none", contents: kids };
    }
    for (c = c0 + 1; c < c1; c++) { ok = true; for (r = r0; r < r1 && ok; r++) if (G.at[r][c - 1] === G.at[r][c]) ok = false; if (ok) cuts.push(c); }
    if (cuts.length) {   // 左右切（整條直線）：每一份的寬＝那幾欄加起來
      cuts = [c0].concat(cuts, [c1]);
      // 沒有「跨列」的那幾欄放在同一份（裡面再一列一列切：同一列才對得齊）；有跨列的自己一份
      var spans = function (a, b) { for (var rr = r0; rr < r1; rr++) for (var cc = a; cc < b; cc++) if (G.ps[G.at[rr][cc]].rs > 1) return true; return false; };
      var segs = [];
      for (k = 0; k + 1 < cuts.length; k++) {
        var sp = spans(cuts[k], cuts[k + 1]), last = segs[segs.length - 1];
        if (r1 - r0 > 1 && last && !last.sp && !sp) last.b = cuts[k + 1]; else segs.push({ a: cuts[k], b: cuts[k + 1], sp: sp });
      }
      if (segs.length < 2) segs = cuts.slice(0, -1).map(function (a, q) { return { a: a, b: cuts[q + 1] }; });   // 保險：不會整塊又是自己
      segs.forEach(function (sg, q) { if (q) kids.push({ type: "separator", color: line }); n = node(r0, r1, sg.a, sg.b); n.flex = sumW(sg.a, sg.b); kids.push(n); });
      return { type: "box", layout: "horizontal", spacing: "none", contents: kids };
    }
    bad = true;
    return leaf(p);
  };
  var root = G.nr && G.nc ? node(0, G.nr, 0, G.nc) : null;
  if (!root || bad) return null;
  var kids = root.layout === "vertical" && !root.paddingAll ? root.contents : [root];
  return { type: "box", layout: "vertical", spacing: "none", borderWidth: "1px", borderColor: line, cornerRadius: "4px", contents: kids };
}

// 圖片：設定「圖片直接顯示」開著就直接放圖；關掉就換成一個按鈕（點了開網頁，要登入才看得到）
function _yzImage_(im, act, hid) {   // hid：保密（不直接顯示）時寫的字（第 40 批：流程圖寫「這裡有一張流程圖」）
  if (!im || !im.url) return null;
  var cap = _yzT_(im.cap, { size: "xs", color: "#6B7280", align: "center" });
  if (!YZ_CFG.imgDirect) {
    var bx = { type: "box", layout: "vertical", spacing: "xs", backgroundColor: "#F1F3F4", cornerRadius: "8px", paddingAll: "10px", contents: [
      { type: "text", text: hid || "🖼 這裡有一張圖（為了保密，不直接顯示）", size: "xs", color: "#5F6B7A", wrap: true, align: "center" }
    ] };
    if (cap) bx.contents.push(cap);
    var wb = _yzWebBtn_("🖼 登入網頁看圖", YZ_CFG.webUrl);
    if (wb) bx.contents.push(wb);
    return bx;
  }
  var box = { type: "box", layout: "vertical", spacing: "xs", contents: [] };
  var img = { type: "image", url: im.url, size: "full", aspectMode: "fit", aspectRatio: im.ar || "4:3" };
  if (act) img.action = act;
  box.contents.push(img);
  if (cap) box.contents.push(cap);
  return box;
}

// ── 流程圖（第 40 批：編輯器自由畫：框、箭頭、說明框）──
// 存在「圖片」那一塊（t:"img"）裡：url／fid＝整張流程圖的 PNG（網頁、Word、退回舊版本的程式都當一般的圖看）；draw＝畫的資料：
//   { v:1, W:畫布寬, H:畫布高, s:[框…], l:[箭頭…], h:畫成 PNG 時的資料指紋, line:{ url, fid, ar }（LINE 用的：沒有說明框的那一張；沒有說明框就沒有） }
//   框：{ id, k:種類, x, y, w, h, c:顏色（不寫＝黑框白底）, al:字靠哪邊（c 置中、l 靠左、r 靠右）, v:框裡的字（格式文字：紅字、粗體、螢光筆、編號…）, ds:框線（第 41 批：不寫＝實線、dash 虛線、dot 點線、long 長虛線） }
//   箭頭：{ id, a:從哪個框, b:到哪個框, t:箭頭上的字（是／否…）, st:路線（auto 自動、line 直線、hv 先橫再直、vh 先直再橫）, ah:箭頭（end 指到 b、start 指到 a、both 兩邊、none 沒有）,
//          第 41 批：ds:線條（不寫＝實線、dash 虛線、dot 點線、long 長虛線）、lw:粗細（thin 細、不寫＝一般、thick 粗）、lc:顏色（不寫＝藍、black、gray、red、orange、green、purple） }
// LINE：這一張放流程圖（有說明框的話放沒有說明框的那一張；點一下看大圖），往左滑下一張是說明框的字（照框的顏色）。
var YZ_DRAW_KINDS = ["box", "round", "dia", "pill", "oval", "note", "txt"];
var YZ_DRAW_KIND_NAME = { box: "方框", round: "圓角框", dia: "判斷（菱形）", pill: "開始／結束", oval: "橢圓", note: "說明框", txt: "只有字" };
var YZ_DRAW_COLORS = ["", "info", "warn", "bad", "ok", "purple", "gray"];
var YZ_DRAW_TONE = {
  "": { bg: "#FFFFFF", bd: "#1F2328", ink: "#1F2328", label: "黑框白底" },
  info: { bg: "#EAF3FB", bd: "#3D7CC9", ink: "#1B3A57", label: "藍" },
  warn: { bg: "#FFF6DB", bd: "#C99A1E", ink: "#5B4300", label: "黃" },
  bad: { bg: "#FDECEC", bd: "#CF5B5B", ink: "#7A1F1F", label: "紅" },
  ok: { bg: "#E8F5EC", bd: "#3E9A5E", ink: "#1F5130", label: "綠" },
  purple: { bg: "#F4EEFD", bd: "#8A68CC", ink: "#40296E", label: "紫" },
  gray: { bg: "#F1F3F5", bd: "#7D8894", ink: "#374151", label: "灰" }
};
function _yzDrawTone_(c) { return YZ_DRAW_TONE.hasOwnProperty(c || "") ? YZ_DRAW_TONE[c || ""] : YZ_DRAW_TONE[""]; }
// 第 41 批：連線（箭頭）、框線的樣子
var YZ_DRAW_DASH_ORDER = ["", "dash", "dot", "long"];
var YZ_DRAW_DASH = { "": { label: "實線" }, dash: { label: "虛線", arr: [7, 5] }, dot: { label: "點線", arr: [0.1, 4.4], cap: "round" }, long: { label: "長虛線", arr: [16, 6] } };   // arr：線寬 2 的時候，線、空各多長（別的粗細照比例）
var YZ_DRAW_LW_ORDER = ["thin", "", "thick"];
var YZ_DRAW_LW = { thin: { label: "細", w: 1.4 }, "": { label: "一般", w: 2 }, thick: { label: "粗", w: 3.5 } };
var YZ_DRAW_LC_ORDER = ["", "black", "gray", "red", "orange", "green", "purple"];
var YZ_DRAW_LC = { "": { label: "藍", c: "#2F6FD6" }, black: { label: "黑", c: "#1F2328" }, gray: { label: "灰", c: "#7D8894" }, red: { label: "紅", c: "#D23F3F" }, orange: { label: "橘", c: "#D9822B" }, green: { label: "綠", c: "#2E8B57" }, purple: { label: "紫", c: "#7B5BC4" } };
function _yzDrawOpt_(map, v) { return v && Object.prototype.hasOwnProperty.call(map, v) ? v : ""; }   // 不認得的＝""（預設）
function _yzDrawHasText_(s) { return !!(s && _yzRtPlainLines_(s.v).length); }
// 說明框（有字的）：照位置，上到下、左到右
function _yzDrawNotes_(d) {
  return ((d && d.s) || []).filter(function (s) { return s && s.k === "note" && _yzDrawHasText_(s); }).sort(function (a, b) { return a.y - b.y || a.x - b.x; });
}
// 流程的順序（說明框以外的框）：照箭頭走（沒有箭頭指進來的先走），同時可以走的照位置；繞圈的照位置補上
function _yzDrawOrder_(d) {
  var ss = ((d && d.s) || []).filter(function (s) { return s && s.k !== "note"; }), by = {}, indeg = {}, out = [], done = {};
  ss.forEach(function (s) { by[s.id] = s; indeg[s.id] = 0; });
  var ls = ((d && d.l) || []).filter(function (l) { return l && by[l.a] && by[l.b] && l.a !== l.b; });
  ls.forEach(function (l) { indeg[l.b]++; });
  var pos = function (a, b) { return a.y - b.y || a.x - b.x; };
  var ready = ss.filter(function (s) { return !indeg[s.id]; }).sort(pos);
  while (out.length < ss.length) {
    if (!ready.length) { var rest = ss.filter(function (s) { return !done[s.id]; }).sort(pos); if (!rest.length) break; ready = [rest[0]]; }
    var s = ready.shift();
    if (done[s.id]) continue;
    done[s.id] = 1; out.push(s);
    ls.forEach(function (l) { if (l.a === s.id && --indeg[l.b] <= 0 && !done[l.b]) ready.push(by[l.b]); });
    ready.sort(pos);
  }
  return out;
}
// 流程圖的字（一行一行）：Word 匯出、AI 出題、圖片裡的字（舊程式搜尋用）都用這一份
//   1. 第一個框的字　→（有好幾條路、箭頭上有字、或不是接下一個的時候）→ 3.（是）、5.（否）　【說明】說明框的字
function _yzDrawLines_(d) {
  var fl = _yzDrawOrder_(d), num = {}, out = [];
  fl.forEach(function (s, i) { num[s.id] = i + 1; });
  fl.forEach(function (s, i) {
    var t = _yzRtPlainLines_(s.v).join(" ");
    out.push((i + 1) + ". " + (t || "（沒有字）"));
    var go = ((d && d.l) || []).filter(function (l) { return l && l.a === s.id && num[l.b] && l.b !== s.id; });
    var lab = function (l) { return String(l.t || "").replace(/\s+/g, " ").trim(); };
    if (go.length > 1 || go.some(function (l) { return lab(l) || num[l.b] !== i + 2; }))
      out.push("　→ " + go.map(function (l) { return num[l.b] + "." + (lab(l) ? "（" + lab(l) + "）" : ""); }).join("、"));
  });
  _yzDrawNotes_(d).forEach(function (s) { _yzRtPlainLines_(s.v).forEach(function (ln, j) { out.push((j ? "　" : "【說明】") + ln); }); });
  return out;
}
// LINE：流程圖那一張圖（有說明框：用沒有說明框的那一張）
function _yzDrawImage_(b, act) {
  var L = b && b.draw && b.draw.line && b.draw.line.url ? b.draw.line : null;
  return _yzImage_({ url: L ? L.url : b.url, ar: (L && L.ar) || b.ar, cap: b.cap }, act, "🔀 這裡有一張流程圖（為了保密，不直接顯示）");
}
// LINE：說明框那一張的內容（照框的顏色；字的格式跟文字塊一樣）
function _yzDrawNoteNodes_(d, bs) {
  var ns = _yzDrawNotes_(d);
  if (!ns.length) return [];
  var out = [{ type: "text", text: "📝 說明（流程圖在前一張）", size: "xs", weight: "bold", color: "#5F6B7A", wrap: true }];
  ns.forEach(function (s) {
    var T = _yzDrawTone_(s.c), kids = _yzTextLines_(s.v, { bs: bs, color: T.ink });
    if (kids.length) out.push({ type: "box", layout: "vertical", spacing: "sm", backgroundColor: T.bg, borderColor: T.bd, borderWidth: "1px", cornerRadius: "6px", paddingAll: "10px", contents: kids });
  });
  return out.length > 1 ? out : [];
}

// ── 動畫（兩種）──
// ① 動畫檔（kind:"file"：GIF／APNG／WebP 一個檔）：LINE 卡片只有「APNG、300 KB 以內」能自己動；其他的顯示「第一格＋▶ 在網頁看動畫」。
// ② 分步動畫（kind:"steps"：幾張圖輪流）：LINE 上做成「左右滑的一排卡片」，一步一張（不會自己動）；網頁上才會自動輪播。
function _yzKbText_(n) { return n >= 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB"; }
// 「在網頁看」的連結：正式版由 LINE 專案給（YZ_CFG.link，帶這個人自己的網頁鑰匙）；沒有網址（網頁還沒接好）就回空字串，按鈕不放
function _yzAnimLink_(tid) { var u = typeof YZ_CFG.link === "function" ? YZ_CFG.link(tid) : (YZ_CFG.webUrl ? YZ_CFG.webUrl + "?t=" + encodeURIComponent(tid || "") : ""); return /^https:\/\//.test(u || "") ? u : ""; }
function _yzWebBtn_(label, uri) { return /^https:\/\//.test(uri || "") ? { type: "button", style: "secondary", height: "sm", action: { type: "uri", label: label, uri: uri } } : null; }
function _yzFmtName_(f) { return f === "gif" ? "GIF" : f === "apng" ? "APNG" : f === "webp" ? "WebP" : "這個格式"; }
// 這個動畫檔放在 LINE 卡片上，能不能自己動？{ok, why}（why 是給開發者看的白話原因）
function _yzAnimWhy_(b, used) {
  if (!b || !b.url) return { ok: false, why: "還沒有動畫檔" };
  if (b.fmt !== "apng") return { ok: false, why: _yzFmtName_(b.fmt) + "：LINE 卡片只能播 APNG，所以卡片上只顯示第一格，旁邊放「▶ 在網頁看動畫」按鈕" };
  if ((b.bytes || 0) > YZ_ANIM_MAX_BYTES) return { ok: false, why: "檔案 " + _yzKbText_(b.bytes) + "，超過 LINE 動畫的上限 300 KB，所以卡片上只顯示第一格＋「▶ 在網頁看動畫」按鈕" };
  if (Math.max(b.w || 0, b.h || 0) > YZ_ANIM_MAX_PX) return { ok: false, why: "圖最長邊 " + Math.max(b.w || 0, b.h || 0) + " px，超過 LINE 的 1024 px，所以卡片上只顯示第一格＋「▶ 在網頁看動畫」按鈕" };
  if ((used || 0) >= YZ_ANIM_PER_MSG) return { ok: false, why: "同一則訊息已經有 " + YZ_ANIM_PER_MSG + " 張會動的圖（LINE 上限），這一張改成第一格＋按鈕" };
  return { ok: true, why: "APNG、" + _yzKbText_(b.bytes || 0) + "、" + (b.w || "?") + "×" + (b.h || "?") + "：LINE 卡片上會自己動（對方的 LINE 要開「自動播放」才會動）" };
}
// play＝卡片上自己動　poster＝只顯示第一格＋按鈕　button＝連第一格都不顯示（保密設定）
function _yzAnimMode_(b, used) {
  if (!YZ_CFG.imgDirect) return "button";
  if (!YZ_CFG.animDirect) return "poster";
  return _yzAnimWhy_(b, used).ok ? "play" : "poster";
}
function _yzAnimFile_(b, o) {
  o = o || {};
  if (!b || (!b.url && !b.poster)) return null;
  var used = o.used || { n: 0 }, mode = _yzAnimMode_(b, used.n);
  var cap = _yzT_(b.cap, { size: "xs", color: "#6B7280", align: "center" });
  var link = _yzWebBtn_("▶ 在網頁看動畫", _yzAnimLink_(o.tid));
  if (mode === "button") {
    var bx = { type: "box", layout: "vertical", spacing: "xs", backgroundColor: "#F1F3F4", cornerRadius: "8px", paddingAll: "10px", contents: [
      { type: "text", text: "🎞 這裡有一段動畫（為了保密，不直接顯示）", size: "xs", color: "#5F6B7A", wrap: true, align: "center" }
    ] };
    if (cap) bx.contents.push(cap);
    var lb = _yzWebBtn_("🎞 登入網頁看動畫", _yzAnimLink_(o.tid));
    if (lb) bx.contents.push(lb);
    return bx;
  }
  var box = { type: "box", layout: "vertical", spacing: "xs", contents: [] };
  if (mode === "play") {
    used.n++;
    box.contents.push({ type: "image", url: b.raw || b.url, size: "full", aspectMode: "fit", aspectRatio: b.ar || "4:3", animated: true });   // 會動的要原檔（raw）；縮圖網址只有第一格
  } else {
    var im = { type: "image", url: b.poster || b.url, size: "full", aspectMode: "fit", aspectRatio: b.ar || "4:3" };
    if (o.act) im.action = o.act;
    box.contents.push(im);
    box.contents.push({ type: "text", text: "🎞 這是動畫，卡片上只顯示第一格", size: "xxs", color: "#7B8696", align: "center", wrap: true });
  }
  if (cap) box.contents.push(cap);
  if (mode === "poster" && link) box.contents.push(link);
  return box;
}
// 分步動畫 → 一排卡片（一步一張，左右滑）
function _yzStepBubbles_(ch, ti, b, bs, o) {
  o = o || {};
  var steps = (b.steps || []).filter(function (s) { return s && (s.url || String(s.cap || "").trim()); }).slice(0, YZ_STEPS_MAX), n = steps.length;
  return steps.map(function (s, i) {
    var body = [], im = _yzImage_({ url: s.url, ar: s.ar, cap: "" }, o.act ? o.act(b, i) : null);
    if (im) body.push(im);
    var cap = _yzT_(s.cap, { size: "sm", color: "#1F1F1F" }); if (cap) body.push(cap);
    return {
      type: "bubble", size: bs,
      header: _yzHead_("🎞 步驟 " + (i + 1) + "／" + n, ti.name, i < n - 1 ? "左右滑，看下一步 ›" : "最後一步"),
      body: { type: "box", layout: "vertical", spacing: "md", paddingAll: "13px", contents: body.length ? body : [{ type: "text", text: "（這一步還沒有內容）", size: "sm", color: "#7B8696" }] },
      footer: { type: "box", layout: "vertical", paddingAll: "10px", contents: [_yzFoot_()] }
    };
  });
}

// ── 藥戰手冊頁數（備註裡的欄位：這一段對應紙本手冊的第幾頁）──
// 打「14」「14-15」「P.14」「12、15」都看得懂；看不懂的寫法（例如「附錄 3」）照原樣顯示。
function _yzNorm_(s) {   // 全形 → 半形、英文轉小寫。一個字換一個字，長度不變（拿來對位置用）
  s = String(s === null || s === undefined ? "" : s);
  var o = "";
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i), ch = s.charAt(i);
    if (c === 0x3000) ch = " "; else if (c >= 0xFF01 && c <= 0xFF5E) ch = String.fromCharCode(c - 0xFEE0);
    var l = ch.toLowerCase(); o += (l.length === 1 ? l : ch);
  }
  return o;
}
function _yzPageText_(p) {
  var raw = String(p === null || p === undefined ? "" : p).replace(/\s+/g, " ").trim();
  if (!raw) return "";
  var n = _yzNorm_(raw).replace(/\s+/g, ""), m = /^(?:p\.?|page|第)?(\d{1,4})(?:[-~–—至](\d{1,4}))?頁?$/.exec(n);
  if (m) return "第 " + m[1] + (m[2] ? "–" + m[2] : "") + " 頁";
  if (/^\d{1,4}(?:[、,]\d{1,4})+$/.test(n)) return "第 " + n.split(/[、,]/).join("、") + " 頁";
  return raw;
}
function _yzPageShort_(p) {   // 清單裡用的短寫法：第 13–14 頁 → P.13–14
  var t = _yzPageText_(p);
  var m = /^第 (.+) 頁$/.exec(t);
  return m ? "P." + m[1] : t;
}
function _yzPageNums_(p) {    // 「12–14」→ [12,13,14]；「12、15」→ [12,15]；看不懂 → []
  var n = _yzNorm_(String(p === null || p === undefined ? "" : p)).replace(/\s+/g, ""), out = [];
  if (!/\d/.test(n)) return out;
  n.replace(/^(?:p\.?|page|第)/, "").replace(/頁$/, "").split(/[、,]/).forEach(function (seg) {
    var m = /^(\d{1,4})(?:[-~–—至](\d{1,4}))?$/.exec(seg);
    if (!m) return;
    var a = +m[1], b = m[2] ? +m[2] : a;
    if (b < a) { var x = a; a = b; b = x; }
    if (b - a > 200) b = a + 200;
    for (var i = a; i <= b; i++) out.push(i);
  });
  return out;
}
function _yzPageHas_(p, n) { return _yzPageNums_(p).indexOf(n) >= 0; }
function _yzPageQuery_(q) {   // 搜尋時打「第14頁」「p14」「14頁」→ 14；不是這種打法 → 0
  var n = _yzNorm_(String(q === null || q === undefined ? "" : q)).replace(/\s+/g, "");
  var m = /^(?:第|p\.?|page)(\d{1,4})頁?$/.exec(n) || /^(\d{1,4})頁$/.exec(n);
  return m ? +m[1] : 0;
}

// 備註有沒有寫字：空白、空行、看不見的字（零寬空白，從別的地方複製過來常夾帶）都不算
function _yzNoteHas_(note) { return !!String(note === null || note === undefined ? "" : note).replace(/[\u200B-\u200D\u2060\uFEFF]/g, "").trim(); }
function _yzNote_(note, page) {
  // 沒填備註（空白、只有空行）：整個備註框不要（以前會留一個只有「備註」兩個字的空框）；前後多打的空行也不要
  var lines = _yzNoteHas_(note) ? _yzTextLines_(note, { size: "xs", color: "#5B4300", markColor: "#8A6D00", plain: true }) : [];
  var gap = function (n) { return n && n.type === "separator" && n.color === "#FFFFFF"; };
  while (lines.length && gap(lines[0])) lines.shift();
  while (lines.length && gap(lines[lines.length - 1])) lines.pop();
  var pg = _yzPageText_(page);
  if (!lines.length && !pg) return null;
  // 頁數：自己一個小框（青綠色，跟黃色的備註框不同色）
  var chip = pg ? {
    type: "box", layout: "vertical", backgroundColor: YZ_PG_BG, borderColor: YZ_PG_BD, borderWidth: "1px", cornerRadius: "8px", paddingAll: "6px",
    contents: [{ type: "text", size: "xs", wrap: true, contents: [
      { type: "span", text: "📖 藥戰手冊頁數　", color: YZ_PG_INK }, { type: "span", text: pg, weight: "bold", color: YZ_PG_STRONG }
    ] }]
  } : null;
  if (!lines.length) return chip;   // 第 28 批：只寫了頁數（備註沒有字）：只放頁數小框，不要黃色的「備註」框
  var c = [{ type: "text", text: "備註", size: "xxs", weight: "bold", color: "#8A6D00" }].concat(lines);
  if (chip) c.push({ type: "text", text: " ", size: "xs", wrap: true }, chip);   // 備註有字：頁數小框放在備註框裡面，文字和小框中間空一行
  return { type: "box", layout: "vertical", spacing: "xs", backgroundColor: "#FFF8E1", cornerRadius: "8px", paddingAll: "8px", contents: c };
}

function _yzFoot_() {
  if (!YZ_CFG.footer) return { type: "separator", color: "#FFFFFF" };   // 頁尾關掉：放一條白色、看不見的分隔線（LINE 已經不收 spacer）
  return { type: "text", text: YZ_NOTICE, size: "xxs", color: "#9AA0A6", align: "center", margin: "sm" };
}

function _yzHead_(top, title, sub) {
  var c = [{ type: "text", text: top, size: "xs", color: YZ_ACCENT_SOFT, wrap: true }];
  if (title) c.push({ type: "text", text: title, size: "lg", weight: "bold", color: "#FFFFFF", wrap: true, margin: "xs" });
  if (sub) c.push({ type: "text", text: sub, size: "xs", color: YZ_ACCENT_SOFT, wrap: true, margin: "xs" });
  return { type: "box", layout: "vertical", paddingAll: "12px", backgroundColor: YZ_ACCENT, contents: c };
}

function _yzPB_(data, label, display) { var a = { type: "postback", label: label, data: data }; if (display) a.displayText = display; return a; }

// ── 章的主題圖：目錄圖（圖一）上這一章的位置裁下來的（網頁編輯器按「儲存」時自動做好）；開發者自己放的「章元圖」優先 ──
function _yzChBg_(ch) { return (ch && (ch.img || (ch.bg && ch.bg.img))) || ""; }
function _yzChIcons_(hb) {   // { 章代號: 圖示 }：目錄圖上連到這一章的地點的圖示（同一章有好幾個，拿第一個）
  var o = {};
  ((hb && hb.cat && hb.cat.spots) || []).forEach(function (s) { var m = /^c:(.+)$/.exec(String(s && s.to || "")); if (m && s.ico && !o[m[1]]) o[m[1]] = String(s.ico); });
  return o;
}
// 卡片最上面：主題圖＋圖的下緣一條半透明深色字條（寫章名、標題）。沒有圖、或設定「圖片不直接顯示在 LINE」→ null（照舊用青綠色那條）
function _yzThemeHero_(ch, top, title, sub, ar, act) {
  var u = _yzChBg_(ch);
  if (!u || !YZ_CFG.imgDirect) return null;
  var txt = [];
  if (top) txt.push({ type: "text", text: top, size: "xxs", color: "#D8F1EE", wrap: true });
  if (title) txt.push({ type: "text", text: title, size: "lg", weight: "bold", color: "#FFFFFF", wrap: true, margin: "xs" });
  if (sub) txt.push({ type: "text", text: sub, size: "xxs", color: "#D8F1EE", wrap: true, margin: "xs" });
  var hero = { type: "box", layout: "vertical", paddingAll: "0px", contents: [
    { type: "image", url: u, size: "full", aspectRatio: ar || "20:9", aspectMode: "cover" },
    { type: "box", layout: "vertical", position: "absolute", offsetBottom: "0px", offsetStart: "0px", offsetEnd: "0px", paddingAll: "11px", backgroundColor: "#0B1F1DB8", contents: txt }
  ] };
  if (act) hero.action = act;
  return hero;
}

function _yzTopOf_(b, hero, head) {   // 卡片最上面：有主題圖放主題圖（hero），沒有就放青綠色那條（header）
  if (hero) b.hero = hero; else b.header = head();
  return b;
}

// ── 章元：一章一張（主題圖＋章名），一排左右滑。不寫「第幾章」 ──
function _yzChapterBubble_(ch, nTitles) {
  var open = _yzPB_("yz=c&c=" + ch.id, "打開");
  var body = [{ type: "text", text: (ch.ico ? ch.ico + " " : "") + ch.name, size: "md", weight: "bold", wrap: true, color: "#1F1F1F" }];
  var intro = _yzT_(ch.intro, { size: "xs", color: "#5F6B7A", margin: "sm", maxLines: 3 });
  if (intro) body.push(intro);
  body.push({ type: "text", text: nTitles ? nTitles + " 個標題" : "🔒 還在整理", size: "xxs", color: "#7B8696", margin: "sm" });
  var b = { type: "bubble", size: ch.size || "kilo" }, bg = _yzChBg_(ch);
  if (bg && YZ_CFG.imgDirect) b.hero = { type: "image", url: bg, size: "full", aspectRatio: "20:13", aspectMode: "cover", action: open };
  else b.hero = { type: "box", layout: "vertical", backgroundColor: YZ_ACCENT, paddingAll: "18px", action: open, contents: [{ type: "text", text: ch.ico || "📘", size: "3xl", align: "center", color: "#FFFFFF" }] };
  b.body = { type: "box", layout: "vertical", paddingAll: "12px", contents: body, action: open };
  b.footer = { type: "box", layout: "vertical", paddingAll: "10px", spacing: "xs", contents: [
    { type: "button", style: "primary", color: YZ_ACCENT, height: "sm", action: _yzPB_("yz=c&c=" + ch.id, "打開這一章") },
    _yzFoot_()
  ] };
  return b;
}
function _yzChapterList_(chapters, counts, icons) {
  var bs = chapters.slice(0, YZ_CAROUSEL_MAX).map(function (c) { return _yzChapterBubble_(icons && icons[c.id] ? Object.assign({}, c, { ico: icons[c.id] }) : c, counts[c.id] || 0); });
  return { type: "carousel", contents: bs };
}

// ── 目錄圖（「藥師調劑台」）第 3 版：像「圖二」那種實景圖。每個地方有一個白色小標籤（圖示＋名稱）和一顆圓點；點標籤或點物品，就進到那一章（或某一個標題）──
// 資料（cat）：{ on, title, hint, img, ar, w, h, size, labels, btns, fx, web, spots:[{ id, label, to, x, y, w, h, pos, ico, desc, st }] }
//   to ＝ "c:章代號"（整章）或 "t:標題代號"（某一個標題）；「🔒 尚未開放」的地方可以不填 to；
//   x、y、w、h ＝ 「物品」佔整張圖的幾 %（整數）；圓點在這個框的正中間；
//   pos ＝ 標籤在圓點的上(t)／下(b)／左(l)／右(r)（舊版的「中(m)」自動當成「上」）；
//   ico ＝ 標籤前面的圖示（一個表情符號）；desc ＝ 網頁上滑過去時，底下說明卡的那一句話（LINE 上沒有「滑過」，所以不放）；
//   st ＝ ""（一般）／"lock"（🔒 還沒開放：標籤變灰，點了只會說「還在整理」）／"new"（標籤上多一顆紅點）；
//   fx ＝ 網頁上的動態效果（滑過放大、說明卡、飄浮光點）開不開，預設開（只影響網頁，LINE 沒有）。
// LINE 上的做法：圖片區（hero）放「圖＋疊在圖上的方塊」。每個地方有兩個「絕對位置」的方塊（位置、大小用百分比，LINE 官方規格有支援）：
//   ① 透明的「物品框」（點物品用）；② 「標籤方塊」（白色小標籤＋圓點；範圍至少 44 px 高，手指好點）。兩個都有「點了要做什麼」（postback）。
//   實機畫出來是不是這個樣子，要用手機確認（待實機確認），所以另外做了「圖下面加按鈕」的備用開關。
var YZ_MAP_MAX = 12;         // 圖上最多幾個地點（再多就擠得點不到）
var YZ_MAP_MIN_PCT = 4;      // 一個地點的物品框最小幾 %
var YZ_MAP_RECT_WARN = 24;   // 物品框小於這個大小（px）就提醒（標籤本身還是點得到）
var YZ_MAP_PILL_PX = 11;     // 標籤字級（xxs ＝ 11 px）
var YZ_MAP_PILL_H = 23;      // 標籤高度（px，估計：字 11 px × 1.35 ＋ 上下各 3 px ＋ 框線上下各 1 px）
var YZ_MAP_INK_BORDER = "#1D5E5C";   // 標籤的框線顏色（照「圖二」：白底、深綠框）
var YZ_MAP_DOT = 12;         // 圓點直徑（px）
var YZ_MAP_GAP = 3;          // 標籤和圓點的間隔（px）
var YZ_MAP_TAP = 44;         // 標籤方塊至少這麼高（px）：手指好點的大小
var YZ_MAP_ICO = 14;         // 圖示寬（px，估計）
var YZ_MAP_PILL_MAX = 96;    // 標籤寬超過這個（px）就提醒（太寬會擠到旁邊的標籤）
var YZ_MAP_PILL_MAX_HALF = 124;   // 切成好幾張時（一張只放一部分的地點，比較不擠）的標準
var YZ_MAP_PILL_SEP = 6;     // 第 32 批：LINE 上兩個標籤至少隔幾 px；再近（或疊在一起）就自動換一個方向（網頁不變）
var YZ_MAP_WARN_BYTES = 20e3;   // 目錄卡片超過這個大小就提醒（上限抓 27 KB）
var YZ_MAP_LOCK_INK = "#6B7480", YZ_MAP_LOCK_DOT = "#8A94A0", YZ_MAP_NEW = "#E5484D";
var YZ_MAP_URL_SAMPLE = "https://drive.google.com/thumbnail?id=1AbCdEfGhIjKlMnOpQrStUvWxYz00000&sz=w1000";   // 算大小用：跟真的圖片網址一樣長

function _yzMapTo_(to) {   // "c:c2" → "yz=c&c=c2"；"t:t22" → "yz=t&t=t22"；第 32 批："q:all" → "yz=qz"（問卷清單）、"q:代號" → 那一份問卷；看不懂 → ""
  var m = /^([ctq]):([A-Za-z0-9_\-]+)$/.exec(String(to === null || to === undefined ? "" : to));
  if (m && m[1] === "q") return m[2] === "all" ? "yz=qz" : "yz=qs&q=" + m[2];
  return m ? "yz=" + m[1] + "&" + m[1] + "=" + m[2] : "";
}
function _yzMapToInfo_(to, hb) {   // 連到哪裡：{ ok, kind:"c"|"t"|"q", name:"藥品補充與藥品請領"（標題：「章名　標題」）, short:"藥品補充與藥品請領" }
  var m = /^([ctq]):(.+)$/.exec(String(to === null || to === undefined ? "" : to)), i;
  if (m && m[1] === "c") { var cs = (hb && hb.chapters) || []; for (i = 0; i < cs.length; i++) if (cs[i].id === m[2]) return { ok: true, kind: "c", name: cs[i].name, short: cs[i].name }; }
  if (m && m[1] === "t") { var f = hb ? _yzFindTitle_(hb, m[2]) : null; if (f) return { ok: true, kind: "t", name: f.ch.name + "　" + f.t.name, short: f.t.name }; }
  if (m && m[1] === "q" && /^[A-Za-z0-9_\-]+$/.test(m[2])) return { ok: true, kind: "q", name: m[2] === "all" ? "📋 問卷（清單）" : "📋 問卷", short: "問卷" };   // 第 32 批
  return { ok: false, kind: m ? m[1] : "", name: "（找不到）", short: "" };
}
function _yzMapNum_(v, lo, hi) { v = Math.round(Number(v)); if (!isFinite(v)) v = lo; return Math.max(lo, Math.min(hi, v)); }
function _yzMapSpotOk_(s) { return !!(s && (s.st === "lock" || _yzMapTo_(s.to)) && isFinite(Number(s.x)) && isFinite(Number(s.y)) && Number(s.w) >= 1 && Number(s.h) >= 1); }
function _yzMapRect_(s) {   // 一定落在 0～100 之內的整數百分比（LINE 規格：百分比寫成 "12%"）
  var x = _yzMapNum_(s.x, 0, 99), y = _yzMapNum_(s.y, 0, 99);
  return { x: x, y: y, w: _yzMapNum_(s.w, 1, 100 - x), h: _yzMapNum_(s.h, 1, 100 - y) };
}
function _yzMapPos_(p) { return p === "t" || p === "b" || p === "l" || p === "r" ? p : "t"; }   // 舊版的「中」（m）和看不懂的，都當成「上」
function _yzMapSt_(v) { return v === "lock" || v === "new" ? v : ""; }
function _yzMapStr_(v) { return String(v === null || v === undefined ? "" : v).replace(/\s+/g, " ").trim(); }
// 第 26 批：網頁滑到時「亮起來的形狀」＝編輯器自動找的物品輪廓（[[x,y,…],…]，整張圖的 %）。選「整個框」、還沒算、框動過了：沒有（＝亮整個框）
function _yzMapShape_(s, r) {
  var sh = s && s.shape;
  if (!sh || s.lit === "box" || !Array.isArray(sh.r) || !sh.r.length || sh.b !== [r.x, r.y, r.w, r.h].join(",")) return null;
  var out = sh.r.filter(function (ring) { return Array.isArray(ring) && ring.length >= 6 && ring.every(function (v) { return typeof v === "number" && isFinite(v); }); });
  return out.length ? out : null;
}
function _yzMapNorm_(s) {   // 把一個地點整理乾淨（不管能不能用）
  var r = _yzMapRect_(s);
  var o = { id: s.id, label: _yzMapStr_(s.label), to: s.to, x: r.x, y: r.y, w: r.w, h: r.h, pos: _yzMapPos_(s.pos), ico: _yzMapStr_(s.ico).replace(/\s/g, ""), desc: _yzMapStr_(s.desc), st: _yzMapSt_(s.st) };
  if (s.empty === true) o.empty = true;
  var sh = _yzMapShape_(s, r);
  if (sh) o.shape = sh;
  return o;
}
// 空的章自動上鎖：連到「還沒有任何標題的章」的地點，藥師看到的是「🔒 尚未開放」（點了說還在整理）；寫好第一個標題就自動打開。
// 開發者（dev）不鎖，只多一個 empty（網頁上標籤框線變虛線，提醒這一章還是空的）。回傳一份新的 cat（原本的不動）。
function _yzMapEmptyCh_(hb) {
  var o = {};
  ((hb && hb.chapters) || []).forEach(function (c) { if (!(((hb.titles || {})[c.id]) || []).length) o[c.id] = 1; });
  return o;
}
function _yzMapLive_(cat, hb, dev) {
  if (!cat || !hb) return cat;
  var emp = _yzMapEmptyCh_(hb);
  return Object.assign({}, cat, { spots: ((cat && cat.spots) || []).map(function (s) {
    var m = /^c:(.+)$/.exec(String(s && s.to || ""));
    if (!m || !emp[m[1]] || (s && s.st === "lock")) return s;
    return Object.assign({}, s, dev ? { empty: true } : { st: "lock" });
  }) });
}
function _yzMapSpots_(cat) {   // 能用的地點（連結看得懂或是「尚未開放」、位置大小是數字），整理成乾淨的一份
  var out = [];
  ((cat && cat.spots) || []).forEach(function (s) { if (_yzMapSpotOk_(s)) out.push(_yzMapNorm_(s)); });
  return out;
}
function _yzMapOrder_(spots) {   // 閱讀順序：由上到下，同一排由左到右（備用按鈕用）
  return spots.slice().sort(function (a, b) { var ra = Math.floor((a.y + a.h / 2) / 25), rb = Math.floor((b.y + b.h / 2) / 25); return ra - rb || a.x - b.x; });
}
function _yzMapDims_(cat) {   // 這張目錄卡片在手機上的大小：{ sz, px（寬）, ih（圖高）}
  var sz = (cat && cat.size) || "giga", px = YZ_BUBBLE_PX[sz] || 340, ar = String((cat && cat.ar) || "20:13").split(":"), aw = Number(ar[0]) || 20, ah = Number(ar[1]) || 13;
  return { sz: sz, px: px, ih: px * ah / aw };
}
function _yzMapIcoOf_(s) { return s.st === "lock" ? "🔒" : s.ico; }
function _yzMapPillW_(s) {   // 標籤的寬（px，估計）：字 ＋ 圖示 ＋ 紅點 ＋ 前後留白
  if (!s.label) return 0;
  return Math.ceil(_yzTxtW_(s.label, YZ_MAP_PILL_PX) * 1.04 + (_yzMapIcoOf_(s) ? YZ_MAP_ICO + 3 : 0) + (s.st === "new" ? 11 : 0) + 17);
}
// 一個地點在手機卡片上的位置（px，圖的左上角算 0,0）：圓點中心、標籤、圓點。給畫卡片和檢查共用，所以檢查講的就是實際畫出來的樣子。
function _yzMapGeom_(s, cat) {
  var d = _yzMapDims_(cat), D = YZ_MAP_DOT, G = YZ_MAP_GAP, PH = YZ_MAP_PILL_H;
  var ax = (s.x + s.w / 2) / 100 * d.px, ay = (s.y + s.h / 2) / 100 * d.ih, pos = _yzMapPos_(s.pos);
  var show = !cat || cat.labels !== false, pw = show ? _yzMapPillW_(s) : 0, pill = null, x0, y0;
  if (pw) {
    x0 = pos === "l" ? ax - D / 2 - G - pw : pos === "r" ? ax + D / 2 + G : ax - pw / 2;
    y0 = pos === "t" ? ay - D / 2 - G - PH : pos === "b" ? ay + D / 2 + G : ay - PH / 2;
    pill = { x0: x0, y0: y0, x1: x0 + pw, y1: y0 + PH };
  }
  return { px: d.px, ih: d.ih, ax: ax, ay: ay, pos: pos, show: show, pw: pw, pill: pill, dot: { x0: ax - D / 2, y0: ay - D / 2, x1: ax + D / 2, y1: ay + D / 2 } };
}
// 第 32 批：LINE 上標籤太擠（疊在一起、或隔不到 YZ_MAP_PILL_SEP px，例如「錠劑」和「疑義處方」）→ 照順序一個一個放，
//   太擠的那一個換到不擠、也不會超出圖的方向（下、上、右、左）；怎麼換都擠就照原本的。換過的多一個 auto（原本的方向），只影響 LINE 卡片（網頁照原本的方向）。
function _yzMapNear_(a, b, sep) { return a.x0 < b.x1 + sep && b.x0 < a.x1 + sep && a.y0 < b.y1 + sep && b.y0 < a.y1 + sep; }
function _yzMapIn_(p, d) {   // 超出圖的標籤，LINE 上會整個推回圖裡面（_yzMapTag_）：照推回來的位置算
  var dx = p.x0 < 0 ? -p.x0 : p.x1 > d.px ? d.px - p.x1 : 0, dy = p.y0 < 0 ? -p.y0 : p.y1 > d.ih ? d.ih - p.y1 : 0;
  return { x0: p.x0 + dx, x1: p.x1 + dx, y0: p.y0 + dy, y1: p.y1 + dy };
}
function _yzMapAuto_(spots, cat) {
  if (!cat || cat.labels === false) return spots;
  var d = _yzMapDims_(cat), placed = [], dots = spots.map(function (s) { return _yzMapGeom_(s, cat).dot; });
  return spots.map(function (s, i) {
    var own = _yzMapPos_(s.pos), g0 = _yzMapGeom_(s, cat), p0 = g0.pill ? _yzMapIn_(g0.pill, d) : null;
    var clash = function (p) { return placed.some(function (q) { return _yzMapNear_(p, q, YZ_MAP_PILL_SEP); }) || dots.some(function (dd, j) { return j !== i && _yzMapBox_(p, dd) > 0; }); };
    if (!p0 || !clash(p0)) { if (p0) placed.push(p0); return s; }
    var tries = ["b", "t", "r", "l"].filter(function (p) { return p !== own; });
    for (var k = 0; k < tries.length; k++) {
      var t2 = Object.assign({}, s, { pos: tries[k], auto: own }), p2 = _yzMapGeom_(t2, cat).pill;
      if (p2.x0 >= 0 && p2.y0 >= 0 && p2.x1 <= d.px && p2.y1 <= d.ih && !clash(p2)) { placed.push(p2); return t2; }
    }
    placed.push(p0);
    return s;
  });
}
function _yzMapAct_(s, hb) {   // 點了要做什麼：一般＝進到那一章；「尚未開放」＝只回一句「還在整理」
  var info = _yzMapToInfo_(s.to, hb), name = (s.label || (info.ok ? info.short : "") || "打開").slice(0, 20);
  if (s.st === "lock") return _yzPB_("yz=lock&p=" + (String(s.id).replace(/[^A-Za-z0-9_\-]/g, "") || "x"), name);
  return _yzPB_(_yzMapTo_(s.to), name);
}
// ① 物品框：透明的，蓋在物品上，點物品用
function _yzMapHit_(s, hb) {
  return { type: "box", layout: "vertical", position: "absolute", offsetStart: s.x + "%", offsetTop: s.y + "%", width: s.w + "%", height: s.h + "%", action: _yzMapAct_(s, hb), contents: [{ type: "filler" }] };
}
// ② 標籤方塊：白色小標籤（圖示＋名稱）＋圓點。標籤在圓點的上／下／左／右；方塊本身至少 44 px 高，加上「點了要做什麼」。
function _yzMapTag_(s, cat, hb) {
  var g = _yzMapGeom_(s, cat), D = YZ_MAP_DOT, G = YZ_MAP_GAP, PH = YZ_MAP_PILL_H, P = 4, SL = 10, lock = s.st === "lock";
  var ink = lock ? YZ_MAP_LOCK_INK : YZ_ACCENT, dotCol = lock ? YZ_MAP_LOCK_DOT : YZ_ACCENT, ico = _yzMapIcoOf_(s);
  var dot = { type: "box", layout: "vertical", flex: 0, width: D + "px", height: D + "px", cornerRadius: (D / 2) + "px", borderWidth: "2px", borderColor: "#FFFFFF", backgroundColor: dotCol, contents: [{ type: "filler" }] };   // 方塊一定要有內容，所以放一個 filler
  var kids = [];
  if (g.pw) {
    if (ico) kids.push({ type: "text", text: ico, size: "xxs", flex: 0, gravity: "center" });
    kids.push({ type: "text", text: s.label, size: "xxs", weight: "bold", color: lock ? ink : "#13312F", flex: 0, gravity: "center" });
    if (s.st === "new") kids.push({ type: "text", text: "●", size: "xxs", color: YZ_MAP_NEW, flex: 0, gravity: "center" });
  }
  var pill = g.pw ? { type: "box", layout: "horizontal", flex: 0, spacing: "xs", backgroundColor: lock ? "#EEF0F3F2" : "#FFFFFFF2", borderWidth: "1px", borderColor: lock ? "#9AA3AE" : YZ_MAP_INK_BORDER, cornerRadius: "8px", paddingTop: "3px", paddingBottom: "3px", paddingStart: "7px", paddingEnd: "8px", contents: kids } : null;
  function center(n, margin) { var b = { type: "box", layout: "horizontal", contents: [{ type: "filler" }, n, { type: "filler" }] }; if (margin) b.margin = margin + "px"; return b; }
  var b = { type: "box", position: "absolute", action: _yzMapAct_(s, hb) }, wpx, left, top;
  if (g.pos === "t" || g.pos === "b") {
    // 方塊左右對稱地包住標籤和圓點，圓點才會剛好在物品框中間；靠近圖的邊緣時，先縮小多留的空間，真的放不下才整個推回圖裡面
    var half = Math.max(Math.max(g.pw, D) / 2 + P + SL / 2, 28), room = Math.min(g.ax, g.px - g.ax), need = Math.max(g.pw, D) / 2 + 1;
    if (half > room) half = Math.max(need, room);
    wpx = half * 2; left = g.ax - half; top = (g.pos === "t" ? (g.pill ? g.pill.y0 : g.dot.y0) : g.dot.y0) - P;
    b.layout = "vertical"; b.paddingTop = P + "px"; b.paddingBottom = P + "px";
    b.contents = !pill ? [center(dot)] : g.pos === "t" ? [center(pill), center(dot, G)] : [center(dot), center(pill, G)];
  } else {
    var pv = Math.round((YZ_MAP_TAP - PH) / 2), min = (g.pw ? g.pw + G : 0) + D + P + 1;
    wpx = min + P + SL - 1; top = g.ay - PH / 2 - pv;
    if (g.pos === "l") { var right = g.ax + D / 2 + P; if (right - wpx < 0) wpx = Math.max(min, right); left = right - wpx; }
    else { left = g.ax - D / 2 - P; if (left + wpx > g.px) wpx = Math.max(min, g.px - left); }
    b.layout = "horizontal"; b.paddingTop = pv + "px"; b.paddingBottom = pv + "px"; b.alignItems = "center";   // 上下置中：box 要用 alignItems（box 沒有 gravity，放了 LINE 會整則退回＝沒反應）
    if (!pill) b.contents = [{ type: "filler" }, dot, { type: "filler" }];
    else if (g.pos === "l") { pill.margin = "none"; dot.margin = G + "px"; b.contents = [{ type: "filler" }, pill, dot]; b.paddingEnd = P + "px"; }
    else { pill.margin = G + "px"; b.contents = [dot, pill, { type: "filler" }]; b.paddingStart = P + "px"; }
  }
  // 圖的邊緣：整個方塊不能超出圖（超出的部分 LINE 不顯示）。真的超出了，就把方塊整個推回圖裡面（圓點會跟著偏一點，檢查會提醒）。
  // 百分比要四捨五入成整數，所以先算寬，再算位置，保證「位置＋寬」不會超過 100%。
  var hpx = g.pos === "t" || g.pos === "b" ? 2 * P + D + (g.pw ? PH + G : 0) : PH + 2 * Math.round((YZ_MAP_TAP - PH) / 2);
  var wp = Math.min(100, Math.max(1, Math.round(wpx / g.px * 100))), lp = Math.round(left / g.px * 100), hp = Math.min(100, Math.ceil(hpx / g.ih * 100)), tp = Math.round(top / g.ih * 100);
  if (lp + wp > 100) lp = 100 - wp; if (lp < 0) lp = 0;
  if (tp + hp > 100) tp = 100 - hp; if (tp < 0) tp = 0;
  b.offsetStart = lp + "%"; b.offsetTop = tp + "%"; b.width = wp + "%";
  return b;
}
// 備用：每個地點一個按鈕，兩個一排（LINE 圖上的方塊萬一不能點，還有這個）
function _yzMapButtons_(spots, hb) {
  var list = _yzMapOrder_(spots), rows = [];
  for (var i = 0; i < list.length; i += 2) {
    var pair = [list[i], list[i + 1]].filter(Boolean).map(function (s) {
      var a = _yzMapAct_(s, hb); if (s.st === "lock") a = _yzPB_(a.data, ("🔒 " + (a.label || "")).slice(0, 20));
      return { type: "button", style: "secondary", height: "sm", flex: 1, action: a };
    });
    if (pair.length === 1) pair.push({ type: "filler" });
    rows.push({ type: "box", layout: "horizontal", spacing: "sm", contents: pair });
  }
  return rows;
}
// 目錄圖的卡片。「圖片直接顯示」關掉時，圖不放，改成「每個地點一個按鈕」（保密設定一樣管得到這張圖）。
function _yzMapBubble_(cat, hb, o) {
  cat = cat || {}; o = o || {};
  var n = o.parts === 3 ? 3 : 2, part = typeof o.part === "number" && o.part >= 0 && o.part < n ? o.part : -1;   // 第 35 批：可以切成三張
  var spots = _yzMapSpots_(cat).slice(0, YZ_MAP_MAX), direct = YZ_CFG.imgDirect !== false && !!cat.img, foot = [];
  var b = { type: "bubble", size: cat.size || "giga" };
  if (part < 0) b.header = _yzHead_("📘 藥戰手冊　目錄", cat.title || "目錄", cat.hint || "");
  else b.header = _yzHead_("📘 藥戰手冊　目錄", (cat.title || "目錄") + "｜" + _yzMapSide_(part, n) + "　" + _yzMapDots_(part, n), _yzMapSwipe_(part, n));   // 第 38 批：「目錄｜左邊　■□□」
  if (direct) {
    var cs = [{ type: "image", url: cat.img, size: "full", aspectMode: "cover", aspectRatio: cat.ar || _yzAR_(cat.w || 1000, cat.h || 650) }];
    spots.forEach(function (s) { cs.push(_yzMapHit_(s, hb)); });                                              // 先放物品框（在下面）
    if (cat.labels !== false) _yzMapAuto_(spots, cat).forEach(function (s) { cs.push(_yzMapTag_(s, cat, hb)); });   // 再放標籤（在上面）；第 32 批：太擠的自動換方向
    b.hero = { type: "box", layout: "vertical", paddingAll: "0px", contents: cs };
    if (cat.btns) foot = foot.concat(_yzMapButtons_(spots, hb));
  } else {
    b.body = { type: "box", layout: "vertical", paddingAll: "13px", contents: [{ type: "text", text: "🖼 為了保密，目錄圖不直接顯示。請按下面的按鈕選地方。", size: "xs", color: "#5F6B7A", wrap: true }] };
    foot = foot.concat(_yzMapButtons_(spots, hb));
  }
  foot.push({ type: "button", style: "link", height: "sm", color: YZ_ACCENT, action: _yzPB_("yz=chs", "📚 全部章元（文字）") });
  foot.push(_yzFoot_());
  b.footer = { type: "box", layout: "vertical", spacing: "sm", paddingAll: "10px", contents: foot };
  return b;
}
// ── 很寬的目錄圖（像「圖一」那種環景）：LINE 一張卡片太矮、標籤會擠在一起，所以切成「左右兩張」（第 35 批：很寬的切成「左、中、右」三張），左右滑著看 ──
// cat.parts ＝ [{ img, fname, x0, x1, w, h }, { … }]：切好的兩張圖（網頁編輯器換圖時自動切、自動上傳，檔名一樣是亂碼）；
//   x0、x1 ＝ 這一張是原圖的「幾 % 到幾 %」。cat.split ＝ 要不要切（沒填＝要；圖不寬、或還沒切好，就照舊一張）。
// 地點照「圓點在哪一張」分（以前重疊的那一段從中間分開；第 38 批不重疊＝切線），位置換算成那一張的 %（物品框跨過切線的，超出的部分 LINE 不顯示，標籤和圓點還是在）。
// 第 35 批：寬是高的 2.6 倍以上（像新的圖一，快 3 倍）切成三張，一張的東西放大約 1.5 倍、標籤不擠。以前切好兩張的，開發者打開「✏️ 編輯」時自動重切、自動存檔。
// 第 38 批：切開的地方不重疊（以前重疊的，一樣打開「✏️ 編輯」時自動重切）；卡片標題寫「目錄｜左邊　■□□」（哪一段、在第幾段）。
//   切三張的放在 cat.parts3（cat.parts 放空的）：退回第 34 批的程式時，舊程式看不到三張、也沒有兩張 → LINE 照舊一整張（不會切錯）。用 _yzMapParts_ 拿現在用的那幾張。
var YZ_MAP_WIDE = 1.8;                     // 寬是高的幾倍以上，算「很寬」（切成左右兩張）
var YZ_MAP_WIDE3 = 2.6;                    // 第 35 批：寬是高的幾倍以上，切成三張（左、中、右）
// 第 38 批：切開的地方不再重疊（以前重疊 4 %：同一個人、同一樣東西兩張都有，看起來怪）。相鄰兩張剛好接上。
var YZ_MAP_CUTS = [[0, 50], [50, 100]];    // 左右兩張各佔原圖的幾 %
var YZ_MAP_CUTS3 = [[0, 33.33], [33.33, 66.67], [66.67, 100]];   // 第 35 批：三張（左、中、右）各佔原圖的幾 %；第 38 批：三張一樣寬（卡片一樣高），所以用到小數點兩位
function _yzMapCutsFor_(ratio) { return ratio >= YZ_MAP_WIDE3 ? YZ_MAP_CUTS3 : ratio >= YZ_MAP_WIDE ? YZ_MAP_CUTS : []; }   // 第 35 批：這麼寬的圖要怎麼切（不用切＝[]）
function _yzMapPartName_(i, n) { return n === 3 ? ["左邊那張", "中間那張", "右邊那張"][i] || "" : i ? "右半張" : "左半張"; }
function _yzMapSwipe_(i, n) {   // 切成好幾張時，卡片標題下面那一行：往哪邊滑還有
  if (n === 3) return i === 0 ? "👉 往左滑，看中間、右邊" : i === 1 ? "👈 👉 左右滑，看左邊、右邊" : "👈 往右滑，看中間、左邊";
  return i === 0 ? "👉 往左滑，看右半邊" : "👈 往右滑，看左半邊";
}
function _yzMapSide_(i, n) { return n === 3 ? ["左邊", "中間", "右邊"][i] || "" : i ? "右半邊" : "左半邊"; }   // 第 38 批：卡片標題寫「這是哪一段」
function _yzMapDots_(i, n) { var s = ""; for (var k = 0; k < n; k++) s += k === i ? "■" : "□"; return s; }   // 第 38 批：■□□＝現在在哪一段
function _yzMapRatio_(cat) {
  var a = String((cat && cat.ar) || "").split(":"), w = Number(a[0]), hh = Number(a[1]);
  if (w > 0 && hh > 0) return w / hh;
  return cat && cat.w > 0 && cat.h > 0 ? cat.w / cat.h : 0;
}
function _yzMapWide_(cat) { return _yzMapRatio_(cat) >= YZ_MAP_WIDE; }
// 第 35 批：LINE 現在用的那幾張：切三張的（parts3）優先，再來切兩張的（parts）；每一張都要有圖、相鄰的要接上（第 38 批：重疊或剛好接上），不然＝[]（不切，照舊一整張）
function _yzMapParts_(cat) {
  if (!cat || cat.split === false) return [];
  var good = function (p, n) {
    if (!Array.isArray(p) || p.length !== n) return false;
    for (var i = 0; i < n; i++) if (!p[i] || !p[i].img || (i && !(Number(p[i].x0) <= Number(p[i - 1].x1)))) return false;   // 第 38 批：剛好接上也可以（不用重疊）
    return true;
  };
  return good(cat.parts3, 3) ? cat.parts3 : good(cat.parts, 2) ? cat.parts : [];
}
function _yzMapWithParts_(cat, list) {   // 第 35 批：換上切好的那幾張（三張放 parts3、兩張放 parts，另一個清空）→ 新的一份（不改原本的）
  var a = Array.isArray(list) ? list : [];
  return Object.assign({}, cat, a.length === 3 ? { parts: [], parts3: a } : { parts: a, parts3: [] });
}
function _yzMapSplitOn_(cat) { return _yzMapParts_(cat).length > 0; }   // 切好了（兩張或三張）
// 第 35 批：切好的張數、位置跟現在的規則不一樣（例：以前切成兩張的很寬的圖，現在要切三張）→ 編輯器要重新切
function _yzMapNeedCut_(cat) {
  if (!cat || !cat.img || cat.split === false) return false;
  var want = _yzMapCutsFor_(_yzMapRatio_(cat)), p = _yzMapParts_(cat);
  if (!want.length) return false;
  if (p.length !== want.length) return true;
  for (var i = 0; i < want.length; i++) if (Number(p[i].x0) !== want[i][0] || Number(p[i].x1) !== want[i][1]) return true;
  return false;
}
// 第 38 批：要重切的原因（給開發者看的白話）：張數不一樣＝要改成切幾張；張數一樣、位置不一樣＝以前切開的地方有重疊
function _yzMapCutWhy_(cat) {
  var want = _yzMapCutsFor_(_yzMapRatio_(cat)).length;
  return _yzMapParts_(cat).length === want ? "LINE 上切開的地方要改成不重疊（同一段圖不會兩張都有）" : "LINE 上要改成切 " + want + " 張（標籤比較不擠）";
}
function _yzMapPartCat_(cat, i) {   // 第 i 張（左邊數來，0 起）：圖換成切好的那一張，地點換算成那一張的 %
  var P = _yzMapParts_(cat), pt = P[i], span = Math.max(1, pt.x1 - pt.x0);
  var lo = i > 0 ? (P[i - 1].x1 + pt.x0) / 2 : -Infinity, hi = i < P.length - 1 ? (pt.x1 + P[i + 1].x0) / 2 : Infinity;   // 重疊的那一段從中間分開
  var spots = (cat.spots || []).filter(function (s) { return s && isFinite(Number(s.x)) && isFinite(Number(s.w)); }).filter(function (s) {
    var cx = Number(s.x) + Number(s.w) / 2; return cx >= lo && cx < hi;
  }).map(function (s) {
    var x0 = (Number(s.x) - pt.x0) / span * 100, x1 = (Number(s.x) + Number(s.w) - pt.x0) / span * 100, cx = (x0 + x1) / 2, hw = (x1 - x0) / 2;
    hw = Math.min(hw, cx, 100 - cx);   // 跨過切線的物品框：以圓點為中心縮小，圓點位置不變
    var wi = Math.max(1, Math.round(hw * 2)), xi = Math.max(0, Math.min(100 - wi, Math.round(cx - wi / 2)));   // 換成整數 %（圓點最多偏 0.5 %）
    return Object.assign({}, s, { x: xi, w: wi });
  });
  return Object.assign({}, cat, { img: pt.img, fname: pt.fname, ar: _yzAR_(pt.w || 1, pt.h || 1), w: pt.w, h: pt.h, spots: spots, parts: null, parts3: null, split: false });
}
function _yzMapHome_(cat, hb) {   // 「🏠 首頁」（以前叫「📚 目錄」）回的那一則：切好了＝兩張（或三張）一排（左右滑）；不然照舊一張
  var P = _yzMapParts_(cat), n = P.length;
  if (!n || YZ_CFG.imgDirect === false) return _yzMapBubble_(cat, hb);
  return { type: "carousel", contents: P.map(function (pt, i) { return _yzMapBubble_(_yzMapPartCat_(cat, i), hb, { part: i, parts: n }); }) };
}
// 點了「🔒 尚未開放」的地方，機器人回的那一張小卡
function _yzMapLockedBubble_(cat, pid) {
  var s = null; ((cat && cat.spots) || []).forEach(function (x) { if (x && String(x.id).replace(/[^A-Za-z0-9_\-]/g, "") === pid) s = x; });
  var nm = s ? _yzMapStr_(s.label) : "";
  return _yzNoticeBubble_("🔒 這一章還沒開放", [(nm ? "「" + nm + "」" : "這一章") + "還在整理中。", "開放以後，這裡的標籤會變回彩色。", "先看看其他章：按「🏠 首頁」。"], "warn");
}
// 哪些章在圖上點得到（有地點直接連到那一章，或連到那一章底下的某個標題）
function _yzMapCovered_(cat, hb) {
  var hit = {}, spots = _yzMapSpots_(cat);
  spots.forEach(function (s) {
    var m = /^([ct]):(.+)$/.exec(s.to || ""); if (!m) return;
    if (m[1] === "c") hit[m[2]] = 1; else { var f = _yzFindTitle_(hb, m[2]); if (f) hit[f.ch.id] = 1; }
  });
  var cov = [], un = [];
  ((hb && hb.chapters) || []).forEach(function (c) { (hit[c.id] ? cov : un).push(c); });
  return { covered: cov, uncovered: un };
}
function _yzMapCps_(s) { var n = 0; for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); if (c >= 0xDC00 && c <= 0xDFFF) continue; n++; } return n; }
function _yzMapBox_(a, b) { var w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0); return w > 0 && h > 0 ? w * h : 0; }
// 檢查（給編輯器、測試用）：每個地點的問題＋整張圖的問題。lv：bad（一定要改）／warn（建議改）
// 圖切成好幾張的時候：「位置、大小」的問題（標籤擠不擠、會不會超出邊）照 LINE 上實際那一張（左／右半張；第 35 批：或左／中／右那張）檢查。
function _yzMapCheck_(cat, hb) {
  cat = cat || {};
  if (!_yzMapSplitOn_(cat)) {
    var one = _yzMapCheck1_(cat, hb, { basic: true, geom: true });
    if (cat.img && _yzMapWide_(cat)) { one.general.push({ lv: "warn", msg: "圖很寬（寬是高的 " + (Math.round(_yzMapRatio_(cat) * 10) / 10) + " 倍）：LINE 一張卡片會很矮、標籤擠在一起。建議打開「LINE：很寬的圖切成好幾張」。" }); one.warn++; }
    return one;
  }
  var out = _yzMapCheck1_(cat, hb, { basic: true, geom: false });
  out.parts = [];
  var PP = _yzMapParts_(cat), np = PP.length;
  PP.forEach(function (pt, i) {
    var r = _yzMapCheck1_(_yzMapPartCat_(cat, i), hb, { basic: false, geom: true, pmax: YZ_MAP_PILL_MAX_HALF, tag: "（LINE " + _yzMapPartName_(i, np) + "）" });
    Object.keys(r.spots).forEach(function (id) { out.spots[id] = (out.spots[id] || []).concat(r.spots[id]); });
    out.bad += r.bad; out.warn += r.warn; out.parts.push({ px: r.px, ih: r.ih, n: r.n });
  });
  if (cat.img) {
    var car = _yzMapHome_(_yzMapWithParts_(Object.assign({}, cat, { img: YZ_MAP_URL_SAMPLE }), PP.map(function (pt) { return Object.assign({}, pt, { img: YZ_MAP_URL_SAMPLE }); })), hb || {});
    out.bytes = _yzBytes_(car);
    if (out.bytes > YZ_MSG_SAFE) { out.general.push({ lv: "bad", msg: (np === 3 ? "左中右三張" : "左右兩張") + "的目錄卡片一共約 " + Math.round(out.bytes / 100) / 10 + " KB，超過 LINE 一則訊息的上限（我們抓 " + Math.round(YZ_MSG_SAFE / 1000) + " KB）：減少地點，或關掉「圖下面加按鈕」。" }); out.bad++; }
  }
  return out;
}
// 檢查一張卡片。o.basic：連結、名稱長度、說明、整張圖的問題；o.geom：位置、大小（標籤擠不擠、會不會超出邊、卡片多大）；o.tag：訊息前面加的字
function _yzMapCheck1_(cat, hb, o) {
  cat = cat || {}; o = o || { basic: true, geom: true };
  var d = _yzMapDims_(cat), px = d.px, ih = d.ih, sz = d.sz, tag = o.tag || "";
  var out = { px: px, ih: ih, general: [], spots: {}, bad: 0, warn: 0, info: 0, uncovered: [], bytes: 0, n: 0 };
  function G(lv, msg) { if (!o.basic) return; out.general.push({ lv: lv, msg: msg }); out[lv]++; }
  function S(id, lv, msg) { (out.spots[id] = out.spots[id] || []).push({ lv: lv, msg: tag + msg }); out[lv]++; }
  function SB(id, lv, msg) { if (o.basic) S(id, lv, msg); }
  function SG(id, lv, msg) { if (o.geom) S(id, lv, msg); }
  if (!cat.img) G("bad", "還沒有目錄圖：沒有圖的時候，LINE 和網頁的目錄會改回「章元卡片」。");
  var all = ((cat.spots || []).filter(function (s) { return s; }));
  out.n = all.length;
  if (!all.length) G("warn", "圖上還沒有任何地點。按「＋新增地點」，或在圖上快點兩下。");
  if (all.length > YZ_MAP_MAX) G("warn", "地點有 " + all.length + " 個，超過 " + YZ_MAP_MAX + " 個：多出來的不會放到 LINE 卡片上。");
  var items = [], labelsOn = cat.labels !== false;
  var lay = {};   // 第 32 批：LINE 上太擠自動換方向 → 檢查照換過的算（不會再說「疊在一起」）；換了的多一句說明
  if (o.geom) _yzMapAuto_(all.slice(0, YZ_MAP_MAX).map(_yzMapNorm_), cat).forEach(function (s) { if (s.auto) lay[s.id] = s; });
  all.slice(0, YZ_MAP_MAX).forEach(function (s0) {
    var id = s0.id, n = _yzMapNorm_(s0), info = _yzMapToInfo_(s0.to, hb), wpx = n.w / 100 * px, hpx = n.h / 100 * ih, nm = n.label || info.short || "（沒有名稱）";
    if (lay[n.id]) { n = Object.assign({}, n, { pos: lay[n.id].pos }); S(id, "info", "LINE 上跟旁邊的標籤太近：標籤自動放到" + ({ t: "上面", b: "下面", l: "左邊", r: "右邊" })[n.pos] + "（網頁照原本的方向）。"); }
    var g = _yzMapGeom_(n, cat);
    if (!info.ok && n.st !== "lock") SB(id, "bad", "連到的章或標題找不到（可能被刪掉了），請重新選一個。");
    if (Number(s0.x) < 0 || Number(s0.y) < 0 || Number(s0.x) + Number(s0.w) > 100 || Number(s0.y) + Number(s0.h) > 100) SB(id, "warn", "物品框超出圖片邊界：超出的部分 LINE 不會顯示。");
    var mn = Math.min(wpx, hpx);
    if (mn < YZ_MAP_RECT_WARN) SG(id, "warn", "物品框偏小：在「" + sz + "」卡片上只有約 " + Math.round(wpx) + "×" + Math.round(hpx) + " px，點物品不太容易（標籤本身還是點得到）。建議框大一點。");
    if (labelsOn) {
      if (!n.label) SB(id, "warn", "沒有名稱：圖上只會有一顆圓點，沒有標籤。");
      else {
        if (g.pw > (o.pmax || YZ_MAP_PILL_MAX)) SG(id, "warn", "標籤「" + n.label + "」約 " + g.pw + " px 寬，太長：在手機上會擠到旁邊的標籤。字數少一點（4 個字最剛好），或不放圖示。");
        var p = g.pill;
        if (p.x0 < -1 || p.x1 > px + 1 || p.y0 < -1 || p.y1 > ih + 1) SG(id, "warn", "標籤超出圖片邊界（" + (p.x0 < -1 ? "左" : p.x1 > px + 1 ? "右" : p.y0 < -1 ? "上" : "下") + "邊）：超出的部分 LINE 不會顯示，圓點也會偏一點。換一個標籤方向，或把物品框往圖裡面移。");
      }
    }
    if (n.label.length > 20) SB(id, "warn", "名稱超過 20 個字：LINE 的按鈕上最多放 20 個字。");
    if (n.desc.length > 30) SB(id, "warn", "說明超過 30 個字：網頁底下的說明卡一行放不下，會被切掉。");
    if (n.ico && _yzMapCps_(n.ico) > 4) SB(id, "warn", "圖示請只放一個符號（一個表情符號）。");
    items.push({ id: id, name: nm, n: n, g: g, r: { x0: n.x / 100 * px, y0: n.y / 100 * ih, x1: (n.x + n.w) / 100 * px, y1: (n.y + n.h) / 100 * ih } });
  });
  for (var i = 0; i < items.length && o.geom; i++) for (var j = i + 1; j < items.length; j++) {
    var a = items[i], b = items[j];
    var ov = _yzMapBox_(a.r, b.r);
    if (ov && ov / Math.min((a.r.x1 - a.r.x0) * (a.r.y1 - a.r.y0), (b.r.x1 - b.r.x0) * (b.r.y1 - b.r.y0)) > 0.25) {
      S(a.id, "warn", "物品框和「" + b.name + "」疊在一起（疊到的地方，點到的是排在後面的那一個）。"); S(b.id, "warn", "物品框和「" + a.name + "」疊在一起（疊到的地方，點到的是排在後面的那一個）。");
    }
    if (labelsOn && a.g.pill && b.g.pill && _yzMapBox_(a.g.pill, b.g.pill) > 0) { S(a.id, "warn", "標籤和「" + b.name + "」的標籤疊在一起。換一個標籤方向（上／下／左／右），或把其中一個物品框移開。"); S(b.id, "warn", "標籤和「" + a.name + "」的標籤疊在一起。換一個標籤方向（上／下／左／右），或把其中一個物品框移開。"); }
  }
  if (labelsOn && o.geom) for (var k = 0; k < items.length; k++) for (var m = 0; m < items.length; m++) {
    if (k !== m && items[k].g.pill && _yzMapBox_(items[k].g.pill, items[m].g.dot) > 0) S(items[k].id, "warn", "標籤蓋住了「" + items[m].name + "」的圓點。換一個標籤方向。");
  }
  if (!o.basic) return out;
  var cv = _yzMapCovered_(cat, hb || {});
  out.uncovered = cv.uncovered;
  if (cv.uncovered.length && all.length) G("warn", "有 " + cv.uncovered.length + " 章在圖上沒有地方可以點：" + cv.uncovered.slice(0, 4).map(function (c) { return "「" + c.name + "」"; }).join("、") + (cv.uncovered.length > 4 ? "…" : "") + "。（LINE 的「📚 全部章元」按鈕、網頁首頁的「☰ 章元」，還是找得到它們。）");
  var emp = _yzMapEmptyCh_(hb || {}), lk = [];
  all.slice(0, YZ_MAP_MAX).forEach(function (s0) { var m0 = /^c:(.+)$/.exec(String(s0.to || "")); if (m0 && emp[m0[1]] && s0.st !== "lock") lk.push(s0.label || m0[1]); });
  if (lk.length) G("info", "有 " + lk.length + " 個地點連到「還沒有標題」的章（" + lk.slice(0, 4).join("、") + (lk.length > 4 ? "…" : "") + "）：藥師看到的是🔒，點了說「還在整理」；那一章寫好第一個標題，就自動打開。");
  if (cat.img && o.geom) {
    out.bytes = _yzBytes_(_yzMapBubble_(Object.assign({}, cat, { img: YZ_MAP_URL_SAMPLE }), hb || {}));
    if (out.bytes > YZ_BUBBLE_SAFE) G("bad", "這張目錄卡片約 " + Math.round(out.bytes / 100) / 10 + " KB，超過 LINE 的上限（我們抓 " + Math.round(YZ_BUBBLE_SAFE / 1000) + " KB）：減少地點，或關掉「圖下面加按鈕」。");
    else if (out.bytes > YZ_MAP_WARN_BYTES) G("warn", "這張目錄卡片約 " + Math.round(out.bytes / 100) / 10 + " KB，快到 LINE 的上限了（我們抓 " + Math.round(YZ_BUBBLE_SAFE / 1000) + " KB）：地點再多就放不下。");
  }
  return out;
}

// ── 第 43 批：標題分層（最多 3 層，像 Word 的標題 1／2／3；像圖二的目錄）──
// 每個標題只記「第幾層」（lv：2、3；沒寫＝第 1 層），上下關係照順序算（跟階梯式一樣）：第 2 層掛在它上面最近的第 1 層底下……
// 第一個一定是第 1 層；每一個最多比上一個多一層（存檔時後端也會修一次）。不自動編號（照開發者打的名字）。
var YZ_TLV_MAX = 3;
function _yzTLv_(t) { var n = Math.floor(Number(t && t.lv) || 1); return n >= 2 && n <= YZ_TLV_MAX ? n : 1; }
function _yzTLvs_(ts) {   // 一章的標題 → 修正過的層級，例如 [1, 2, 2, 3, 1]
  var out = [], prev = 0;
  (ts || []).forEach(function (t) { var lv = Math.min(_yzTLv_(t), prev + 1); out.push(lv); prev = lv; });
  return out;
}
function _yzTPath_(ts, t) {   // 這個標題的上層（第 1 層在前）：[第 1 層, 第 2 層]；沒有上層＝[]
  var i = (ts || []).indexOf(t); if (i < 0) return [];
  var lvs = _yzTLvs_(ts), want = lvs[i] - 1, out = [];
  for (var k = i - 1; k >= 0 && want >= 1; k--) if (lvs[k] === want) { out.unshift(ts[k]); want--; }
  return out;
}
function _yzTKids_(ts, i, lvs) {   // 第 i 個標題底下有幾個（子標題、孫標題）＝緊接在後面、層級比它大的
  lvs = lvs || _yzTLvs_(ts);
  var n = 0;
  for (var k = i + 1; k < lvs.length && lvs[k] > lvs[i]; k++) n++;
  return n;
}
function _yzTDeep_(ts) { return _yzTLvs_(ts).some(function (v) { return v > 1; }); }   // 這一章有沒有分層

// ── 標題清單：一章一張，每個標題一行，點了開內容（第 43 批：有分層的，往右縮；第 1 層有子標題的用粗體）──
function _yzTitleListBubble_(ch, titles, o) {
  o = o || {};
  var rows = [], lvs = _yzTLvs_(titles);
  titles.forEach(function (t, i) {
    var lv = lvs[i], head = lv === 1 && _yzTKids_(titles, i, lvs) > 0;
    if (i > 0) rows.push({ type: "separator", color: "#E3E7EC" });
    rows.push({
      type: "box", layout: "horizontal", paddingAll: "10px", paddingStart: lv > 1 ? (10 + (lv - 1) * 16) + "px" : "10px", spacing: "sm", action: _yzPB_("yz=t&t=" + t.id, "打開"),
      contents: [
        lv > 1 ? { type: "text", text: "└", size: "xs", color: "#9AA5B1", flex: 0, gravity: "center" } : null,
        { type: "text", text: t.name, size: lv > 2 ? "xs" : "sm", weight: head ? "bold" : "regular", wrap: true, color: lv > 1 ? "#334155" : "#1F1F1F", flex: 1 },
        _yzPageShort_(t.page) ? { type: "text", text: _yzPageShort_(t.page), size: "xxs", color: "#8A6D00", flex: 0, gravity: "center" } : null,
        { type: "text", text: "›", size: "lg", color: YZ_ACCENT, flex: 0, gravity: "center" }
      ].filter(Boolean)
    });
  });
  var nm = (ch.ico ? ch.ico + " " : "") + ch.name, sub = titles.length + " 個標題，點一個看內容";
  return _yzTopOf_({
    type: "bubble", size: "mega",
    body: { type: "box", layout: "vertical", paddingAll: "4px", contents: rows },
    footer: { type: "box", layout: "vertical", paddingAll: "8px", contents: (o.back || []).slice(0, 3).map(function (x) {   // 互相連結：從別的標題連到這一章的
      return { type: "button", style: "link", height: "sm", color: YZ_ACCENT, action: _yzPB_("yz=t&t=" + x.t.id, ("↩ " + _yzBackLabel_(x, ch.id)).slice(0, 20)) };
    }).concat([
      { type: "button", style: "link", height: "sm", color: YZ_ACCENT, action: _yzPB_("yz=home", "🏠 回首頁") },
      _yzFoot_()
    ]) }
  }, _yzThemeHero_(ch, "📘 藥戰手冊", nm, sub, "20:9"), function () { return _yzHead_("📘 藥戰手冊", nm, sub); });
}

// ── 階梯式內容（像法條：一層一層縮排，編號自動算）──
// 每一行只存「第幾層（lv）＋文字（v）」，編號是算出來的：加一行、搬一行，後面的編號自己跟著變。
var YZ_LADDER_MAX = 5;   // 最多 5 層
var YZ_LADDER_IMG_MAX = 20;   // 一段階梯式內容最多放幾張圖（編輯器的 🖼 按鈕到這個數就停用）
var YZ_LADDER_STYLES = {
  law: { name: "法條式", ex: "第一條／一、／（一）／1.／(1)" },
  cn:  { name: "條列式", ex: "一、／（一）／1.／(1)／①" },
  num: { name: "數字層級", ex: "1.／1.1／1.1.1／…" },
  dot: { name: "圓點縮排（不編號）", ex: "•／◦／▪／…" },
  plain: { name: "只縮排（不編號、不加記號）", ex: "前言、說明文字用" }
};
function _yzLadderNoNum_(st) { return st === "dot" || st === "plain"; }   // 這兩種沒有編號：「編號從哪裡開始」對它們沒有用，也不算「上一段」
var YZ_LADDER_STEP = { nano: 6, micro: 8, deca: 10, hecto: 12, kilo: 14, mega: 14, giga: 16 };   // LINE 卡片上，每往右一層縮進去幾 px（卡片越小縮越少）

function _yzCn_(n) {   // 1 → 一、12 → 十二、110 → 一百十（法條的寫法）
  var d = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  n = Math.floor(Number(n) || 0);
  if (n <= 0 || n >= 1000) return String(n);
  if (n < 10) return d[n];
  if (n < 20) return "十" + (n % 10 ? d[n % 10] : "");
  if (n < 100) return d[Math.floor(n / 10)] + "十" + (n % 10 ? d[n % 10] : "");
  var h = Math.floor(n / 100), r = n % 100, t = d[h] + "百";
  if (r === 0) return t;
  if (r < 10) return t + "零" + d[r];
  if (r < 20) return t + "十" + (r % 10 ? d[r % 10] : "");
  return t + d[Math.floor(r / 10)] + "十" + (r % 10 ? d[r % 10] : "");
}
function _yzCirc_(n) { return n >= 1 && n <= 20 ? String.fromCharCode(0x2460 + n - 1) : "(" + n + ")"; }

// 一行可以是「文字」{ lv, v }，也可以是「圖片」{ lv, img:{ url, cap, ar, … } }。圖片行沒有編號、不佔編號，掛在它上面那一個文字行底下。
function _yzLadderIsImg_(it) { return !!(it && it.img && typeof it.img === "object"); }
// 層級修正：第一行一定是第 1 層；每一行最多比上一個「文字行」多一層（圖片行不算上一行）；最多 5 層。回傳新的陣列，不動原本的。
function _yzLadderFix_(items) {
  var out = [], prev = 0;
  (items || []).forEach(function (it) {
    var lv = Math.floor(Number(it && it.lv) || 1);
    lv = Math.max(1, Math.min(YZ_LADDER_MAX, lv));
    if (lv > prev + 1) lv = prev + 1;
    if (_yzLadderIsImg_(it)) { out.push({ lv: lv, img: it.img }); return; }
    out.push({ lv: lv, v: it && it.v !== undefined && it.v !== null ? String(it.v) : "" });
    prev = lv;
  });
  return out;
}
// 要畫出來的行：空白的文字行、還沒有圖的圖片行不畫、也不佔編號；拿掉以後層級再修一次。LINE、網頁、編輯器都用這一份，三邊的編號才會一樣。
function _yzLadderShown_(it) {
  if (_yzLadderIsImg_(it)) return !!it.img.url;
  return !!(it && it.v !== undefined && it.v !== null && String(it.v).trim() !== "");
}
function _yzLadderRows_(b) {
  var items = _yzLadderFix_((b && b.items || []).filter(_yzLadderShown_));
  return { items: items, marks: _yzLadderMarks_(items, b && b.style, b && b.n0) };
}
// 這一段裡「會畫出來的圖片行」，照順序。「看大圖」按鈕用它的第幾張來找圖。
function _yzLadderImgs_(b) { return _yzLadderRows_(b).items.filter(_yzLadderIsImg_); }
// n0：第 1 層前面已經用掉幾號（「接續上一段」「自己指定」才有；0 ＝ 從第一條開始）。只縮排（plain）每一行都是 ""（不加記號）。
function _yzLadderMarks_(items, style, n0) {
  var st = YZ_LADDER_STYLES[style] ? style : "law", cnt = [0, 0, 0, 0, 0, 0], out = [];
  if (!_yzLadderNoNum_(st)) cnt[1] = Math.max(0, Math.floor(Number(n0) || 0));
  items.forEach(function (it) {
    if (_yzLadderIsImg_(it) || st === "plain") { out.push(""); return; }
    var lv = it.lv, k, n, m;
    cnt[lv]++; for (k = lv + 1; k <= YZ_LADDER_MAX; k++) cnt[k] = 0;
    n = cnt[lv];
    if (st === "law") m = lv === 1 ? "第" + _yzCn_(n) + "條" : lv === 2 ? _yzCn_(n) + "、" : lv === 3 ? "（" + _yzCn_(n) + "）" : lv === 4 ? n + "." : "(" + n + ")";
    else if (st === "cn") m = lv === 1 ? _yzCn_(n) + "、" : lv === 2 ? "（" + _yzCn_(n) + "）" : lv === 3 ? n + "." : lv === 4 ? "(" + n + ")" : _yzCirc_(n);
    else if (st === "num") { var p = []; for (k = 1; k <= lv; k++) p.push(Math.max(1, cnt[k])); m = p.join(".") + (lv === 1 ? "." : ""); }
    else m = ["•", "◦", "▪", "▫", "-"][lv - 1];
    out.push(m);
  });
  return out;
}
// ── 編號從哪裡開始（像法條分成好幾個標題：「藥師與民眾及病人」接在「總則」第六條後面，從第七條開始）──
// b.num：""（從頭開始）／"cont"（接續上一段）／"set"（自己指定：從 b.from 號開始，1～999）。
// 「上一段」＝同一章裡（照標題順序、段落順序）前面最近一段「有編號、也有字」的階梯式內容；圓點、只縮排的不算；不跨章。
// 算出來的放在 b.n0（第 1 層前面已經用掉幾號）。只放在記憶體、存檔時會被清掉，所以前面的條文增減，後面的號碼自動跟著變。
// LINE（讀資料時）、網頁（打開文章、搜尋時）、編輯器（每次畫編號時）都先跑一次。
// want（選填）：要問的那一段 → 回傳 { n0, prev }（prev ＝ 接在哪一段後面 { ch, t, last:最後一號, st:樣式 }；沒有就是 null）
var YZ_LADDER_FROM_MAX = 999;
function _yzLadderFrom_(v) { var n = Math.floor(Number(v)); return n >= 1 ? Math.min(YZ_LADDER_FROM_MAX, n) : 1; }
function _yzLadderNumberAll_(hb, want) {
  var ans = null;
  ((hb && hb.chapters) || []).forEach(function (c) {
    var prev = null;
    (((hb.titles || {})[c.id]) || []).forEach(function (t) {
      ((t && t.blocks) || []).forEach(function (b) {
        if (!b || b.t !== "ladder") return;
        var st = YZ_LADDER_STYLES[b.style] ? b.style : "law";
        var n0 = b.num === "cont" ? (prev ? prev.last : 0) : b.num === "set" ? _yzLadderFrom_(b.from) - 1 : 0;
        b.n0 = n0;
        if (b === want) ans = { n0: n0, prev: b.num === "cont" ? prev : null };
        if (_yzLadderNoNum_(st)) return;
        var n1 = 0;
        _yzLadderFix_((b.items || []).filter(_yzLadderShown_)).forEach(function (it) { if (it.lv === 1 && !_yzLadderIsImg_(it)) n1++; });
        if (n1) prev = { ch: c, t: t, last: n0 + n1, st: st };
      });
    });
  });
  return want ? (ans || { n0: 0, prev: null }) : hb;
}
// 第 n 號（第 1 層）用這個樣式寫出來長什麼樣子：7 → 第七條（法條式）、七、（條列式）、7.（數字層級）
function _yzLadderNoText_(st, n) { return _yzLadderMarks_([{ lv: 1, v: "x" }], st, Math.max(1, n) - 1)[0] || ""; }
// 記號欄要多寬（px），同一層取最寬的，文字才會對齊
function _yzMarkW_(m, px) {
  var w = 0;
  for (var i = 0; i < m.length; i++) {
    var c = m.charCodeAt(i), ch = m.charAt(i);
    if (c === 0x2022) w += 0.5;
    else if (c >= 0x2E80 || (c >= 0x2460 && c <= 0x25FF)) w += 1;
    else if (c >= 48 && c <= 57) w += 0.58;
    else if (ch === ".") w += 0.3;
    else if (ch === "(" || ch === ")") w += 0.4;
    else w += 0.6;
  }
  return Math.ceil(w * px) + 5;
}
// 階梯 → LINE 的幾個方塊。每一「條」（第 1 層）一個方塊，方塊和方塊之間才拆卡片（一條太長就在第 2 層再拆）。
function _yzLadderLines_(b, o) {
  o = o || {};
  var size = o.size || "sm", px = size === "xs" ? 13 : 14, r = _yzLadderRows_(b), mw = {};
  var st = YZ_LADDER_STYLES[b && b.style] ? b.style : "law";
  r.items.forEach(function (it, i) { if (_yzLadderIsImg_(it) || !r.marks[i]) return; var w = _yzMarkW_(r.marks[i], px); if (!mw[it.lv] || w > mw[it.lv]) mw[it.lv] = w; });   // 只縮排：沒有記號，就沒有記號欄
  var step = YZ_LADDER_STEP[o.bs || "giga"] || 14, chunks = [], cur = null, rows = 0, imgN = 0;
  r.items.forEach(function (it, i) {
    if (!cur || it.lv === 1 || (it.lv === 2 && rows >= 14)) { cur = { type: "box", layout: "vertical", spacing: "sm", contents: [] }; chunks.push(cur); rows = 0; }
    if (_yzLadderIsImg_(it)) {   // 圖片：縮排跟同一層的文字對齊（沒有文字的那一層，就只照層級縮）
      var inner = _yzImage_({ url: it.img.url, ar: it.img.ar, cap: it.img.cap }, o.act ? o.act(imgN) : null);
      imgN++;
      if (inner) { cur.contents.push({ type: "box", layout: "vertical", paddingStart: (step * (it.lv - 1) + (mw[it.lv] ? mw[it.lv] + 4 : 0)) + "px", contents: [inner] }); rows++; }
      return;
    }
    var strong = st === "law" && it.lv === 1, mk = r.marks[i];
    cur.contents.push({
      type: "box", layout: "horizontal", spacing: "sm", paddingStart: (step * (it.lv - 1)) + "px",
      contents: [
        mk ? { type: "box", layout: "vertical", flex: 0, width: mw[it.lv] + "px", contents: [{ type: "text", text: mk, size: size, color: strong ? YZ_ACCENT : "#4A5565", weight: strong ? "bold" : "regular" }] } : null,   // LINE 不收空白的文字：沒有記號就整欄不放
        { type: "text", text: it.v, size: size, color: "#1F1F1F", wrap: true, flex: 1 }
      ].filter(Boolean)
    });
    rows++;
  });
  return chunks;
}

// 一整段文字 → 階梯。開頭的編號決定層級（編號本身會拿掉，之後由程式重新算）；沒有編號的行接在上一行後面。
function _yzLadderGuess_(text) {
  var n = { law: 0, cn: 0, num: 0 };
  String(text === null || text === undefined ? "" : text).split("\n").slice(0, 40).forEach(function (l) {
    l = l.replace(/^[\s　]+/, "");
    if (/^第\s*(?:[一二三四五六七八九十百零〇]+|\d{1,3})\s*條/.test(l)) n.law++;
    else if (/^\d+\.\d+/.test(l)) n.num++;
    else if (/^(?:[一二三四五六七八九十百]+[、．.]|[（(][一二三四五六七八九十]+[）)])/.test(l)) n.cn++;
  });
  return n.law ? "law" : n.num ? "num" : n.cn ? "cn" : "";
}
// 圖片：整段文字裡用 ［圖］ 或 ［圖：圖說］ 單獨一行代表。old ＝ 這一段原本的行（要把原本的圖片接回去：第 1 個 ［圖］ 接原本的第 1 張圖，依序）。
// 回傳的 lostImgs ＝ 原本有、這次文字裡沒有對應 ［圖］ 的圖片張數（儲存的話，這幾張會不見）；emptyImgs ＝ ［圖］ 比原本的圖還多，多出來的是空位。
var YZ_LADDER_IMG_RE = /^[［\[]\s*圖\s*(?:[:：]\s*([^］\]]*?))?\s*[］\]]\s*$/;
function _yzLadderParse_(text, style, old) {
  var st = YZ_LADDER_STYLES[style] ? style : (_yzLadderGuess_(text) || "law");
  var pool = (old || []).filter(function (it) { return _yzLadderIsImg_(it) && it.img.url; }), emptyImgs = 0, lastTextLv = 0;
  var CN = "[一二三四五六七八九十百零〇]+";
  var reTiao = new RegExp("^第\\s*(?:" + CN + "|\\d{1,3})\\s*條[：:\\s]*");
  var reDun = new RegExp("^" + CN + "[、．.]\\s*");
  var rePar = new RegExp("^[（(]" + CN + "[）)]\\s*");
  var reDec = /^\d+(?:\.\d+)+[.、．]?\s*/;
  var reNum = /^\d{1,3}[.、．]\s*/;
  var reNumPar = /^[（(]\d{1,3}[）)]\s*/;
  var reCirc = /^[①-⑳]\s*/;
  var reDot = /^[•◦▪▫‣・●○■□\-–—]\s+/;
  var LV = {   // 各樣式：這種編號算第幾層
    law: { tiao: 1, dun: 2, par: 3, num: 4, npar: 5, circ: 5 },
    cn:  { tiao: 1, dun: 1, par: 2, num: 3, npar: 4, circ: 5 },
    num: { tiao: 1, dun: 1, par: 2, num: 1, npar: 3, circ: 4 },
    dot: { tiao: 1, dun: 1, par: 2, num: 1, npar: 2, circ: 3 }
  }[st];
  var items = [];
  String(text === null || text === undefined ? "" : text).replace(/\r/g, "").split("\n").forEach(function (raw) {
    if (!raw.trim()) return;
    var ind = /^([\s　]*)/.exec(raw)[1], line = raw.slice(ind.length), kind = "", m, lv = 0;
    var mi = YZ_LADDER_IMG_RE.exec(line.trim());
    if (mi) {
      var src = pool.shift(), im = src ? Object.assign({}, src.img) : { url: "", cap: "", ar: "4:3" };
      if (!src) emptyImgs++;
      im.cap = mi[1] ? mi[1].trim() : "";
      var icols = 0; for (var q = 0; q < ind.length; q++) icols += (ind.charAt(q) === "　" ? 2 : ind.charAt(q) === "\t" ? 4 : 1);
      items.push({ lv: ind ? 1 + Math.floor(icols / 2) : Math.max(1, lastTextLv), img: im });   // 有縮排就照縮排（每 2 格一層，跟 _yzLadderToText_ 寫出來的一樣）；沒縮排就跟上面那一行同一層
      return;
    }
    if (st === "plain") {   // 只縮排：不認編號、不拿掉任何字（行首的「一、」「1.」都當成文字）；一行一項，層級只看縮排（每 2 格一層）
      var pc = 0; for (var pq = 0; pq < ind.length; pq++) pc += (ind.charAt(pq) === "　" ? 2 : ind.charAt(pq) === "\t" ? 4 : 1);
      items.push({ lv: 1 + Math.floor(pc / 2), v: line.trim() }); lastTextLv = items[items.length - 1].lv;
      return;
    }
    if ((m = reTiao.exec(line))) { kind = "tiao"; }
    else if ((m = reDec.exec(line)) && st === "num") { kind = "dec"; lv = m[0].replace(/[.、．]?\s*$/, "").split(".").length; }
    else if ((m = reDun.exec(line))) { kind = "dun"; }
    else if ((m = rePar.exec(line))) { kind = "par"; }
    else if ((m = reNum.exec(line))) { kind = "num"; }
    else if ((m = reNumPar.exec(line))) { kind = "npar"; }
    else if ((m = reCirc.exec(line))) { kind = "circ"; }
    else if ((m = reDot.exec(line))) { kind = "dot"; }
    if (!kind) {
      var lastIt = items[items.length - 1];
      if (st === "dot" || !items.length) {   // 圓點縮排：沒有編號的行是新的一行，層級看縮排（每 2 格一層）
        var cols = 0; for (var i = 0; i < ind.length; i++) cols += (ind.charAt(i) === "　" ? 2 : ind.charAt(i) === "\t" ? 4 : 1);
        items.push({ lv: 1 + Math.floor(cols / 2), v: line.trim() }); lastTextLv = items[items.length - 1].lv;
      } else if (_yzLadderIsImg_(lastIt)) { items.push({ lv: Math.max(1, lastTextLv), v: line.trim() }); }   // 上一行是圖片：這一行另起一個文字行（跟上面那個文字行同一層）
      else lastIt.v += "\n" + line.trim();
      return;
    }
    var body = line.slice(m[0].length).trim();
    if (kind === "dot") { var c2 = 0; for (var j = 0; j < ind.length; j++) c2 += (ind.charAt(j) === "　" ? 2 : ind.charAt(j) === "\t" ? 4 : 1); lv = 1 + Math.floor(c2 / 2); }
    else if (kind !== "dec") lv = LV[kind];
    items.push({ lv: lv, v: body }); lastTextLv = lv;
  });
  return { items: _yzLadderFix_(items), style: st, lostImgs: pool.length, emptyImgs: emptyImgs };
}
// 階梯 → 一整段文字（編號＋縮排）。LINE 裡改整段、編輯器的「整段文字」都用它。n0：編號從哪裡開始（跟畫出來的一樣，見 _yzLadderNumberAll_）
function _yzLadderToText_(items, style, n0) {
  var r = _yzLadderRows_({ items: items, style: style, n0: n0 }), dot = style === "dot", plain = style === "plain";
  return r.items.map(function (it, i) {
    var pad = ""; for (var k = 1; k < it.lv; k++) pad += "　";
    if (_yzLadderIsImg_(it)) return pad + "［圖" + (String(it.img.cap || "").trim() ? "：" + String(it.img.cap).trim().replace(/[\r\n］\]]+/g, " ") : "") + "］";
    if (plain) return pad + it.v.replace(/\n/g, "\n" + pad);   // 只縮排：沒有記號；一行裡面換行的，下一行也照同一層縮排（讀回來是同一層的兩行）
    var m = r.marks[i];
    return pad + m + (/條$/.test(m) || dot ? " " : "") + it.v.replace(/\n/g, "\n" + pad + "　");   // 圓點後面要空一格，讀回來才分得出「記號」和「文字」
  }).join("\n");
}

// ── 藥品卡片（第 29 批：補藥神器的藥）：LINE 上收起來＝一行一支藥（CODE、商品名、中文名），點一下才看那一支的藥品卡（不給位置） ──
var YZ_DRUG_SHOW = 30;
function _yzDrugNodes_(b, ctx) {
  var its = (b.items || []).filter(function (d) { return d && d.code; }).slice(0, YZ_DRUG_SHOW);
  if (!its.length) return [];
  var rows = [{ type: "text", text: "💊 藥品（點一下看藥品卡）", size: "xs", weight: "bold", color: YZ_ACCENT }];
  its.forEach(function (d, n) {
    if (n) rows.push({ type: "separator", color: "#D7E3EA" });
    var name = [{ type: "span", text: String(d.code) + "　", color: "#5F6B7A" }, { type: "span", text: String(d.brand || d.chName || d.code) }];
    var col = [{ type: "text", size: "sm", weight: "bold", color: "#1F2A33", wrap: true, contents: name }];
    if (d.chName && d.brand) col.push({ type: "text", text: String(d.chName), size: "xs", color: "#1B7F5C", wrap: true });
    var row = { type: "box", layout: "horizontal", spacing: "sm", paddingTop: "6px", paddingBottom: "6px", contents: [
      { type: "box", layout: "vertical", flex: 1, contents: col },
      { type: "text", text: "›", size: "lg", color: "#9AA5B1", flex: 0, gravity: "center" }
    ] };
    if (ctx && ctx.tid) row.action = _yzPB_("yz=drug&t=" + ctx.tid + "&c=" + encodeURIComponent(String(d.code)), "看藥品卡");
    rows.push(row);
  });
  return [{ type: "box", layout: "vertical", backgroundColor: "#F4F8FA", borderColor: "#D7E3EA", borderWidth: "1px", cornerRadius: "8px", paddingAll: "10px", contents: rows }];
}

// ── 第 40 批（一起做的）：網址連結（外部網站）：{ t:"link", items:[{ u:網址, t:顯示的字, n:說明 }] }（最多 10 個）──
// LINE：一個連結一個小框（🌐 名稱、網站、說明、↗），點了用 LINE 內建的瀏覽器打開；網頁：一樣的小框，電腦點了開小視窗、手機開新分頁。
var YZ_LINK_MAX = 10;
function _yzLinkFix_(v) {   // → 合格的網址（http(s)://網站…，沒有空白、1000 字以內；中文會換成 %XX）；不合格＝""
  var s = String(v === null || v === undefined ? "" : v).trim();
  if (!s) return "";
  if (/^www\./i.test(s)) s = "https://" + s;
  if (!/^https?:\/\//i.test(s)) return "";
  if (/[^\x21-\x7E]/.test(s)) { try { s = encodeURI(decodeURI(s)); } catch (e) { try { s = encodeURI(s); } catch (e2) { return ""; } } }
  if (s.length > 1000 || /[\s"'<>\\^`{|}]/.test(s)) return "";
  return /^https?:\/\/[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*(:\d{1,5})?([\/?#]|$)/i.test(s) ? s : "";
}
function _yzLinkHost_(u) { var m = /^https?:\/\/([^\/?#:]+)/i.exec(String(u || "")); return m ? m[1].replace(/^www\./i, "").toLowerCase() : ""; }
function _yzLinkItems_(b) { return (b && Array.isArray(b.items) ? b.items : []).filter(function (x) { return x && _yzLinkFix_(x.u); }).slice(0, YZ_LINK_MAX); }
function _yzLinkLabel_(x) { return String(x && x.t || "").replace(/\s+/g, " ").trim() || _yzLinkHost_(_yzLinkFix_(x && x.u)) || "網站"; }
// 第 43 批：網址連結指到檔案（Word、PDF、Excel、PPT、圖片；Google 文件、試算表、簡報、雲端硬碟的檔）→ 網頁在手冊裡的小視窗看（只能看：不能下載、不能列印、有浮水印）；
//   LINE 點了打開網頁的那個小視窗（不給原本的網址）。每一個連結的「開法」k：""＝自動（看網址）、"file"＝一定當檔案看、"web"＝一定開網頁（新視窗）。
var YZ_FILE_EXT = { pdf: "pdf", doc: "word", docx: "word", odt: "word", rtf: "word", txt: "word", xls: "excel", xlsx: "excel", ods: "excel", csv: "excel", ppt: "ppt", pptx: "ppt", odp: "ppt", png: "img", jpg: "img", jpeg: "img", gif: "img", webp: "img", bmp: "img" };
var YZ_FILE_ICO = { pdf: "📕", word: "📘", excel: "📗", ppt: "📙", img: "🖼", file: "📄" };
var YZ_FILE_NAME = { pdf: "PDF", word: "Word", excel: "Excel", ppt: "PPT", img: "圖片", file: "檔案" };
function _yzLinkFileKind_(x) {   // → "pdf"／"word"／"excel"／"ppt"／"img"／"file"（看不出是哪一種的檔）／""＝網頁
  var u = _yzLinkFix_(x && x.u), k = x && x.k;
  if (!u || k === "web") return "";
  var m = /^https?:\/\/(?:docs|drive)\.google\.com\/(document|spreadsheets|presentation|file)\/(?:u\/\d+\/)?d\//i.exec(u);
  if (m) return m[1] === "document" ? "word" : m[1] === "spreadsheets" ? "excel" : m[1] === "presentation" ? "ppt" : "file";
  if (/^https?:\/\/drive\.google\.com\/(open|uc)\?/i.test(u) && /[?&]id=/i.test(u)) return "file";
  var e = (/\.([A-Za-z0-9]{2,5})$/.exec(u.split(/[?#]/)[0]) || [])[1], t = e ? YZ_FILE_EXT[e.toLowerCase()] : "";
  return t || (k === "file" ? "file" : "");
}
function _yzLinkTag_(u) {   // 網址的小指紋（手冊改過、連結換了位置也找得到同一個檔）
  var h = 0x811c9dc5, s = String(u || "");
  for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
}
function _yzLinkNodes_(b, ctx) {
  ctx = ctx || {};
  return _yzLinkItems_(b).map(function (x, i) {
    var u = _yzLinkFix_(x.u), lab = _yzLinkLabel_(x), n = String(x.n || "").replace(/\s+/g, " ").trim(), fk = _yzLinkFileKind_(x);
    var sub = fk ? YZ_FILE_NAME[fk] + "｜在手冊網頁看（只能看）" + (n ? "｜" + n : "") : _yzLinkHost_(u) + (n ? "｜" + n : "");
    var fu = fk && ctx.furl ? ctx.furl(b, i, _yzLinkTag_(u)) : "";   // 檔案：點了開網頁的小視窗（不給原本的網址）；沒有網頁連結（編輯器的預覽）＝不能點
    var box = { type: "box", layout: "horizontal", spacing: "md", margin: i ? "sm" : "md", paddingAll: "11px", cornerRadius: "10px", borderWidth: "1px", borderColor: fk ? "#E3C27A" : "#A9C7E8", backgroundColor: fk ? "#FFF8E8" : "#F2F7FD",
      contents: [
        { type: "text", text: fk ? YZ_FILE_ICO[fk] : "🌐", flex: 0, size: "lg", gravity: "center" },
        { type: "box", layout: "vertical", flex: 1, spacing: "xs", contents: [
          { type: "text", text: lab.substring(0, 60), size: "sm", weight: "bold", color: fk ? "#7A4B00" : "#174A84", wrap: true },
          { type: "text", text: sub.substring(0, 160), size: "xxs", color: "#5F6B7A", wrap: true }] },
        { type: "text", text: fk ? "›" : "↗", flex: 0, size: "md", weight: "bold", color: fk ? "#7A4B00" : "#174A84", gravity: "center" }] };
    if (!fk) box.action = { type: "uri", label: lab.substring(0, 20), uri: u };
    else if (fu) box.action = { type: "uri", label: lab.substring(0, 20), uri: fu };
    return box;
  });
}
function _yzLinkLines_(b) {   // 搜尋、Word 匯出、AI 出題用的字：「名稱：網址（說明）」
  return _yzLinkItems_(b).map(function (x) { var n = String(x.n || "").trim(); return _yzLinkLabel_(x) + "：" + _yzLinkFix_(x.u) + (n ? "（" + n + "）" : ""); });
}

// ── 內容：一個標題一張（文字、表格、圖片、備註）；太長就自動拆成幾張 ──
function _yzBlockNodes_(b, act, bs, ctx) {
  ctx = ctx || {};
  if (b.t === "text") return _yzTextLines_(b.v, { go: ctx.go, pics: b.pics, tbls: b.tbls, bs: bs, pact: ctx.pact ? function (id) { return ctx.pact(b, id); } : null });
  if (b.t === "ladder") return _yzLadderLines_(b, { bs: bs, act: act ? function (k) { return act(b, k); } : null });
  if (b.t === "table") { var x = _yzTable_(b, { bs: bs }); return x ? [x] : []; }
  if (b.t === "img") { var y = b.draw ? _yzDrawImage_(b, act ? act(b) : null) : _yzImage_(b, act ? act(b) : null); return y ? [y] : []; }   // 第 40 批：流程圖
  if (b.t === "anim" && b.kind !== "steps") { var z = _yzAnimFile_(b, { act: act ? act(b) : null, used: ctx.used, tid: ctx.tid }); return z ? [z] : []; }
  if (b.t === "drug") return _yzDrugNodes_(b, ctx);   // 第 29 批：藥品卡片（LINE 收起來）
  if (b.t === "link") return _yzLinkNodes_(b, ctx);   // 第 40 批（一起做的）：網址連結；第 43 批：檔案的連結開網頁的小視窗（ctx.furl）
  return [];   // 分步動畫（steps）不放在文字卡裡，由 _yzContentBubbles_ 另外做成一排卡片
}
function _yzContentBubble_(ch, ti, nodes, note, o) {
  o = o || {};
  var body = nodes.slice();
  if (o.noteOn === undefined ? !!note : o.noteOn) { var n = _yzNote_(note, ti.page); if (n) body.push(n); }
  var nav = [];
  if (o.prev) nav.push({ type: "button", style: "secondary", height: "sm", flex: 1, action: _yzPB_(o.prev, "‹ 上一個") });
  if (o.next) nav.push({ type: "button", style: "secondary", height: "sm", flex: 1, action: _yzPB_(o.next, "下一個 ›") });
  var foot = [];
  (o.back || []).forEach(function (x) { foot.push({ type: "button", style: "link", height: "sm", color: YZ_ACCENT, action: _yzPB_("yz=t&t=" + x.t.id, ("↩ " + _yzBackLabel_(x, ch.id)).slice(0, 20)) }); });   // 互相連結：從這些標題連過來的
  if (nav.length) foot.push({ type: "box", layout: "horizontal", spacing: "sm", contents: nav });
  foot.push({ type: "button", style: "link", height: "sm", color: YZ_ACCENT, action: _yzPB_("yz=c&c=" + ch.id, "📚 這一章的標題") });
  if (o.dev) foot.push({ type: "box", layout: "horizontal", spacing: "sm", contents: [
    { type: "button", style: "secondary", height: "sm", flex: 1, action: _yzPB_("yz=ed&t=" + ti.id, "✏️ 修改") },
    o.editUrl ? { type: "button", style: "secondary", height: "sm", flex: 1, action: { type: "uri", label: "🌐 網頁編輯", uri: o.editUrl } } : null
  ].filter(Boolean) });
  foot.push(_yzFoot_());
  var part = o.parts > 1 ? "（第 " + o.part + "／" + o.parts + " 張）" : "";
  var top = "📘 藥戰手冊　" + (ch.ico ? ch.ico + " " : "") + ch.name + (o.path && o.path.length ? " › " + o.path.join(" › ") : "");   // 第 43 批：分層的標題：上層也寫出來
  var hero = !o.part || o.part === 1 ? _yzThemeHero_(ch, top, ti.name, part || null, "20:7") : null;   // 第一張：主題圖；後面幾張：青綠色那條就好（省空間）
  return _yzTopOf_({
    type: "bubble", size: o.size || ti.size || "giga",
    body: { type: "box", layout: "vertical", spacing: "md", paddingAll: "13px", contents: body.length ? body : [{ type: "text", text: "（這個標題還沒有內容）", size: "sm", color: "#7B8696" }] },
    footer: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "10px", contents: foot }
  }, hero, function () { return _yzHead_(top, ti.name, part || null); });
}
// 這一組的第一個元件前面至少空 m（已經空更多的就不動）。回傳新的陣列（第一個元件複製一份，不改原本的）
var YZ_GAPS = ["none", "xs", "sm", "md", "lg", "xl", "xxl"];
function _yzGapBefore_(nodes, m) {
  if (!nodes || !nodes.length) return nodes;
  var n0 = nodes[0], has = YZ_GAPS.indexOf(n0 && n0.margin);
  if (has >= YZ_GAPS.indexOf(m)) return nodes;
  return [Object.assign({}, n0, { margin: m })].concat(nodes.slice(1));
}
// blocks → 一則或多則訊息。回傳 {bubbles:[每則訊息（bubble 或 carousel）], bytes:[每則多大], parts:內容拆成幾段, cards:總共幾張卡片, kinds:["bubble"|"carousel"…], anim:n}
// 文字、表格、圖片、階梯式、動畫檔：塞進同一張卡片，太長就拆成下一張；分步動畫：每一步一張。
// 第 28 批：兩張以上的卡片合成一則「左右滑」的訊息（carousel）。
// 第 41 批：每一塊可以只在 LINE（only:"line"）或只在網頁（only:"web"）顯示（編輯器每一塊上面的「顯示在」）；沒寫＝都顯示
//   ch："line"／"web"：這一塊在那邊要不要藏起來（搜尋也照這個：LINE 搜不到只在網頁的字，反過來也一樣）
var YZ_ONLY = { line: "只在 LINE", web: "只在網頁" };
function _yzOnlyHide_(b, ch) { return !!(b && ch && (b.only === "line" || b.only === "web") && b.only !== ch); }
// 第 29 批：LINE 好幾張卡片的排法：這個標題自己選的；沒選就照設定（lineSwipe：是＝滑動式，否＝一頁一頁）
function _yzLayOf_(t, cfg) { return t && (t.lay === "page" || t.lay === "swipe") ? t.lay : cfg && cfg.lineSwipe === false ? "page" : "swipe"; }
function _yzContentBubbles_(ch, ti, blocks, note, o) {
  o = o || {};
  var act = function (b, s) { return _yzPB_("yz=img&t=" + ti.id + "&i=" + (b.i === undefined ? 0 : b.i) + (s === undefined ? "" : "&s=" + s), "看大圖"); };
  var pact = function (b, id) { return _yzPB_("yz=img&t=" + ti.id + "&i=" + (b.i === undefined ? 0 : b.i) + "&p=" + id, "看大圖"); };   // 文字塊裡的圖
  var segs = [{ nodes: [] }], used = { n: 0 };   // used：已經放了幾張「會自己動」的圖（LINE 一則訊息最多 10 張，整個標題一起算比較保守）
  var cur = function () { return segs[segs.length - 1]; };
  var hasNote = !!_yzNote_(note, ti.page);
  var probe = function (nodes, last) { return _yzBytes_(_yzContentBubble_(ch, ti, nodes, note, { size: o.size, dev: o.dev, editUrl: o.editUrl, prev: o.prev, next: o.next, parts: 9, part: 9, noteOn: !!last, back: last ? back : null, path: o.path })); };
  var bs = o.size || ti.size || "giga";
  // 「連結到標題」的行：用標題代號找到標題，按鈕上寫「章名　標題名」（同一章就只寫標題名）；找不到（被刪了）就不顯示
  var goFn = o.hb ? function (id) { return _yzGoTarget_(o.hb, id, ch.id); } : null;
  var back = o.hb ? _yzBacklinks_(o.hb, [ti.id, ch.id], ti.id).slice(0, 3) : [];   // 互相連結：有連到這裡（這個標題、這一章）的，放在最後一張下面
  var pendBrk = false, hidN = 0;
  blocks.forEach(function (b, i) {
    if (_yzOnlyHide_(b, "line")) { hidN++; if (b.brk && i > 0) pendBrk = true; return; }   // 第 41 批：只在網頁的這一塊：LINE 不放（它的「換下一張」留給下一塊；i 照原本的，「看大圖」才對得上）
    b = Object.assign({}, b, { i: i });
    if (pendBrk) { b.brk = true; pendBrk = false; }
    if (cur().closed) segs.push({ nodes: [] });   // 第 40 批：前面是流程圖的說明框那一張：後面的內容從新的一張開始
    if (b.brk && i > 0 && cur().nodes && cur().nodes.length) segs.push({ nodes: [] });   // 編輯者指定「從這一塊開始放到下一張卡片」（只有 LINE；網頁照常一整頁）
    if (b.t === "anim" && b.kind === "steps") {
      var sb = _yzStepBubbles_(ch, ti, b, bs, { act: act });
      if (!sb.length) return;
      if (!cur().nodes.length) {
        if (segs.length === 1) segs[0] = { nodes: [{ type: "text", text: "🎞 下面是分步動畫，左右滑著看。", size: "sm", color: "#5F6B7A", wrap: true }] };   // 動畫排在最前面時，前面先放一張小卡（「上一個」按鈕才有地方放）
        else segs.pop();   // 前一個也是動畫：兩個直接接在一起，不留空卡
      }
      segs.push({ steps: sb }); segs.push({ nodes: [] });
      return;
    }
    var nodes = _yzIndentNodes_(_yzBlockNodes_(b, act, bs, { used: used, tid: ti.id, go: goFn, pact: pact, furl: o.furl }), _yzBlockInd_(b) * YZ_IND_PX);   // 整塊縮排（編輯器每一塊的 ⇤ ⇥）
    // 一個內容塊平常整塊放；階梯式內容常常很長，可以在「一條」和「一條」之間拆開；
    // 文字塊只有「自己一個就放不下」才一行一行拆。
    var units = [nodes];
    if (nodes.length > 1 && (b.t === "ladder" || (b.t === "text" && probe(nodes, false) > YZ_BUBBLE_SAFE))) units = nodes.map(function (n) { return [n]; });
    var gap = "xl";   // 一塊和一塊之間空大一點（第 27 批：太擠）；這一塊一開頭就是大標題：再空大一點（跟一塊裡面的大標題一樣）
    if (b.t === "text") { var L0 = _yzParseLines_(b.v).filter(function (L) { return L.k !== "gap"; })[0]; if (L0 && L0.k === "head" && L0.h <= 2) gap = "xxl"; }
    units.forEach(function (u, k) {
      var c = cur(), next = c.nodes.concat(k === 0 && c.nodes.length ? _yzGapBefore_(u, gap) : u);
      if (c.nodes.length && probe(next, false) > YZ_BUBBLE_SAFE) segs.push({ nodes: u }); else c.nodes = next;
    });
    // 第 40 批：流程圖的說明框 → 另外一張卡片（左右滑；使用者選的）。說明框很多、一張放不下就接下一張
    var nn = b.t === "img" && b.draw ? _yzDrawNoteNodes_(b.draw, bs) : [];
    if (nn.length) {
      if (cur().nodes.length) segs.push({ nodes: [] });
      nn.forEach(function (n) { var c = cur(), next = c.nodes.concat([n]); if (c.nodes.length && probe(next, false) > YZ_BUBBLE_SAFE) segs.push({ nodes: [n] }); else c.nodes = next; });
      cur().closed = true;
    }
  });
  if (hidN && segs.length === 1 && !segs[0].nodes.length) segs[0].nodes = [{ type: "text", text: "🌐 這一篇的內容放在手冊網頁：請到網頁看（下面「🌐 網頁」）。", size: "sm", color: "#5F6B7A", wrap: true }];   // 第 41 批：全部都是只在網頁的
  // 最後一段是空的（動畫後面沒有別的內容）：有備註就放備註；沒有就放一句收尾，「上一個／下一個」按鈕才有地方放
  var last = cur();
  if (!last.nodes.length && segs.length > 1 && !hasNote) last.nodes = [{ type: "text", text: "（動畫到這裡結束）", size: "sm", color: "#7B8696", wrap: true }];
  // 備註放最後一張；放不下就單獨一張
  if (hasNote && last.nodes.length && probe(last.nodes, true) > YZ_BUBBLE_SAFE) segs.push({ nodes: [] });
  var parts = segs.length, flat = [], groups = [];   // groups：一張內容卡片＝[卡片]；一組分步動畫＝[每一步…]
  segs.forEach(function (sg, i) {
    var lastOne = i === parts - 1;
    if (sg.steps) { flat = flat.concat(sg.steps); groups.push(sg.steps); return; }
    var cb = _yzContentBubble_(ch, ti, sg.nodes, note, { size: o.size, path: o.path, dev: o.dev && lastOne, editUrl: o.editUrl, prev: i === 0 ? o.prev : null, next: lastOne ? o.next : null, parts: parts, part: i + 1, noteOn: lastOne, back: lastOne ? back : null });
    flat.push(cb); groups.push([cb]);
  });
  // 第 28 批：兩張以上 → 一則「左右滑」的卡片（carousel，照順序：內容、分步動畫的每一步）。一排最多 12 張、一則不超過 YZ_MSG_SAFE；放不下就接下一則
  // 第 29 批：可以選「一頁一頁」（o.lay＝"page"）：每張內容卡片自己一則、往下排（分步動畫照舊一排左右滑）；
  // LINE 一次最多回 5 則：放不下的時候，前面一頁一頁，剩下的全部放在最後一則左右滑
  var out = [], bytes = [], kinds = [];
  var push = function (arr) {
    var el = arr.length > 1 ? { type: "carousel", contents: arr } : arr[0];
    out.push(el); bytes.push(_yzBytes_(el)); kinds.push(arr.length > 1 ? "carousel" : "bubble");
  };
  var pack = function (list) {
    var grp = [];
    list.forEach(function (b) {
      if (grp.length && (grp.length >= YZ_CAROUSEL_MAX || _yzBytes_({ type: "carousel", contents: grp.concat([b]) }) > YZ_MSG_SAFE)) { push(grp); grp = []; }
      grp.push(b);
    });
    if (grp.length) push(grp);
  };
  var page = o.lay === "page", packed = false;
  if (!page) pack(flat);
  else for (var gi = 0; gi < groups.length; gi++) {
    if (out.length >= YZ_REPLY_MAX - 1 && groups.length - gi > 1) { pack([].concat.apply([], groups.slice(gi))); packed = true; break; }
    pack(groups[gi]);
  }
  return { bubbles: out, bytes: bytes, parts: parts, cards: flat.length, kinds: kinds, anim: used.n, lay: page ? "page" : "swipe", packed: packed };
}

// ── 搜尋 ──
// 資料長這樣（hb）：{ chapters:[…], titles:{ 章id:[標題…] }, kws:[關鍵字…]（關鍵字功能已經拿掉，資料留在試算表，不再顯示） }
//   標題 ＝ { id, ch, name, page(藥戰手冊頁數), blocks:[…], note, … }
//   關鍵字 ＝ { id, name, alias:[別名…], pts:[ { v:重點, t:來源標題id, url:外部網址(選填) } ] }
var YZ_WHERE = { name: "標題", text: "內文", ladder: "條文", table: "表格", img: "圖說", ocr: "圖片裡的字", note: "備註", page: "頁數", drug: "藥品", draw: "流程圖", link: "網址連結" };
var YZ_WEIGHT = { name: 50, text: 10, ladder: 10, table: 8, img: 5, ocr: 4, note: 6, drug: 8, draw: 9, link: 7 };

function _yzTokens_(q) { return _yzNorm_(q).replace(/\s+/g, " ").trim().split(" ").filter(function (x) { return x; }); }
// 一小段字裡，哪些地方是搜尋的字：[{t:"文字", h:是不是搜尋的字}]。網頁用 <mark>，LINE 用粗體＋顏色。
// sq＝不管空白（圖片裡的字：辨識出來的「正班 33 分」也算「正班33分」，中間的空白一起標）
function _yzHL_(text, toks, sq) {
  text = String(text === null || text === undefined ? "" : text);
  var ns = _yzNorm_(text), mark = [], i, q = sq ? _yzSq_(ns) : { s: ns, map: null };
  for (i = 0; i < ns.length; i++) mark.push(false);
  (toks || []).forEach(function (tk) {
    if (!tk) return;
    var at = 0, k;
    while ((k = q.s.indexOf(tk, at)) >= 0) {
      var a = q.map ? q.map[k] : k, b = q.map ? q.map[k + tk.length - 1] : k + tk.length - 1;
      for (i = a; i <= b; i++) mark[i] = true;
      at = k + tk.length;
    }
  });
  var out = [], cur = null;
  for (i = 0; i < text.length; i++) {
    if (!cur || cur.h !== mark[i]) { cur = { t: "", h: mark[i] }; out.push(cur); }
    cur.t += text.charAt(i);
  }
  return out;
}
// ── 連結（第 27 批：標題和標題、標題和整章「互相連結」）──
// 一段文字裡，「連結」那幾行連到哪裡（標題或章的代號，照順序、不重複）
function _yzGoIds_(text) {
  var out = [];
  String(text === null || text === undefined ? "" : text).split("\n").forEach(function (ln) { var m = /^[ 　\t]*\[go=([A-Za-z0-9_-]+)\]/.exec(ln); if (m && out.indexOf(m[1]) < 0) out.push(m[1]); });
  return out;
}
// 連結的目標：先找標題、再找章 → { kind:"t"|"c", id, ch, t, label }（找不到＝null：那一行不顯示）。fromCh＝現在這一章（同一章就不寫章名）
function _yzGoTarget_(hb, id, fromCh) {
  if (!hb || !id) return null;
  var f = _yzFindTitle_(hb, id);
  if (f) return { kind: "t", id: id, ch: f.ch, t: f.t, label: (fromCh && f.ch.id === fromCh ? "" : f.ch.name + "　") + (f.t.name || "（還沒有標題）") };
  var c = (hb.chapters || []).filter(function (x) { return x.id === id; })[0];
  return c ? { kind: "c", id: id, ch: c, t: null, label: c.name + "（整章）" } : null;
}
// 誰連到這裡（互相連結）：哪些標題的文字裡，有「連結」連到 ids 其中一個（這個標題、它這一章）→ [{ ch, t }]（照章、標題順序；自己不算）
function _yzBacklinks_(hb, ids, selfTid) {
  var out = [];
  ((hb && hb.chapters) || []).forEach(function (c) {
    (((hb.titles || {})[c.id]) || []).forEach(function (t) {
      if (!t || t.id === selfTid) return;
      var hit = (t.blocks || []).some(function (b) { return b && b.t === "text" && _yzGoIds_(b.v).some(function (g) { return ids.indexOf(g) >= 0; }); });
      if (hit) out.push({ ch: c, t: t });
    });
  });
  return out;
}
function _yzBackLabel_(x, fromCh) { return (fromCh && x.ch.id === fromCh ? "" : x.ch.name + "　") + (x.t.name || "（還沒有標題）"); }
function _yzFindTitle_(hb, tid) {
  var cs = hb.chapters || [];
  for (var i = 0; i < cs.length; i++) {
    var ts = (hb.titles || {})[cs[i].id] || [];
    for (var j = 0; j < ts.length; j++) if (ts[j].id === tid) return { ch: cs[i], t: ts[j] };
  }
  return null;
}
function _yzSrcLabel_(f) {   // 藥品補充　二、藥品請領…　｜藥戰手冊 第 14 頁
  var pg = _yzPageText_(f.t.page);
  return f.ch.name + "　" + f.t.name + (pg ? "｜藥戰手冊 " + pg : "");
}
// 去掉空白：{ s: 沒有空白的字, map: 每個字在原來的第幾個 }（圖片裡的字搜尋用）
function _yzSq_(s) {
  var o = "", map = [];
  for (var i = 0; i < s.length; i++) { var c = s.charAt(i); if (!/\s/.test(c)) { o += c; map.push(i); } }
  return { s: o, map: map };
}
// 圖片裡的字（第 27 批：照片裡的字也搜得到）：一行一行；好幾行的再加「接起來的一整段」（要找的字被拆在兩行也找得到）。
// sq＝比對時不管空白（辨識出來的字常常多空白：「正班 33 分」打「正班33分」也要找得到）
function _yzOcrUnits_(u, pic, i) {
  var ls = String((pic && pic.ocr) || "").split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
  ls.forEach(function (l) { u.push({ k: "ocr", v: l, b: i, sq: 1 }); });
  if (ls.length > 1) u.push({ k: "ocr", v: ls.join(" "), b: i, sq: 1 });
}
// 文字塊裡的圖（第 28 批）：照 [img=代號] 那幾行的順序；圖不見了（pics 裡沒有）的不算
function _yzTextPics_(b) {
  var out = [];
  if (!b || b.t !== "text" || !b.pics || typeof b.pics !== "object") return out;
  _yzImgIds_(b.v).forEach(function (id) { var p = b.pics[id]; if (p && p.url) out.push(p); });
  return out;
}
// 一個標題裡所有「內容裡的圖」（圖片、階梯裡的圖、分步動畫的每一格、文字裡的圖）：圖片裡的字、圖片檢查都用這一份
function _yzTitlePics_(t) {
  var out = [];
  (t && t.blocks || []).forEach(function (b) {
    if (!b) return;
    if (b.t === "img") { if (b.url) out.push(b); }
    else if (b.t === "ladder") (b.items || []).forEach(function (it) { if (it && it.img && it.img.url) out.push(it.img); });
    else if (b.t === "anim" && b.kind === "steps") (b.steps || []).forEach(function (st) { if (st && st.url) out.push(st); });
    else if (b.t === "text") out = out.concat(_yzTextPics_(b));
  });
  return out;
}
// 圖片裡的字辨識了幾張（同一張圖只算一次）：{ n:全部, done:辨識過的, todo:還沒的 }
function _yzOcrStat_(hb) {
  var seen = {}, r = { n: 0, done: 0, todo: 0 };
  ((hb && hb.chapters) || []).forEach(function (c) {
    (((hb.titles || {})[c.id]) || []).forEach(function (t) {
      _yzTitlePics_(t).forEach(function (p) {
        var k = p.fid || p.url;
        if (!k || seen[k]) return;
        seen[k] = 1; r.n++;
        if (typeof p.ocr === "string") r.done++; else r.todo++;
      });
    });
  });
  return r;
}
// 一個標題裡「找得到的字」攤平成一行一行（標題、每行文字、階梯每條、表格每列、圖說、圖片裡的字、備註）
function _yzTableUnits_(u, tb, i) {   // 表格：一列一段（第 29 批：合併儲存格被蓋住的格子不算）
  var G = _yzTblMg_(tb);
  (tb && tb.rows || []).forEach(function (row, ri) {
    var s = (row || []).map(function (c, ci) {
      if (G) { var p = G.ps[G.at[ri][ci]]; if (p && (p.r !== ri || p.c !== ci)) return ""; }
      return String(c === null || c === undefined ? "" : c).trim();
    }).filter(Boolean).join(" ｜ ");
    if (s) u.push({ k: "table", v: s, b: i, h: ri === 0 && tb.head !== false });   // h＝這一列是表頭
  });
}
function _yzUnits_(t, ch) {   // ch（第 41 批）："line"／"web"：藏起來的那幾塊不算（沒給＝全部都算）
  var u = [{ k: "name", v: String(t.name || ""), b: -1 }];
  (t.blocks || []).forEach(function (b, i) {
    if (!b || _yzOnlyHide_(b, ch)) return;
    if (b.t === "text") {
      _yzRtPlainLines_(b.v).forEach(function (ln) { u.push({ k: "text", v: ln, b: i }); });
      _yzTextPics_(b).forEach(function (p) { if (String(p.cap || "").trim()) u.push({ k: "img", v: String(p.cap).trim(), b: i }); _yzOcrUnits_(u, p, i); });   // 文字裡的圖：圖說、圖片裡的字
      if (b.tbls && typeof b.tbls === "object") _yzTblIds_(b.v).forEach(function (id) { if (b.tbls[id]) _yzTableUnits_(u, b.tbls[id], i); });   // 第 29 批：文字裡的表格
    }
    else if (b.t === "ladder") { var r = _yzLadderRows_(b); r.items.forEach(function (it, j) { if (_yzLadderIsImg_(it)) { if (String(it.img.cap || "").trim()) u.push({ k: "img", v: String(it.img.cap).trim(), b: i }); _yzOcrUnits_(u, it.img, i); return; } u.push({ k: "ladder", v: (r.marks[j] ? r.marks[j] + " " : "") + String(it.v).replace(/\n/g, " "), b: i }); }); }
    else if (b.t === "table") _yzTableUnits_(u, b, i);
    else if (b.t === "img") {
      if (b.cap) u.push({ k: "img", v: String(b.cap), b: i });
      if (b.draw) (b.draw.s || []).forEach(function (sh) { if (sh) _yzRtPlainLines_(sh.v).forEach(function (ln) { u.push({ k: "draw", v: ln, b: i }); }); });   // 第 40 批：流程圖裡的字（每個框一行一行）
      else _yzOcrUnits_(u, b, i);
    }
    else if (b.t === "drug") (b.items || []).forEach(function (d) { var s = [d && d.code, d && d.brand, d && d.chName].filter(Boolean).join(" "); if (s) u.push({ k: "drug", v: s, b: i }); });   // 第 29 批：藥品卡片（CODE、商品名、中文名）
    else if (b.t === "link") _yzLinkItems_(b).forEach(function (x) { var n = String(x.n || "").trim(); u.push({ k: "link", v: _yzLinkLabel_(x) + "　" + _yzLinkHost_(_yzLinkFix_(x.u)) + (n ? "　" + n : ""), b: i }); });   // 第 40 批（一起做的）：網址連結（名稱、網站、說明）
    else if (b.t === "anim") {
      if (b.kind === "steps") (b.steps || []).forEach(function (st) { if (st && String(st.cap || "").trim()) u.push({ k: "img", v: String(st.cap).trim(), b: i }); _yzOcrUnits_(u, st, i); });
      else if (b.cap) u.push({ k: "img", v: String(b.cap), b: i });
    }
  });
  String(t.note || "").split("\n").forEach(function (ln) { if (ln.trim()) u.push({ k: "note", v: ln.trim(), b: -2 }); });
  return u;
}
function _yzSearchTitle_(t, toks, ch) {
  var us = _yzUnits_(t, ch), ns = us.map(function (u) { var n = _yzNorm_(u.v); return u.sq ? _yzSq_(n) : { s: n, map: null }; }), score = 0, ok = true, i;
  toks.forEach(function (tk) {
    var found = false;
    for (i = 0; i < us.length; i++) if (ns[i].s.indexOf(tk) >= 0) { score += found ? 1 : (YZ_WEIGHT[us[i].k] || 5); found = true; }
    if (!found) ok = false;
  });
  if (!ok) return null;
  var best = 0, bs = -1;   // 摘錄的那一句：含最多要找的字、而且最重要的
  for (i = 0; i < us.length; i++) {
    var n = 0; toks.forEach(function (tk) { if (ns[i].s.indexOf(tk) >= 0) n++; });
    if (!n) continue;
    var sc = n * 100 + (YZ_WEIGHT[us[i].k] || 5);
    if (sc > bs) { bs = sc; best = i; }
  }
  var u0 = us[best], v = u0.v, at = 0;
  if (u0.k === "name" && us.length > 1) { v = us[1].v; u0 = { k: "name" }; } else {
    var nb = ns[best]; at = nb.s.length; toks.forEach(function (tk) { var k = nb.s.indexOf(tk); if (k >= 0 && k < at) at = k; });
    if (nb.map) at = at < nb.map.length ? nb.map[at] : v.length;   // 不管空白比對的：換回原來的位置
  }
  var from = Math.max(0, at - 14), to = Math.min(v.length, from + 46);
  var snip = (from > 0 ? "…" : "") + v.slice(from, to) + (to < v.length ? "…" : "");
  return { score: score, where: u0.k, snip: snip, segs: _yzHL_(snip, toks, !!u0.sq) };
}
function _yzSearch_(hb, q, ch) {   // ch（第 41 批）："line"／"web"：只找那邊看得到的（只在 LINE、只在網頁的那幾塊）
  var toks = _yzTokens_(q), pg = _yzPageQuery_(q), res = { q: String(q), toks: toks, page: pg, kws: [], hits: [] };
  if (!toks.length) return res;
  _yzLadderNumberAll_(hb);   // 條文的編號（接續上一段的）先算好：找「第七條」才找得到
  (hb.chapters || []).forEach(function (c) {
    ((hb.titles || {})[c.id] || []).forEach(function (t) {
      var hit = null;
      if (pg) { if (_yzPageHas_(t.page, pg)) { var tx = "藥戰手冊 " + _yzPageText_(t.page); hit = { score: 100, where: "page", snip: tx, segs: [{ t: tx, h: false }] }; } }
      else hit = _yzSearchTitle_(t, toks, ch);
      if (hit) { hit.ch = c; hit.t = t; hit.ord = res.hits.length; res.hits.push(hit); }
    });
  });
  res.hits.sort(function (a, b) { return b.score - a.score || a.ord - b.ord; });
  return res;
}

function _yzSpans_(segs, o) {
  o = o || {};
  var t = { type: "text", size: o.size || "xs", wrap: true, color: o.color || "#5F6B7A", contents: segs.map(function (g) {
    var sp = { type: "span", text: g.t };
    if (g.h) { sp.weight = "bold"; sp.color = YZ_ACCENT; }
    return sp;
  }) };
  if (o.maxLines) t.maxLines = o.maxLines;
  return t;
}
// 搜尋結果卡
function _yzSearchBubble_(q, hits, more, o) {
  o = o || {};
  var rows = [];
  hits.forEach(function (h, i) {
    if (i > 0) rows.push({ type: "separator", color: "#E3E7EC" });
    var pg = _yzPageText_(h.t.page), label = (YZ_WHERE[h.where] && h.where !== "page" ? YZ_WHERE[h.where] : "");
    var meta = [label ? label + "有符合" : "", pg ? "📖 藥戰手冊 " + pg : ""].filter(Boolean).join("　");
    var c = [
      { type: "text", text: h.ch.name, size: "xxs", color: YZ_ACCENT, weight: "bold", wrap: true },
      { type: "text", text: h.t.name, size: "sm", weight: "bold", wrap: true, color: "#1F1F1F" }
    ];
    if (meta) c.push({ type: "text", text: meta, size: "xxs", color: "#8A6D00", wrap: true });
    if (h.segs && h.where !== "page") c.push(_yzSpans_(h.segs, { size: "xs", color: "#5F6B7A", maxLines: 2 }));
    rows.push({ type: "box", layout: "vertical", paddingAll: "9px", spacing: "xs", action: _yzPB_("yz=t&t=" + h.t.id, "打開"), contents: c });
  });
  if (more > 0) rows.push({ type: "text", text: "還有 " + more + " 筆，請把要找的字打得更精確。", size: "xs", color: "#7B8696", margin: "md", wrap: true });
  return {
    type: "bubble", size: "mega",
    header: _yzHead_("📘 藥戰手冊　搜尋", o.page ? "藥戰手冊 第 " + o.page + " 頁" : "「" + q + "」", (hits.length + more) + " 筆" + (o.page ? "" : "（符合的字會用顏色標出來）")),
    body: { type: "box", layout: "vertical", paddingAll: "4px", contents: rows },
    footer: { type: "box", layout: "vertical", paddingAll: "8px", contents: [
      { type: "button", style: "link", height: "sm", color: YZ_ACCENT, action: _yzPB_("yz=home", "🏠 回首頁") },
      _yzFoot_()
    ] }
  };
}
// ── 提示用的小卡片（進入、退出、不查藥…） ──
function _yzNoticeBubble_(title, lines, kind) {
  var head = kind === "warn" ? { bg: "#8A5A00" } : { bg: YZ_ACCENT };
  return {
    type: "bubble", size: "mega",
    header: { type: "box", layout: "vertical", paddingAll: "12px", backgroundColor: head.bg, contents: [{ type: "text", text: title, size: "md", weight: "bold", color: "#FFFFFF", wrap: true }] },
    body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "13px", contents: lines.map(function (l) { return { type: "text", text: l, size: "sm", wrap: true, color: "#1F1F1F" }; }) }
  };
}

// ── 申請的說明（給要加入的同事）：說明＋一顆打開申請網頁的按鈕（url 空的＝不放按鈕）──
function _yzJoinBubble_(lines, url, label) {
  var b = {
    type: "bubble", size: "mega",
    header: _yzHead_("📘 藥戰手冊", "申請看藥戰手冊", "員工編號＋姓名（對得上員工名單的馬上可以看）"),
    body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "13px", contents: lines.map(function (l) { return { type: "text", text: l, size: "sm", wrap: true, color: "#1F1F1F" }; }) }
  };
  if (url) b.footer = { type: "box", layout: "vertical", paddingAll: "10px", contents: [{ type: "button", style: "primary", color: YZ_ACCENT, height: "sm", action: { type: "uri", label: label || "📝 填申請", uri: url } }] };
  return b;
}

// ── 申請審核卡（給開發者）。第 34 批：多一塊「員工名單比對」（為什麼沒有自動核可）──
function _yzApprovalBubble_(rq) {
  var row = function (k, v) { return { type: "box", layout: "baseline", spacing: "sm", contents: [{ type: "text", text: k, size: "xs", color: "#7B8696", flex: 2 }, { type: "text", text: v, size: "sm", color: "#1F1F1F", flex: 5, wrap: true, weight: "bold" }] }; };
  var c = [row("姓名", rq.name), row("員工編號", rq.emp), row("申請時間", rq.at)];
  if (rq.why) c.push({ type: "box", layout: "vertical", spacing: "xs", backgroundColor: "#FFF4E5", cornerRadius: "8px", paddingAll: "8px", margin: "md", contents: [{ type: "text", text: "員工名單比對", size: "xxs", weight: "bold", color: "#8A5A00" }, { type: "text", text: String(rq.why).substring(0, 300), size: "sm", wrap: true, color: "#5C3D00" }] });
  return {
    type: "bubble", size: "mega",
    header: _yzHead_("📘 藥戰手冊", "新的使用申請", "請確認是院內同事再核可"),
    body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "13px", contents: c },
    footer: { type: "box", layout: "horizontal", spacing: "sm", paddingAll: "10px", contents: [
      { type: "button", style: "primary", color: YZ_ACCENT, height: "sm", flex: 1, action: _yzPB_("yz=ok&u=" + rq.id, "✅ 核可") },
      { type: "button", style: "secondary", height: "sm", flex: 1, action: _yzPB_("yz=no&u=" + rq.id, "✖ 拒絕") }
    ] }
  };
}

// ── 改前／改後確認卡（LINE 裡修改文字時）──
function _yzDiffBubble_(what, before, after) {
  var q = function (label, text, bg, fg) { return { type: "box", layout: "vertical", spacing: "xs", backgroundColor: bg, cornerRadius: "8px", paddingAll: "8px", contents: [{ type: "text", text: label, size: "xxs", weight: "bold", color: fg }, { type: "text", text: text || "（空白）", size: "sm", wrap: true, color: "#1F1F1F" }] }; };
  return {
    type: "bubble", size: "mega",
    header: _yzHead_("📘 藥戰手冊　修改", what, "確認沒問題再按「儲存」"),
    body: { type: "box", layout: "vertical", spacing: "md", paddingAll: "13px", contents: [q("改前", before, "#F3F4F6", "#6B7280"), q("改後", after, "#E3F4F2", YZ_ACCENT)] },
    footer: { type: "box", layout: "horizontal", spacing: "sm", paddingAll: "10px", contents: [
      { type: "button", style: "primary", color: YZ_ACCENT, height: "sm", flex: 1, action: _yzPB_("yz=sv", "✅ 儲存") },
      { type: "button", style: "secondary", height: "sm", flex: 1, action: _yzPB_("yz=cx", "取消") }
    ] }
  };
}

// ── 輸入框上面那排「釘住的按鈕」（第 34 批：藥戰手冊自己的帳號）──
function _yzQuickBar_(mode, o) {
  o = o || {};
  var m = function (label, text) { return { label: label, text: text }; };
  if (!o.approved && !o.dev) return [m("📝 申請", "手冊申請")];
  var a = [m("🏠 首頁", "首頁")];
  if (o.qz) a.push(m("📋 問卷", "問卷"));
  a.push({ label: "🌐 網頁", web: "yz" });
  if (o.buyao) a.push({ label: "💊 補藥神器", uri: o.buyao });
  if (o.dev) a.push(m("🔧 開發者", "藥戰開發者"));
  return a;
}

/* ════════ qzcards.js ════════ */
// ── 第 32 批：問卷、考試的 LINE 卡片（LINE 專案的 05 用；網頁編輯器的「LINE 預覽」也用同一份）──
// 題型、選項代號（YZ_QZ_T、YZ_QZ_LET）：LINE 專案在「問卷＋考試」那一段；網頁編輯器在 quiz.js（前端）自己有一份。
function _yzQzCut_(s, n) {
  s = String(s || "");
  return s.length > n ? s.substring(0, n - 1) + "…" : s;
}

// 清單：開放中的問卷、考試＋我的狀態
function _yzQzListBubble_(list) {
  const body = [];
  list.slice(0, 8).forEach(function(x, i) {
    const exam = x.kind === "x", me = x.mine;
    const sub = (exam ? "考試・" + x.n + " 題・" + x.pass + " 分及格" : "問卷・" + x.n + " 題" + (x.named ? "" : "・不記名")) + (x.to ? "・到 " + x.to.substring(5) : "");
    const stx = me ? exam ? "最高 " + me.best + " 分（考了 " + me.times + " 次）" + (me.pass ? "　✅ 及格" : "") : "✅ 已經填過了，謝謝" : exam ? "還沒考" : "還沒填";
    const can = exam ? !me || x.retake : !me;
    if (i) body.push({ type: "separator", margin: "md" });
    const box = { type: "box", layout: "vertical", spacing: "xs", margin: i ? "md" : "none", contents: [
      { type: "text", text: (exam ? "📝 " : "📋 ") + x.title, size: "md", weight: "bold", wrap: true, color: "#1F1F1F" },
      { type: "text", text: sub, size: "xs", color: "#7B8696", wrap: true },
      { type: "text", text: stx, size: "xs", color: me ? YZ_ACCENT : "#8A5A00", wrap: true }
    ] };
    if (x.note) box.contents.splice(1, 0, { type: "text", text: _yzQzCut_(x.note, 80), size: "xs", color: "#4A5565", wrap: true });
    if (can) box.contents.push({ type: "button", style: me ? "secondary" : "primary", color: me ? undefined : YZ_ACCENT, height: "sm", margin: "sm", action: _yzPB_("yz=qs&q=" + x.id, exam ? me ? "再考一次" : "開始考試" : "開始填寫") });
    if (!box.contents[box.contents.length - 1].color && box.contents[box.contents.length - 1].type === "button") delete box.contents[box.contents.length - 1].color;
    body.push(box);
  });
  if (!body.length) body.push({ type: "text", text: "目前沒有開放的問卷。", size: "sm", color: "#4A5565", wrap: true });
  return { type: "bubble", size: "mega", header: _yzHead_("📘 藥戰手冊", "📋 問卷", list.length ? "點一份開始：一題一張卡片，按按鈕回答" : ""), body: { type: "box", layout: "vertical", paddingAll: "13px", contents: body.concat([ _yzFoot_() ]) } };
}

// 一題的卡片（qz＝作答中的狀態）
function _yzQzOptLine_(q, k, on) {
  return { type: "text", text: (q.t === "many" ? on ? "☑ " : "☐ " : on ? "● " : "") + (q.t === "tf" ? q.opts[k] : YZ_QZ_LET.charAt(k) + ". " + q.opts[k]), size: "sm", wrap: true, color: on ? YZ_ACCENT : "#1F1F1F", weight: on ? "bold" : "regular" };
}

function _yzQzCard_(qz, note) {
  const n = qz.qs.length, i = qz.i;
  if (i >= n) return _yzQzSumCard_(qz, note);
  const q = qz.qs[i], a = qz.a[i], exam = qz.z.kind === "x", tag = "&i=" + i;
  const body = [ { type: "text", text: "第 " + (i + 1) + "／" + n + " 題" + (exam ? "" : q.req ? "（必填）" : "（可以跳過）") + "　" + YZ_QZ_T[q.t] + (q.t === "many" ? "：可以選好幾個" : ""), size: "xs", color: "#7B8696", wrap: true } ];
  if (note) body.push({ type: "text", text: note, size: "xs", color: "#B3261E", wrap: true, weight: "bold" });
  body.push({ type: "text", text: q.q, size: "md", weight: "bold", wrap: true, color: "#1F1F1F", margin: "sm" });
  const btns = [];
  if (q.t === "one" || q.t === "many" || q.t === "tf") {
    const ob = { type: "box", layout: "vertical", spacing: "xs", margin: "md", contents: [] };
    q.opts.forEach(function(o, k) {
      const on = q.t === "many" ? (a || []).indexOf(k) >= 0 : a === k;
      ob.contents.push(_yzQzOptLine_(q, k, on));
      const lab = q.t === "tf" ? o : (q.t === "many" ? on ? "☑ " : "☐ " : "") + YZ_QZ_LET.charAt(k) + "　" + _yzQzCut_(o, 14);
      btns.push({ type: "button", style: on ? "primary" : "secondary", height: "sm", action: _yzPB_((q.t === "many" ? "yz=qm" : "yz=qa") + "&v=" + k + tag, lab) });
      if (on) btns[btns.length - 1].color = YZ_ACCENT;
    });
    body.push(ob);
    if (q.t === "many") btns.push({ type: "button", style: "link", height: "sm", color: YZ_ACCENT, action: _yzPB_("yz=qn" + tag, "選好了，下一題 ›") });
  }
  if (q.t === "rate") {
    body.push({ type: "text", text: "1 分最低、5 分最高" + (a ? "　你選了 " + a + " 分" : ""), size: "xs", color: "#4A5565", wrap: true, margin: "md" });
    const row = { type: "box", layout: "horizontal", spacing: "xs", contents: [] };
    [ 1, 2, 3, 4, 5 ].forEach(function(v) {
      const b = { type: "button", style: a === v ? "primary" : "secondary", height: "sm", flex: 1, action: _yzPB_("yz=qa&v=" + v + tag, String(v)) };
      if (a === v) b.color = YZ_ACCENT;
      row.contents.push(b);
    });
    btns.push(row);
  }
  if (q.t === "text") {
    body.push({ type: "text", text: "✏️ 請直接在下面打字回答，送出就好。", size: "sm", color: "#8A5A00", wrap: true, margin: "md" });
    if (a) body.push({ type: "text", text: "你寫的：" + _yzQzCut_(a, 200), size: "sm", color: YZ_ACCENT, wrap: true });
  }
  if (!exam && !q.req && q.t !== "many") btns.push({ type: "button", style: "link", height: "sm", color: "#4A5565", action: _yzPB_("yz=qk" + tag, a === null || a === undefined || a === "" ? "跳過 ›" : "下一題 ›") });
  const nav = { type: "box", layout: "horizontal", spacing: "sm", margin: "sm", contents: [] };
  if (i > 0) nav.contents.push({ type: "button", style: "link", height: "sm", flex: 1, color: "#4A5565", action: _yzPB_("yz=qg&v=" + (i - 1) + tag, "‹ 上一題") });
  nav.contents.push({ type: "button", style: "link", height: "sm", flex: 1, color: "#B3261E", action: _yzPB_("yz=qx", exam ? "✖ 先不考了" : "✖ 先不填了") });
  btns.push(nav);
  return { type: "bubble", size: "mega", header: _yzHead_("📘 藥戰手冊　" + (exam ? "📝 考試" : "📋 問卷"), _yzQzCut_(qz.z.title, 40), ""), body: { type: "box", layout: "vertical", paddingAll: "13px", contents: body }, footer: { type: "box", layout: "vertical", spacing: "xs", paddingAll: "10px", contents: btns } };
}

function _yzQzShort_(q, a) {   // 一題的答案（短）
  if (a === null || a === undefined || a === "" || Array.isArray(a) && !a.length) return "（沒有回答）";
  if (q.t === "text") return _yzQzCut_(a, 30);
  if (q.t === "rate") return a + " 分";
  if (q.t === "tf") return q.opts[a] || "";
  if (q.t === "many") return a.map(function(k) {
    return YZ_QZ_LET.charAt(k);
  }).join("、");
  return YZ_QZ_LET.charAt(a) + ". " + _yzQzCut_(q.opts[a], 20);
}

function _yzQzSumCard_(qz, note) {   // 全部答完：看一下、送出
  const exam = qz.z.kind === "x", body = [];
  if (note) body.push({ type: "text", text: note, size: "sm", color: "#B3261E", wrap: true, weight: "bold" });
  const done = qz.a.filter(function(v) {
    return !(v === null || v === undefined || v === "" || Array.isArray(v) && !v.length);
  }).length;
  body.push({ type: "text", text: "共 " + qz.qs.length + " 題，答了 " + done + " 題。" + (exam ? "沒答的算錯。" : ""), size: "sm", wrap: true, color: "#1F1F1F" });
  qz.qs.slice(0, 20).forEach(function(q, k) {
    body.push({ type: "box", layout: "baseline", spacing: "sm", contents: [ { type: "text", text: k + 1 + ".", size: "xs", color: "#7B8696", flex: 0 }, { type: "text", text: _yzQzShort_(q, qz.a[k]), size: "xs", color: "#1F1F1F", wrap: true, flex: 5 } ] });
  });
  body.push({ type: "text", text: "要改哪一題：往上找那一題的卡片，直接按新的答案。", size: "xxs", color: "#7B8696", wrap: true, margin: "md" });
  return { type: "bubble", size: "mega", header: _yzHead_("📘 藥戰手冊　" + (exam ? "📝 考試" : "📋 問卷"), _yzQzCut_(qz.z.title, 40), "全部答完了"), body: { type: "box", layout: "vertical", spacing: "xs", paddingAll: "13px", contents: body }, footer: { type: "box", layout: "vertical", spacing: "xs", paddingAll: "10px", contents: [
    { type: "button", style: "primary", color: YZ_ACCENT, height: "sm", action: _yzPB_("yz=qd", exam ? "✅ 交卷" : "✅ 送出") },
    { type: "box", layout: "horizontal", spacing: "sm", contents: [ { type: "button", style: "link", height: "sm", flex: 1, color: "#4A5565", action: _yzPB_("yz=qg&v=0", "‹ 從第 1 題看") }, { type: "button", style: "link", height: "sm", flex: 1, color: "#B3261E", action: _yzPB_("yz=qx", exam ? "✖ 先不考了" : "✖ 先不填了") } ] }
  ] } };
}

// 考試的結果：分數一張＋每一題（對錯、你的答案、正確答案、詳解）幾題一張
function _yzQzResultBubbles_(r, z) {
  const pass = !!r.pass, col = pass ? YZ_ACCENT : "#B3261E";
  const sum = { type: "bubble", size: "mega", header: _yzHead_("📘 藥戰手冊　📝 考試", _yzQzCut_(r.title, 40), "考完了"), body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "13px", contents: [
    { type: "text", text: r.score + " 分", size: "3xl", weight: "bold", color: col, align: "center" },
    { type: "text", text: pass ? "✅ 及格（" + r.need + " 分及格）" : "還沒及格（" + r.need + " 分及格）", size: "sm", weight: "bold", color: col, align: "center", wrap: true },
    { type: "text", text: "答對 " + r.right + "／" + r.n + " 題　第 " + r.times + " 次", size: "sm", color: "#4A5565", align: "center" },
    { type: "text", text: "往右滑看每一題的答案和詳解 ›", size: "xs", color: "#7B8696", align: "center", margin: "md" },
    _yzFoot_()
  ] } };
  const foot = [];
  if (r.retake) foot.push({ type: "button", style: "secondary", height: "sm", flex: 1, action: _yzPB_("yz=qs&q=" + z.id, "再考一次") });
  foot.push({ type: "button", style: "secondary", height: "sm", flex: 1, action: _yzPB_("yz=qz", "📋 其他問卷") });
  sum.footer = { type: "box", layout: "horizontal", spacing: "sm", paddingAll: "10px", contents: foot };
  const ans = function(q, a) {
    if (!a || !a.length) return "（沒有回答）";
    return a.map(function(k) {
      return q.t === "tf" ? q.opts[k] : YZ_QZ_LET.charAt(k) + ". " + _yzQzCut_(q.opts[k], 40);
    }).join("\n");
  };
  const cards = [], per = 3;
  for (let s = 0; s < r.review.length; s += per) {
    const c = [];
    r.review.slice(s, s + per).forEach(function(x, k) {
      const no = s + k + 1;
      if (k) c.push({ type: "separator", margin: "md" });
      c.push({ type: "text", text: "第 " + no + " 題　" + (x.ok ? "✅ 答對" : "❌ 答錯"), size: "sm", weight: "bold", color: x.ok ? YZ_ACCENT : "#B3261E", margin: k ? "md" : "none" });
      c.push({ type: "text", text: _yzQzCut_(x.q, 300), size: "sm", wrap: true, color: "#1F1F1F" });
      c.push({ type: "text", text: "你的答案：" + ans(x, x.mine), size: "xs", wrap: true, color: x.ok ? YZ_ACCENT : "#B3261E" });
      if (!x.ok) c.push({ type: "text", text: "正確答案：" + ans(x, x.ans), size: "xs", wrap: true, color: YZ_ACCENT, weight: "bold" });
      if (x.ex) c.push({ type: "text", text: "詳解：" + _yzQzCut_(x.ex, 400), size: "xs", wrap: true, color: "#4A5565" });
    });
    cards.push({ type: "bubble", size: "mega", body: { type: "box", layout: "vertical", spacing: "xs", paddingAll: "13px", contents: c } });
  }
  // 一則最多 12 張、50 KB：照大小分好幾則（第一則是分數那一張）
  const msgs = [], take = [ sum ].concat(cards);
  let cur = [];
  take.forEach(function(b) {
    const size = _yzBytes_({ type: "carousel", contents: cur.concat([ b ]) });   // 算 bytes（中文一個字 3 bytes）
    if (cur.length && (cur.length >= 12 || size > 42e3)) {
      msgs.push(cur);
      cur = [];
    }
    cur.push(b);
  });
  if (cur.length) msgs.push(cur);
  return msgs.slice(0, 5).map(function(g) {
    return g.length === 1 ? g[0] : { type: "carousel", contents: g };
  });
}

// 開發者按「📣 LINE 通知大家」推出去的那一張（z＝一份問卷／考試）
function _yzQzPushCard_(z) {
  const exam = z.kind === "x";
  return { type: "bubble", size: "mega", header: _yzHead_("📘 藥戰手冊", (exam ? "📝 新的考試：" : "📋 新的問卷：") + z.title, z.to ? "請在 " + z.to + " 以前完成" : ""), body: { type: "box", layout: "vertical", spacing: "sm", paddingAll: "13px", contents: [ { type: "text", text: z.note || (exam ? "共 " + z.x.n + " 題、" + z.x.pass + " 分及格。" : "共 " + z.qs.length + " 題，幾分鐘就好。"), size: "sm", wrap: true, color: "#1F1F1F" }, _yzFoot_() ] }, footer: { type: "box", layout: "vertical", paddingAll: "10px", contents: [ { type: "button", style: "primary", color: YZ_ACCENT, height: "sm", action: _yzPB_("yz=qs&q=" + z.id, exam ? "開始考試" : "開始填寫") } ] } };
}

/* ════════ flex.js ════════ */
/* flex.js — 把 LINE 的 Flex Message JSON 畫成網頁（只給預覽用；字級、間距、卡片寬度是照 LINE 畫面抓的近似值）。
 * 只實作這份預覽用得到的欄位：bubble／carousel、box、text（含 span）、image、button、separator、spacer。 */
var FlexView = (function () {
  var TS = { xxs: 11, xs: 13, sm: 14, md: 16, lg: 19, xl: 22, xxl: 29, "3xl": 35, "4xl": 40, "5xl": 46 };
  var SP = { none: 0, xs: 2, sm: 4, md: 8, lg: 12, xl: 16, xxl: 20 };
  var BW = { nano: 120, micro: 160, deca: 200, hecto: 230, kilo: 260, mega: 300, giga: 340 };   // 近似值，實機才準（待實機確認）
  var IW = { xxs: 40, xs: 60, sm: 80, md: 100, lg: 120, xl: 160, xxl: 200, "3xl": 240, "4xl": 280, "5xl": 320 };
  var BH = { sm: 40, md: 52 };
  var JC = { "flex-start": "flex-start", center: "center", "flex-end": "flex-end", "space-between": "space-between", "space-around": "space-around", "space-evenly": "space-evenly" };

  function num(v, map, def) {
    if (v === undefined || v === null || v === "") return def;
    if (typeof v === "number") return v;
    if (map && map[v] !== undefined) return map[v];
    var m = /^(-?[\d.]+)px$/.exec(String(v));
    return m ? parseFloat(m[1]) : def;
  }
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }

  // 位置偏移（offsetTop／Start／End／Bottom）：像素、關鍵字（xs…xxl）、百分比三種寫法（LINE 官方規格）。百分比＝佔「上一層方塊」寬（Start、End）或高（Top、Bottom）的幾成。
  function offs(v) {
    if (v === undefined || v === null || v === "") return null;
    if (typeof v === "string" && /^-?[\d.]+%$/.test(v)) return v;
    if (typeof v === "string" && v === "none") return "0px";
    var p = num(v, SP, null);
    return p === null ? null : p + "px";
  }
  function common(d, n, parent, idx) {
    var s = d.style;
    var horizP = parent && (parent.layout === "horizontal" || parent.layout === "baseline");
    var m = n.margin !== undefined ? n.margin : (idx > 0 && parent ? parent.spacing : undefined);
    var mv = num(m, SP, null);
    if (mv !== null) { if (horizP) s.marginLeft = mv + "px"; else s.marginTop = mv + "px"; }
    // flex：水平方塊裡預設平分；垂直方塊裡預設照內容高
    if (n.flex !== undefined) { s.flex = n.flex === 0 ? "0 0 auto" : n.flex + " 1 0"; }
    else if (horizP && n.type !== "separator") { s.flex = "1 1 0"; }
    else s.flex = "0 0 auto";
    if (n.width !== undefined) { s.width = typeof n.width === "string" && /%$/.test(n.width) ? n.width : num(n.width, null, 0) + "px"; s.flex = "0 0 auto"; }
    if (n.height !== undefined && n.type !== "button") s.height = typeof n.height === "string" && /%$/.test(n.height) ? n.height : num(n.height, null, 0) + "px";   // 按鈕的 height 是 sm／md，不是像素
    if (n.maxWidth !== undefined) s.maxWidth = num(n.maxWidth, null, 0) + "px";
    if (n.backgroundColor) s.background = n.backgroundColor;
    if (n.cornerRadius !== undefined) s.borderRadius = num(n.cornerRadius, { none: 0, xs: 2, sm: 4, md: 8, lg: 12, xl: 16, xxl: 20 }, 0) + "px";
    if (n.borderWidth !== undefined) {
      s.borderStyle = "solid";
      s.borderWidth = num(n.borderWidth, { none: 0, light: 0.5, normal: 1, medium: 2, "semi-bold": 3, bold: 4 }, 1) + "px";
      s.borderColor = n.borderColor || "#000";
    }
    if (n.align) { if (horizP) { /* 水平方塊裡 align 是主軸位置 */ } else s.alignSelf = n.align === "start" ? "flex-start" : n.align === "end" ? "flex-end" : "center"; }
    if (n.gravity && horizP) s.alignSelf = n.gravity === "top" ? "flex-start" : n.gravity === "bottom" ? "flex-end" : "center";
    if (n.position === "absolute") {   // 絕對位置：不佔位置、不撐大上一層，照偏移量貼在上一層方塊裡（超出的部分 LINE 不顯示）
      s.position = "absolute"; s.margin = "0"; s.flex = "none";
      var o4 = [["offsetTop", "top"], ["offsetBottom", "bottom"], ["offsetStart", "left"], ["offsetEnd", "right"]];
      o4.forEach(function (p) { var v = offs(n[p[0]]); if (v !== null) s[p[1]] = v; });
    }
    if (n.action) { d.classList.add("fx-tap"); d.dataset.act = JSON.stringify(n.action); d.title = describe(n.action); }
  }
  function describe(a) {
    if (!a) return "";
    if (a.type === "postback") return "按下去（postback）：" + a.data;
    if (a.type === "message") return "按下去（送出文字）：" + a.text;
    if (a.type === "uri") return "按下去（開網頁）：" + (a.uri || "").slice(0, 80);
    return a.type;
  }
  function pad(d, n) {
    var s = d.style;
    var all = n.paddingAll !== undefined ? num(n.paddingAll, SP, 0) : null;
    var t = n.paddingTop !== undefined ? num(n.paddingTop, SP, 0) : all;
    var b = n.paddingBottom !== undefined ? num(n.paddingBottom, SP, 0) : all;
    var l = n.paddingStart !== undefined ? num(n.paddingStart, SP, 0) : all;
    var r = n.paddingEnd !== undefined ? num(n.paddingEnd, SP, 0) : all;
    if (t !== null) s.paddingTop = t + "px";
    if (b !== null) s.paddingBottom = b + "px";
    if (l !== null) s.paddingLeft = l + "px";
    if (r !== null) s.paddingRight = r + "px";
  }

  function rBox(n, parent, idx, ctx) {
    var d = el("div", "fx-box");
    var h = n.layout === "horizontal" || n.layout === "baseline";
    d.style.display = "flex"; d.style.flexDirection = h ? "row" : "column";
    if (n.layout === "baseline") d.style.alignItems = "baseline";
    if (n.justifyContent && JC[n.justifyContent]) d.style.justifyContent = JC[n.justifyContent];
    if (n.alignItems) d.style.alignItems = n.alignItems === "center" ? "center" : n.alignItems === "flex-end" ? "flex-end" : "flex-start";
    pad(d, n); common(d, n, parent, idx);
    (n.contents || []).forEach(function (c, i) { var e = rNode(c, n, i, ctx); if (e) d.appendChild(e); });
    return d;
  }
  function rText(n, parent, idx, ctx) {
    var d = el("div", "fx-text");
    var s = d.style;
    s.fontSize = num(n.size, TS, 16) + "px";
    s.fontWeight = n.weight === "bold" ? "700" : "400";
    s.color = n.color || "#111";
    s.lineHeight = n.lineSpacing ? "calc(1em + " + num(n.lineSpacing, SP, 0) + "px)" : "1.35";
    if (n.align) s.textAlign = n.align === "end" ? "right" : n.align === "center" ? "center" : "left";
    if (n.decoration === "underline") s.textDecoration = "underline";
    if (n.decoration === "line-through") s.textDecoration = "line-through";
    if (n.style === "italic") s.fontStyle = "italic";
    if (n.wrap) { s.whiteSpace = "pre-wrap"; } else { s.whiteSpace = "nowrap"; s.overflow = "hidden"; s.textOverflow = "ellipsis"; }
    if (n.maxLines) { s.display = "-webkit-box"; s.webkitLineClamp = String(n.maxLines); s.webkitBoxOrient = "vertical"; s.overflow = "hidden"; s.whiteSpace = "pre-wrap"; }
    if (n.contents && n.contents.length) {
      n.contents.forEach(function (sp) {
        var e = document.createElement("span"); e.textContent = sp.text || "";
        if (sp.size) e.style.fontSize = num(sp.size, TS, 16) + "px";
        if (sp.weight === "bold") e.style.fontWeight = "700";
        if (sp.color) e.style.color = sp.color;
        if (sp.decoration === "underline") e.style.textDecoration = "underline";
        if (sp.decoration === "line-through") e.style.textDecoration = "line-through";
        if (sp.style === "italic") e.style.fontStyle = "italic";
        d.appendChild(e);
      });
    } else d.textContent = /^\s+$/.test(n.text || "") ? "\u00A0" : (n.text || "");   // 只有空白的 text ＝ 空一行（高度照字級算）
    common(d, n, parent, idx);
    return d;
  }
  function rImage(n, parent, idx, ctx) {
    var w = el("div");
    var d = el("img", "fx-img");
    d.src = n.url; d.alt = "";
    if (n.animated) d.setAttribute("data-animated", "1");
    var full = !n.size || n.size === "full";
    if (full) { w.style.width = "100%"; d.style.width = "100%"; }
    else { var px = num(n.size, IW, 100); d.style.width = px + "px"; }
    if (n.aspectRatio) {
      var m = /^(\d+):(\d+)$/.exec(n.aspectRatio);
      if (m) { d.style.aspectRatio = m[1] + " / " + m[2]; }
    }
    d.style.objectFit = n.aspectMode === "cover" ? "cover" : "contain";
    if (n.aspectMode !== "cover" && !n.backgroundColor) d.style.background = "transparent";
    w.appendChild(d);
    if (n.align === "center") w.style.textAlign = "center", d.style.margin = "0 auto";
    common(w, n, parent, idx);
    if (n.backgroundColor) w.style.background = n.backgroundColor;
    return w;
  }
  function rButton(n, parent, idx, ctx) {
    var d = el("div", "fx-btn");
    var st = n.style || "link";
    d.style.height = (BH[n.height || "md"] || 52) + "px";
    d.style.fontSize = (n.height === "sm" ? 14 : 16) + "px";
    d.textContent = n.action && n.action.label || "";
    if (st === "primary") { d.style.background = n.color || "#06C755"; d.style.color = "#fff"; }
    else if (st === "secondary") { d.style.background = "#EAEAEA"; d.style.color = n.color || "#111"; }
    else { d.style.background = "transparent"; d.style.color = n.color || "#42659A"; }
    common(d, n, parent, idx);
    d.style.flexShrink = "1";
    return d;
  }
  function rSep(n, parent, idx) {
    var d = el("div", "fx-sep");
    var horizP = parent && (parent.layout === "horizontal" || parent.layout === "baseline");
    if (n.color) d.style.background = n.color;
    common(d, n, parent, idx);
    d.style.alignSelf = "stretch"; d.style.flex = "0 0 1px";
    if (horizP) { d.style.width = "1px"; d.style.height = "auto"; d.style.marginLeft = "0"; }   // 水平方塊裡的分隔線是直的
    return d;
  }
  function rSpacer(n, parent, idx) {
    var d = el("div"); var px = num(n.size || "md", SP, 8);
    d.style.flex = "0 0 " + px + "px"; d.style.height = px + "px"; return d;
  }
  function rNode(n, parent, idx, ctx) {
    if (!n) return null;
    switch (n.type) {
      case "box": return rBox(n, parent, idx, ctx);
      case "text": return rText(n, parent, idx, ctx);
      case "image": return rImage(n, parent, idx, ctx);
      case "button": return rButton(n, parent, idx, ctx);
      case "separator": return rSep(n, parent, idx);
      case "spacer": return rSpacer(n, parent, idx);
      case "filler": var f = el("div"); f.style.flex = "1 1 0"; return f;
    }
    return null;
  }
  function rBubble(n, ctx) {
    var d = el("div", "fx-bubble");
    d.style.width = (BW[n.size || "kilo"] || 260) + "px";
    d.style.borderRadius = "17px"; d.style.overflow = "hidden"; d.style.background = "#fff";
    d.style.boxShadow = "0 1px 3px rgba(0,0,0,.25)"; d.style.display = "flex"; d.style.flexDirection = "column";
    var st = n.styles || {};
    ["header", "hero", "body", "footer"].forEach(function (k, i, arr) {
      if (!n[k]) return;
      var e = rNode(n[k], null, 0, ctx);
      if (!e) return;
      e.style.flex = k === "body" ? "1 1 auto" : "0 0 auto";
      if (k !== "hero" && n[k].type === "box") {
        var has = n[k].paddingAll !== undefined || n[k].paddingTop !== undefined || n[k].paddingBottom !== undefined || n[k].paddingStart !== undefined || n[k].paddingEnd !== undefined;
        if (!has) e.style.padding = "13px";
      }
      var sk = st[k] || {};
      if (sk.backgroundColor) e.style.background = sk.backgroundColor;
      if (sk.separator && d.children.length) { e.style.borderTop = "1px solid " + (sk.separatorColor || "#E0E0E0"); }
      d.appendChild(e);
    });
    wire(d, ctx);
    return d;
  }
  function wire(root, ctx) {
    if (!ctx || !ctx.onAction) return;
    root.addEventListener("click", function (ev) {
      var t = ev.target; while (t && t !== root) { if (t.dataset && t.dataset.act) { ctx.onAction(JSON.parse(t.dataset.act)); ev.stopPropagation(); return; } t = t.parentNode; }
    });
  }
  function render(json, ctx) {
    if (json.type === "carousel") {
      var c = el("div", "fx-car");
      (json.contents || []).forEach(function (b) { c.appendChild(rBubble(b, ctx)); });
      return c;
    }
    return rBubble(json, ctx);
  }
  return { render: render, bytes: function (o) { return new TextEncoder().encode(JSON.stringify(o)).length; } };
})();

/* ════════ core.js ════════ */
/* ═══════════════ core.js：手冊網頁的骨架（登入、驗證、跟後端講話、閒置登出、浮水印、頁籤）═══════════════
 * 第 34 批：藥戰手冊是自己的 LINE 帳號＋自己的後端（不再跟補藥神器網頁共用鑰匙；這台記住的是 hbk、hbx）。
 * 登入：從 LINE「藥戰手冊」按「🌐 網頁」開（連結上有一次性的通行證），或代號登入（網頁出代號 → 貼到 LINE「藥戰手冊」→ 回 6 位數驗證碼）。
 * 第 36 批：電腦登入＝電腦用的入口連結（管理頁拿）打開 → 員工編號＋姓名（這台記住你：直接進去；這台第一次、無痕視窗：再加 LINE 傳「登入」拿的 6 位數）。
 * 閒置超過設定的分鐘數：自動登出，內容從畫面上拿掉，要再驗證一次。
 * 手冊內容只放在記憶體：不存進瀏覽器、不留在網址列。 */

var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
function esc(s) { return String(s === null || s === undefined ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function kb(n) { return (n / 1000).toFixed(1) + " KB"; }
function h(tag, attrs, kids) {
  var e = document.createElement(tag);
  for (var k in (attrs || {})) {
    var v = attrs[k];
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else if (k === "style") e.style.cssText = v;
    else if (k.slice(0, 2) === "on" && typeof v === "function") e[k] = v;
    else if (k === "value") e.value = v;
    else if (k === "checked") e.checked = !!v;
    else e.setAttribute(k, v === true ? "" : v);
  }
  (kids || []).forEach(function (c) { if (c === null || c === undefined || c === false) return; e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
  return e;
}
function btn(label, fn, cls) { return h("button", { class: "btn " + (cls || "sm"), type: "button", onclick: fn }, [label]); }
function toast(msg) {
  var t = $("#toast"); if (!t) { t = h("div", { id: "toast", class: "toast", role: "status" }); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("on"); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("on"); }, 3200);
}
function lightbox(url) {
  var lb = h("div", { class: "lightbox", role: "dialog", "aria-label": "放大的圖（點一下關掉）", tabindex: "-1", onclick: function () { lb.remove(); } }, [h("img", { src: url, alt: "" })]);
  lb.onkeydown = function (e) { if (e.key === "Escape") lb.remove(); };
  document.body.appendChild(lb); try { lb.focus(); } catch (x) { /* 沒關係 */ }
}
function stamp() { var d = new Date(); function z(n) { return ("0" + n).slice(-2); } return d.getFullYear() + "/" + z(d.getMonth() + 1) + "/" + z(d.getDate()) + " " + z(d.getHours()) + ":" + z(d.getMinutes()); }
// 預覽版用來標「要你確認第幾題」的紅圈：正式版不需要
function mk() { return ""; }
function mkEl() { return null; }

/* ── 手冊資料（只在記憶體）── */
var HB = null, CFG = null, ME = null, IS_DEV = false, MAIN = false, BACKV = "";   // BACKV：後端（藥戰手冊專案）的版本（第 40 批：流程圖要 12.7 以上）
function backAtLeast(maj, min) { var m = /v(\d+)\.(\d+)/.exec(BACKV || ""); return !m || +m[1] > maj || (+m[1] === maj && +m[2] >= min); }   // 後端是這一版以上（看不出來就當作可以）
function bk41Ok() { return backAtLeast(12, 8); }   // 第 41 批（12.8）：只在 LINE／只在網頁、連線樣式、文字框
function bk41Warn(what) {
  modal({ title: "⚠ 還不能用「" + what + "」", lines: ["藥戰手冊專案（Apps Script）的「02_藥戰手冊」還是舊的（第 41 批以前）：存了會不見，LINE 也顯示不出來。", "請先把第 41 批的 02 貼上，「部署 → 管理部署作業 → ✏️ → 版本選新版本 → 部署」，再重新整理這一頁。"], buttons: [{ label: "知道了", cls: "sm pri" }] });
}
function chapterOf(id) { return (HB.chapters || []).filter(function (c) { return c.id === id; })[0] || null; }
function titleOf(id) { for (var k in HB.titles) { var r = HB.titles[k].filter(function (t) { return t.id === id; })[0]; if (r) return r; } return null; }
function titlesOf(cid) { return HB.titles[cid] || []; }
function counts() { var o = {}; HB.chapters.forEach(function (c) { o[c.id] = titlesOf(c.id).length; }); return o; }
function applyCfg() {
  YZ_CFG.imgDirect = CFG.imgDirect !== false; YZ_CFG.animDirect = CFG.animDirect !== false; YZ_CFG.footer = CFG.footer !== false;
  YZ_CFG.webUrl = location.origin + location.pathname;   // 編輯器預覽 LINE 卡片時，按鈕上的網址（只拿來估卡片大小）
  IDLE_MS = Math.max(5, Math.min(240, +CFG.idle || 30)) * 6e4;
}

/* ── 連結：#x=網頁專案部署ID&app=鑰匙（藥師版）／&dev=鑰匙（開發者版）&k=通行證&t=標題（直接打開）&edit=標題（開發者：編輯器打開）── */
(function () {
  var qs = location.search || ""; if (!/[?&](x|app|dev|k)=/.test(qs)) return;
  var p = new URLSearchParams(qs), f = [];
  ["x", "app", "dev", "k", "t", "edit"].forEach(function (k) { if (p.get(k)) f.push(k + "=" + encodeURIComponent(p.get(k))); });
  try { history.replaceState(null, "", location.pathname + "#" + f.join("&")); } catch (e) { /* 換不了就算了 */ }
})();
function hashParams() { var o = {}; String(location.hash || "").replace(/^#/, "").split("&").forEach(function (kv) { var i = kv.indexOf("="); if (i > 0) { try { o[decodeURIComponent(kv.slice(0, i))] = decodeURIComponent(kv.slice(i + 1)); } catch (e) { /* 壞掉的不要 */ } } }); return o; }
var HP = hashParams(), XRE = /^[A-Za-z0-9_-]{20,120}$/, TRE = /^[0-9a-f]{32}$/;
var X = HP.x || "", T = HP.dev || HP.app || "", FROMLINK = !!T, FROMSAVED = false;
var TICKET = /^[0-9a-z]{6,11}\.[0-9a-f]{24}$/.test(HP.k || "") ? HP.k : "";
// 第 34 批：這台記住的鑰匙（hbk）、後端（hbx）：藥戰手冊自己的（補藥神器網頁的 bk、bx 不碰）；裝置碼（bdk）共用（兩邊算出來的不一樣）
function keyLoad() { try { var o = JSON.parse(localStorage.getItem("hbk") || "null"); if (o && XRE.test(String(o.x || "")) && TRE.test(String(o.t || ""))) return o; } catch (e) { /* 沒有 */ } return null; }
function bxLoad() { try { var v = localStorage.getItem("hbx"); if (XRE.test(v || "")) return v; } catch (e) { /* 沒有 */ } return ""; }
function keySave() { if (!XRE.test(X) || !TRE.test(T)) return; try { localStorage.setItem("hbk", JSON.stringify({ x: X, t: T })); localStorage.setItem("hbx", X); } catch (e) { /* 記不住就算了 */ } }
function keyDrop() { try { var o = keyLoad(); if (o && o.x === X && o.t === T) localStorage.removeItem("hbk"); } catch (e) { /* 沒關係 */ } }
function bxDrop() { try { if (localStorage.getItem("hbx") === X) localStorage.removeItem("hbx"); var o = keyLoad(); if (o && o.x === X) localStorage.removeItem("hbk"); } catch (e) { /* 沒關係 */ } }
var CFGX = ""; try { if (typeof window.HB_X === "string" && XRE.test(window.HB_X)) CFGX = window.HB_X; } catch (e) { /* cfg.js 沒放（可以不放） */ }
// 第 38 批：後端位置放在 GitHub 的 cfg.js（HB_XC），是加密過的，沒有鑰匙解不開。
// 第 42 批：外部連結只有「…/hb.html」。這台第一次用：同事在 LINE 按「🔗 複製連結」，拿到「自己的連結」…/hb.html#28 碼（每個人、每次都不一樣）：
//   前 16 碼＝這一條的號碼（後端認得是誰、什麼時候拿的：10 分鐘內第一次登入不用驗證碼），後 12 碼＝cfg.js 的鑰匙遮過（用前 16 碼拿掉遮的）。
//   一打開就把短碼從網址列拿掉（只剩 …/hb.html），解出後端位置就記在這台（存成書籤、重新整理都可以）。
//   以前管理頁給的「…/hb.html#12 碼」固定短連結停用了（用過的這台照常打開）。
// 第 43 批：自己的連結縮短成 12 碼：前 5 碼＝簽章（這個人＋第幾個 2 分鐘；後端認得是誰、10 分鐘內），後 7 碼＝cfg.js 的 7 碼鑰匙（HB_XC7）遮過。
//   12 碼的也可能是以前停用的固定短連結：解得開 HB_XC7 才算自己的連結，解不開＝當成以前的（SCOLD）。28 碼的照舊（HB_XC）。
var PCL_RE = /^([a-z0-9]{28}|[a-z0-9]{12})$/, PCL_A = "abcdefghijklmnopqrstuvwxyz0123456789", LK_RE = /^([a-z0-9]{16}|[a-z0-9]{5})$/;
var HASH0 = String(location.hash || "").replace(/^#/, "");
var SCODE = PCL_RE.test(HASH0) ? HASH0 : "", SCOLD = false, SCERR = "";
function lkOf(code) { return code.length === 12 ? code.slice(0, 5) : code.slice(0, 16); }   // 帶給後端的那一段（連結的號碼）
function lkSave(v) { try { if (v) sessionStorage.setItem("hblk", JSON.stringify({ lk: v, at: Date.now() })); else sessionStorage.removeItem("hblk"); } catch (e) { /* 記不住就算了 */ } }
function lkLoad() { try { var o = JSON.parse(sessionStorage.getItem("hblk") || "null"); if (o && LK_RE.test(String(o.lk || "")) && Date.now() - +o.at < 66e4) return String(o.lk); } catch (e) { /* 沒有 */ } return ""; }
var PCLK = SCODE ? lkOf(SCODE) : lkLoad();   // 這一頁是用 LINE 複製的連結打開的：電腦登入時帶給後端（重新整理還在：記在這個分頁，11 分鐘）
if (SCODE) lkSave(PCLK);
var SAVED = keyLoad();
if (!T && !SCODE && SAVED && (!X || SAVED.x === X) && (!CFGX || SAVED.x === CFGX)) { X = SAVED.x; T = SAVED.t; FROMSAVED = true; }   // 自己的連結：先解出後端位置（scResolve），再看這台記住的
if (!X && !T && !SCODE) X = CFGX || bxLoad();
// 網址列只留「…/hb.html」（鑰匙、通行證、短碼都不留在網址列；分享網址也不會帶出去）
try {
  if (/(^|[#&])(app|dev|k)=/.test(location.hash || "")) history.replaceState(null, "", location.pathname);
  else if (/(^|[#&])x=/.test(location.hash || "")) {   // 第 36 批的入口連結（…#x＝後端位置）：照樣可以用；第 42 批：位置記在這台，網址列只留 …/hb.html
    var RX0 = CFGX || (SAVED ? SAVED.x : bxLoad()), XOK = XRE.test(HP.x || "") && HP.x === X;
    if (XOK && (!RX0 || RX0 === X)) { try { localStorage.setItem("hbx", X); } catch (e) { /* 記不住就算了 */ } history.replaceState(null, "", location.pathname); }
    else history.replaceState(null, "", location.pathname + (XOK ? "#x=" + HP.x : ""));   // 這台原本連的跟這條不一樣：照舊留在網址列（backendCheck 會問用哪一個）
  }
  else if (SCODE || /[?&]openExternalBrowser=/.test(location.search || "")) history.replaceState(null, "", location.pathname);
} catch (e) { /* 沒關係 */ }
// 第 42 批：已經開著 …/hb.html 的分頁，在網址列貼上連結（只有 # 後面不一樣，瀏覽器不會重新載入）→ 自己重新載入，照新的連結開
window.addEventListener("hashchange", function () {
  var v = String(location.hash || "").replace(/^#/, "");
  if (PCL_RE.test(v) || /^[a-z0-9]{12}$/.test(v)) { try { location.reload(); } catch (e) { /* 沒關係 */ } }
});

var DK = (function () {
  var k = ""; try { k = localStorage.getItem("bdk") || ""; } catch (e) { k = ""; }
  if (TRE.test(k)) return k;
  try { var a = new Uint8Array(16); crypto.getRandomValues(a); k = Array.prototype.map.call(a, function (x) { return ("0" + x.toString(16)).slice(-2); }).join(""); localStorage.setItem("bdk", k); if (localStorage.getItem("bdk") !== k) k = ""; } catch (e) { k = ""; }
  return k;
})();
var DKX = "", API = "", SESS = 0;
var DEVLAB = devLabel();   // 第 34 批追加：這台是什麼（每次都跟後端說：開發者網頁「🔒 我的裝置」顯示用）
function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (x) { return ("0" + x.toString(16)).slice(-2); }).join(""); }

/* ── 第 38 批：短連結的加密（PBKDF2＋AES-GCM，瀏覽器內建的 Web Crypto）：cfg.js 的 HB_XC＝"1." ＋ 鹽 16 bytes ＋ iv 12 bytes ＋ 密文（base64url）── */
var SC_ITER = 150000;
function b64uDec(v) { v = String(v).replace(/-/g, "+").replace(/_/g, "/"); while (v.length % 4) v += "="; var b = atob(v), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
function b64uEnc(a) { var v = ""; for (var i = 0; i < a.length; i++) v += String.fromCharCode(a[i]); return btoa(v).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function scKey(code, salt) {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(code), { name: "PBKDF2" }, false, ["deriveKey"]).then(function (km) {
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt: salt, iterations: SC_ITER, hash: "SHA-256" }, km, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  });
}
function scOpen(code, blob) {   // HB_XC → 後端位置（短碼不對、cfg.js 不對：reject）
  var m = /^1\.([A-Za-z0-9_-]{40,600})$/.exec(String(blob || "")); if (!m) return Promise.reject(new Error("cfg.js 的格式不對"));
  var raw = b64uDec(m[1]); if (raw.length < 16 + 12 + 17) return Promise.reject(new Error("cfg.js 的格式不對"));
  return scKey(code, raw.slice(0, 16)).then(function (k) { return crypto.subtle.decrypt({ name: "AES-GCM", iv: raw.slice(16, 28) }, k, raw.slice(28)); }).then(function (pt) { return new TextDecoder().decode(pt); });
}
function scSeal(code, x) {   // 後端位置 → HB_XC（管理頁「⑥」做 cfg.js 用；每次的鹽、iv 都不一樣）
  var salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  return scKey(code, salt).then(function (k) { return crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, k, new TextEncoder().encode(x)); }).then(function (ct) {
    var c = new Uint8Array(ct), raw = new Uint8Array(28 + c.length); raw.set(salt, 0); raw.set(iv, 16); raw.set(c, 28); return "1." + b64uEnc(raw);
  });
}
function pclKey(code) {   // 第 42 批：自己的連結（28 碼）→ cfg.js 的鑰匙（12 碼）：前 16 碼算 SHA-256，後 12 碼每一碼往回挪
  var r = code.slice(0, 16), m = code.slice(16);
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode("hbk1|" + r)).then(function (b) {
    var u = new Uint8Array(b), k = "";
    for (var i = 0; i < 12; i++) k += PCL_A.charAt((PCL_A.indexOf(m.charAt(i)) - u[i] % 36 + 36) % 36);
    return k;
  });
}
function pclKey7(code) {   // 第 43 批：12 碼的連結 → cfg.js 的 7 碼鑰匙：前 5 碼算 SHA-256，後 7 碼每一碼往回挪
  var s = code.slice(0, 5), m = code.slice(5);
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode("hbk2|" + s)).then(function (b) {
    var u = new Uint8Array(b), k = "";
    for (var i = 0; i < 7; i++) k += PCL_A.charAt((PCL_A.indexOf(m.charAt(i)) - u[i] % 36 + 36) % 36);
    return k;
  });
}
function scOld() {   // 第 43 批：12 碼的解不開 HB_XC7＝以前停用的固定短連結（或沒複製完整）：不帶連結號碼
  SCOLD = true; SCODE = ""; PCLK = ""; lkSave("");
  if (!X) { var sv = keyLoad(); X = CFGX || (sv ? sv.x : bxLoad()); if (!T && sv && sv.x === X) { T = sv.t; FROMSAVED = true; SAVED = sv; } }   // 這台記住的照常打開
}
function scResolve(cb) {   // 開場：網址是自己的連結（#28 碼、第 43 批 #12 碼）→ 用 cfg.js 解出後端位置；這台記住的鑰匙也是這個後端的，就直接用
  if (!SCODE || X) { cb(); return; }
  var c12 = SCODE.length === 12, blob = ""; try { var w = c12 ? window.HB_XC7 : window.HB_XC; if (typeof w === "string") blob = w; } catch (e) { blob = ""; }
  if (!blob) { if (c12 && typeof window.HB_XC === "string") { scOld(); cb(); return; } SCERR = "nocfg"; cb(); return; }
  if (!(window.crypto && crypto.subtle && typeof crypto.subtle.importKey === "function" && typeof crypto.subtle.deriveKey === "function" && typeof crypto.subtle.digest === "function" && window.TextEncoder && window.TextDecoder)) { cb(); return; }
  var p; try { p = (c12 ? pclKey7(SCODE) : pclKey(SCODE)).then(function (k) { return scOpen(k, blob); }); } catch (e) { SCERR = "bad"; cb(); return; }
  p.then(function (x) {
    if (!XRE.test(x)) { if (c12) scOld(); else SCERR = "bad"; cb(); return; }
    X = x; try { localStorage.setItem("hbx", X); } catch (e) { /* 記不住就算了 */ }   // 第 42 批：網址列已經拿掉短碼了：記住後端位置（重新整理、存成書籤都打得開）
    var sv = keyLoad(); if (!T && sv && sv.x === X) { T = sv.t; FROMSAVED = true; SAVED = sv; }
    cb();
  }, function () { if (c12) scOld(); else SCERR = "bad"; cb(); });
}

/* ── 跟後端講話（藥戰手冊專案的 API）── */
function post(fn, a, ms, bg, prog) {
  var ctl = window.AbortController ? new AbortController() : null, tm = 0;
  if (ctl && ms) tm = setTimeout(function () { try { ctl.abort(); } catch (e) { /* 沒關係 */ } }, ms);
  var o = { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ v: 1, fn: fn, t: T, dk: DKX, lb: DEVLAB, a: a || [] }), credentials: "omit", cache: "no-store", referrerPolicy: "no-referrer", redirect: "follow", keepalive: !!bg };
  if (ctl) o.signal = ctl.signal;
  return fetch(API, o).then(function (r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    if (prog && r.body && r.body.getReader && window.TextDecoder) {   // 第 40 批：開場的進度條：後端做完了（開始下載）、下載了多少
      var tot = +(r.headers.get("Content-Length") || 0), got = 0, rd = r.body.getReader(), dec = new TextDecoder("utf-8"), txt = "";
      try { prog("dl", 0, tot); } catch (e) { /* 沒關係 */ }
      return (function pump() {
        return rd.read().then(function (x) {
          if (x.done) { txt += dec.decode(); try { return JSON.parse(txt); } catch (e) { throw new Error("後端回的不是手冊的格式"); } }
          got += x.value.length; txt += dec.decode(x.value, { stream: true });
          try { prog("dl", got, tot); } catch (e) { /* 沒關係 */ }
          return pump();
        });
      })();
    }
    return r.json().catch(function () { throw new Error("後端回的不是手冊的格式"); });
  })
    .then(function (j) { clearTimeout(tm); return j; }, function (e) { clearTimeout(tm); throw (e && e.name === "AbortError") ? new Error("等太久沒回應") : e; });
}
// 只是「讀」的，斷線、等太久會自己再試（最多 3 次）；會改資料的只送一次
var SAFE = { hbBoot: 1, hbData: 1, hbPing: 1, hbLog: 1, hbUsers: 1, hbCatImg: 1, hbDevices: 1, hbExportPics: 1, hbExportDrugs: 1 };   // 第 37 批：匯出拿圖、拿藥品資料也是只有讀
function call(fn, args, opt) {
  opt = opt || {};
  var sid = SESS, tries = SAFE[fn] ? 3 : 1, n = 0;
  return new Promise(function (ok, bad) {
    function go() {
      n++;
      if (opt.onTry) try { opt.onTry(n); } catch (e) { /* 沒關係 */ }   // 第 35 批：開場的畫面寫「第幾次」
      post(fn, args, opt.ms || (fn === "hbImg" || fn === "hbSave" || fn === "hbCatImg" ? 120000 : 40000), false, opt.prog).then(function (j) {
        if (sid !== SESS) return;
        if (!j || j.ok !== 1) {
          var code = j && typeof j.code === "string" ? j.code : "", msg = j && typeof j.err === "string" ? j.err : "";
          if (!code && !msg && n < tries) { setTimeout(go, 900 * n); return; }
          if (code === "tok" || code === "bind" || code === "down" || code === "moved") { stop(msg, code, j.need); return; }
          var e = new Error(msg || "後端沒有回應"); e.code = code; bad(e); return;
        }
        if (j.r && j.r.moved) { stop(String(j.r.err || ""), "moved"); return; }   // 第 34 批：舊的連結（打到補藥神器的網頁專案）：搬家了
        ok(j.r);
      }, function (err) {
        if (sid !== SESS) return;
        if (n < tries) { setTimeout(go, 900 * n); return; }
        var e = new Error("連不上後端（" + String(err && err.message || err) + "），網路好了再試一次"); e.net = true; bad(e);
      });
    }
    go();
  });
}

/* ── 整頁的畫面 ── */
var APP = null;
var BOOT = { on: false, t0: 0, n: 1, step: "", again: false, ph: "", tq: 0, got: 0, tot: 0, pct: 0 };   // 第 35 批：開場（載入中）的狀態：見 scrLoad；第 40 批：ph＝走到哪一步（進度條）
function screen(kids, cls) {
  stopPolls();
  MAIN = false; BOOT.on = false;
  APP.className = "app"; APP.innerHTML = "";
  var box = h("div", { class: "scr " + (cls || "") }, [h("div", { class: "scr-in" }, kids)]);
  APP.appendChild(box);
  return box;
}
// 第 40 批：藥戰手冊的 LOGO（向量，build_front.py 放進來的 HB_LOGO_SVG）
var HB_LOGO_URI = typeof HB_LOGO_SVG === "string" ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(HB_LOGO_SVG) : "";
function logoImg(cls) { return HB_LOGO_URI ? h("img", { class: cls || "lg", src: HB_LOGO_URI, alt: "", "aria-hidden": "true", draggable: "false" }) : h("span", {}, ["📘"]); }
function logo() { return h("div", { class: "scr-logo" }, [logoImg(), h("b", {}, ["藥戰手冊"])]); }
function scrMsg(title, lines, buttons) {
  return screen([logo(), h("h2", {}, [title]), h("div", { class: "scr-p" }, (lines || []).map(function (l) { return h("p", {}, [l]); })), buttons && buttons.length ? h("div", { class: "scr-b" }, buttons) : null]);
}
var MSG_LINE = "回 LINE 的「藥戰手冊」帳號，按下面那排的「🌐 網頁」。";
var MSG_NODK = "這個瀏覽器沒辦法記住這台裝置（可能是無痕模式、關掉了網站資料，或瀏覽器太舊），所以不能看藥戰手冊。請用一般模式開，或換最新的 Chrome、Safari。";
function reloadBtn() { return btn("🔄 重新載入", function () { location.reload(); }, "pri"); }
function retryBtn() { return btn("🔄 再試一次", function () { SESS++; boot(); }, "pri"); }   // 第 35 批：開場沒成功：網頁裡再問一次後端（不重新載入：連結上的鑰匙還記在這一頁）
// 停下來：鑰匙不對、這台還沒綁定（開發者）、後端連不到
function stop(msg, code, need) {
  SESS++;
  lockClean();
  if (code === "bind" && need) { scrBind(msg); return; }
  if (code === "tok") { keyDrop(); T = ""; if (canLogin()) { scrLogin("tok"); return; } scrMsg("連結過期了", [msg || "登入的鑰匙不對或過期了。", MSG_LINE]); return; }   // 第 32 批：可以直接用代號重新登入
  if (code === "moved") { bxDrop(); scrMsg("藥戰手冊搬家了", [msg || "藥戰手冊搬到自己的 LINE 帳號了：到 LINE 加入「藥戰手冊」，從那裡按「🌐 網頁」打開。", "（這條連結是補藥神器以前給的舊連結。）"]); return; }
  scrMsg(code === "down" ? "現在連不到後端" : "沒辦法打開", [msg || "後端沒有回應。"], [reloadBtn()]);
}
// 開發者連結：這台還沒綁定 → 輸入 LINE「開發者網頁 綁定」給的 6 位數碼
function scrBind(msg) {
  var inp = h("input", { class: "in code6", inputmode: "numeric", autocomplete: "one-time-code", maxlength: "6", placeholder: "6 位數碼", "aria-label": "綁定碼" });
  var m = h("div", { class: "scr-m", role: "status" });
  var b = btn("綁定", function () {
    var c = inp.value.replace(/\s+/g, "");
    if (!/^\d{6}$/.test(c)) { m.textContent = "請輸入 6 位數字"; return; }
    b.disabled = true; m.textContent = "確認中…";
    call("appBind", [c, DEVLAB]).then(function (r) {
      b.disabled = false;
      if (r && r.ok) { m.textContent = "✅ 綁好了"; boot(); return; }
      if (r && r.swap) { scrSwap(r, function () { boot(); }, function () { scrBind("沒有換掉任何一台，這台還沒綁定。要綁的話，再到 LINE 打「開發者網頁 綁定」拿新的 6 位數碼。"); }); return; }   // 第 34 批追加：綁滿 3 台 → 選一台換掉
      m.textContent = "❌ " + (r && r.err || "沒綁成功，再試一次"); inp.value = "";
    }, function (e) { b.disabled = false; m.textContent = "❌ " + e.message; });
  }, "pri");
  inp.onkeydown = function (e) { if (e.key === "Enter") b.onclick(); };
  screen([logo(), h("h2", {}, ["這一台還沒綁定（開發者）"]), h("div", { class: "scr-p" }, [h("p", {}, [msg || "開發者連結要先綁定這台裝置。"]), h("p", {}, ["在 LINE 打「開發者網頁 綁定」，把收到的 6 位數碼打在這裡。"])]), h("div", { class: "scr-b" }, [inp, b]), m]);
  try { inp.focus(); } catch (e) { /* 沒關係 */ }
}

/* ── 登入（第 32 批）：網頁出代號 → 貼到 LINE「藥戰手冊」帳號（一對一聊天室）→ LINE 回 6 位數驗證碼 → 打在這裡 ──
   第一次（名單上還沒有員工編號、姓名）：驗證完再打員工編號＋姓名（審核用；第一次＝送出申請，開發者核可才看得到）。
   閒置太久、按了登出：要重新取得代號、驗證碼。代號 5 分鐘內有效：倒數到 0 自動換新的（沒人理的分頁連續換 2 次就停）；
   記在這個分頁（sessionStorage），手機切去 LINE 再切回來，還是同一組。 */
var KEEP_ED = null;   // 閒置登出時還沒存的修改（只在記憶體，重新登入後接著編輯）
var LG = { code: "", sec: "", ex: 0, dev: false, dead: false, seq: 0, tm: 0, busy: false, auto: 0, role: "", note: "", mode: "" };   // mode：第 36 批（"code"＝藥師按了「改用代號登入」）
var LG_MIN = 5, LG_AUTO = 2, LG_AN = /^[A-HJ-NP-Za-kmnp-z2-9]{9}$/, LG_NUM = /^\d{6}$/;
function canLogin() { return !!(X && XRE.test(X) && DKX && window.fetch); }
function lgLabel() {   // 這台叫什麼（LINE 的驗證碼卡片上會寫：「網頁自己報的名稱」）
  var u = navigator.userAgent || "";
  var b = /Edg\//.test(u) ? "Edge" : /OPR\//.test(u) ? "Opera" : /Firefox\/|FxiOS/.test(u) ? "Firefox" : /CriOS|Chrome\//.test(u) ? "Chrome" : /Safari\//.test(u) ? "Safari" : "瀏覽器";
  var o = /Windows/.test(u) ? "Windows" : /iPhone|iPad|iPod/.test(u) ? "iOS" : /Android/.test(u) ? "Android" : /Mac OS X|Macintosh/.test(u) ? "macOS" : /Linux/.test(u) ? "Linux" : "";
  return "藥戰手冊・" + (o ? b + " / " + o : b);
}
// 第 34 批追加：這台是什麼（開發者網頁「🔒 我的裝置」、綁滿 3 台時選一台換掉用）：「電腦・Chrome / Windows」「手機・LINE 內建 / iOS」
function devLabel() {
  var u = navigator.userAgent || "", tp = 0;
  try { tp = navigator.maxTouchPoints || 0; } catch (e) { tp = 0; }
  var ipad = /iPad/.test(u) || (/Macintosh/.test(u) && tp > 1);
  var k = ipad || (/Android/.test(u) && !/Mobile/.test(u)) ? "平板" : /iPhone|iPod|Android|Mobile/.test(u) ? "手機" : "電腦";
  var b = / Line\//.test(u) ? "LINE 內建" : /Edg(A|iOS)?\//.test(u) ? "Edge" : /OPR\//.test(u) ? "Opera" : /SamsungBrowser/.test(u) ? "Samsung" : /Firefox\/|FxiOS/.test(u) ? "Firefox" : /CriOS|Chrome\//.test(u) ? "Chrome" : /Safari\//.test(u) ? "Safari" : "瀏覽器";
  var o = /Windows/.test(u) ? "Windows" : ipad ? "iPadOS" : /iPhone|iPod/.test(u) ? "iOS" : /Android/.test(u) ? "Android" : /CrOS/.test(u) ? "ChromeOS" : /Mac OS X|Macintosh/.test(u) ? "macOS" : /Linux/.test(u) ? "Linux" : "";
  return k + "・" + b + (o ? " / " + o : "");
}
function devName(d) { return d && d.b ? d.b : "之前綁的那台（不知道是哪一台）"; }
function devIcon(b) { return /^(手機|平板)/.test(b || "") ? "📱" : /^電腦/.test(b || "") ? "💻" : "❔"; }
function fmtWhen(ms) {   // 今天 14:20／昨天 09:05／10/12 14:20／2025/10/12
  var d = new Date(+ms), n = new Date(), z = function (x) { return ("0" + x).slice(-2); };
  if (!ms || isNaN(d.getTime())) return "—";
  var hm = z(d.getHours()) + ":" + z(d.getMinutes()), day = function (x) { return new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(); };
  var dd = Math.round((day(n) - day(d)) / 864e5);
  if (dd === 0) return "今天 " + hm;
  if (dd === 1) return "昨天 " + hm;
  if (d.getFullYear() === n.getFullYear()) return (d.getMonth() + 1) + "/" + d.getDate() + " " + hm;
  return d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();
}
function devRow(d, acts) {   // 一台：圖示、名稱（正在用的這台標出來）、綁定時間、最後用、按鈕
  return h("div", { class: "dvrow" + (d.me ? " me" : "") }, [
    h("span", { class: "dvic", "aria-hidden": "true" }, [devIcon(d.b)]),
    h("div", { class: "dvmain" }, [
      h("div", { class: "dvname" + (d.b ? "" : " unk") }, [devName(d), d.me ? h("span", { class: "dvme" }, ["正在用的這台"]) : null]),
      h("div", { class: "dvmeta" }, ["綁定 " + fmtWhen(d.t) + "　最後用 " + (d.me ? "現在" : fmtWhen(d.u))])]),
    acts && acts.length ? h("div", { class: "dvacts" }, acts) : null]);
}
// 開發者版已經綁滿 3 台：選一台換掉（被換掉的那台馬上不能用開發者網頁）。done(鑰匙)：換好了；cancel：不換
function scrSwap(r, done, cancel) {
  var tk = String(r.swap || ""), list = r.list || [], max = r.max || 3, busy = false;
  var m = h("div", { class: "scr-m", role: "status" }), box = h("div", { class: "dvlist" });
  var nb = btn("不要換", function () { if (!busy) cancel(); }, "");
  var pick = function (d) {
    if (busy) return;
    var nm = devName(d);
    modal({ title: "把「" + nm + "」換成這台？", lines: ["換掉以後，「" + nm + "」馬上不能用開發者網頁（那台要再用，得重新綁定）。", "這台：" + DEVLAB], buttons: [{ label: "不要", cls: "sm" }, { label: "換掉", cls: "sm bad", fn: function () {
      busy = true; m.textContent = "換裝置中…";
      call("appBindSwap", [tk, d.id, DEVLAB]).then(function (x) {
        busy = false;
        if (x && x.ok && TRE.test(String(x.t || ""))) { m.textContent = "✅ 換好了"; done(String(x.t), x.gone || nm); return; }
        if (x && x.list) { list = x.list; draw(); }
        m.textContent = "❌ " + String(x && x.err || "沒換成功，再試一次").slice(0, 200);
        if (x && x.again) { box.innerHTML = ""; nb.textContent = "重新來過"; }
      }, function (e) { busy = false; m.textContent = "❌ " + e.message; });
    } }] });
  };
  var draw = function () { box.innerHTML = ""; list.forEach(function (d) { box.appendChild(devRow(d, [btn("換掉這台", function () { pick(d); }, "sm bad dvswap")])); }); };
  draw();
  screen([logo(), h("h2", {}, ["🔒 開發者版已經綁滿 " + max + " 台"]),
    h("div", { class: "scr-p" }, [h("p", {}, ["要在這台用開發者網頁，請選一台換掉。被換掉的那台馬上不能用開發者網頁（那台要再用，得重新綁定）。"]), h("p", {}, ["這台：", h("b", {}, [DEVLAB])])]),
    box, m, h("div", { class: "scr-b" }, [nb]),
    h("p", { class: "lgfine" }, ["這個畫面 10 分鐘內有效。也可以先不換：在已經綁好的那台打開開發者網頁 →「管理」→「⑤ 我的裝置」刪掉一台，再回來綁定。"])], "swscr");
}
function lgSave() { try { if (LG.code && !LG.dead) sessionStorage.setItem("hbpair", JSON.stringify({ x: X, code: LG.code, sec: LG.sec, ex: LG.ex, dev: LG.dev ? 1 : 0 })); else sessionStorage.removeItem("hbpair"); } catch (e) { /* 記不住就算了 */ } }
function lgLoad() {
  try {
    var o = JSON.parse(sessionStorage.getItem("hbpair") || "null"), now = Date.now();
    if (o && o.x === X && (o.dev ? LG_NUM : LG_AN).test(String(o.code || "")) && TRE.test(String(o.sec || "")) && +o.ex > now + 3000 && +o.ex <= now + 900000) return o;
  } catch (e) { /* 沒有 */ }
  return null;
}
function lgStop() { clearInterval(LG.tm); LG.tm = 0; }
// 第 36 批：登入畫面：藥師＝員工編號＋姓名（電腦登入，scrLoginPc）；開發者、按了「改用代號登入」＝代號登入（scrLoginCode）
function scrLogin(why, r) {
  if (LG.role === "dev" || LG.mode === "code") { scrLoginCode(why, r); return; }
  scrLoginPc(why, r);
}
function scrLoginCode(why, r) {
  r = r || {};
  lgStop(); pcStop();
  var lines = [];
  if (why === "idle") lines.push("閒置超過 " + Math.round(IDLE_MS / 6e4) + " 分鐘，已自動登出，手冊內容已經從畫面上拿掉。要再看：重新取得代號、驗證碼登入。");
  else if (why === "out") lines.push("已登出，手冊內容已經從畫面上拿掉。");
  else if (why === "expired") lines.push("太久沒動作，這一台的登入過期了：重新取得代號、驗證碼登入。");
  else if (why === "bad") lines.push("這條連結用過了、或已經過期（從 LINE 按下去之後太久才開）。用下面的代號登入，或回 LINE 再按一次「🌐 網頁」。");
  else if (why === "tok") lines.push("這台記住的登入過期了：用下面的代號重新登入。");
  else if (why === "again") lines.push(r.err || "太久沒完成：重新取得代號登入。");
  if (!canLogin()) { scrMsg("請從 LINE 打開", lines.concat([MSG_LINE])); return; }
  var pair = h("div", { class: "lgpair", id: "lgpair", "aria-live": "polite" });
  var cin = h("input", { class: "in lgin", type: "text", inputmode: "numeric", autocomplete: "one-time-code", maxlength: "9", placeholder: "6 位數", "aria-label": "LINE 回的 6 位數驗證碼" });
  var go = h("button", { class: "btn pri lggo", type: "button" }, ["登入"]);
  var msg = h("div", { class: "scr-m lgm", role: "status" });
  var wrap = h("div", { class: "lgwrap", hidden: true }, [h("div", { class: "lgst2" }, ["② LINE 會回你 6 位數的", h("b", {}, ["驗證碼"]), "，打在這裡"]), h("div", { class: "lgrow" }, [cin, go]), msg]);
  var role = h("button", { class: "lglink", type: "button" }, [LG.role === "dev" ? "← 回藥師登入" : "開發者登入"]);
  var back = LG.role === "dev" ? null : h("button", { class: "lglink", type: "button", onclick: function () { LG.mode = ""; scrLogin(why, r); } }, ["← 改用員工編號＋姓名登入"]);   // 第 36 批
  screen([logo(), h("h2", {}, ["🔐 登入藥戰手冊"]),
    lines.length ? h("div", { class: "scr-p" }, lines.map(function (l) { return h("p", {}, [l]); })) : null,
    h("div", { class: "lggrid" }, [pair, wrap]),
    h("p", { class: "lgfine" }, ["把代號貼到 LINE 的「藥戰手冊」帳號，換 6 位數驗證碼。第一次登入，還要打員工編號和姓名（對得上員工名單的馬上可以看）。", h("br"), "代號、驗證碼只能在這個網頁用；代號 " + LG_MIN + " 分鐘內要完成登入（超過會自己換新的）；驗證碼只能用一次，不要傳給任何人。"]),
    KEEP_ED || (typeof KEEP_QE !== "undefined" && KEEP_QE) ? h("p", { class: "lockkeep" }, ["✏️ 你有還沒儲存的修改：登入以後會接著編輯（還沒存進去）。"]) : null,
    h("div", { class: "lgrolew" }, [role, back])], "lgscr");
  var my = ++LG.seq;
  var alive = function () { return my === LG.seq && pair.isConnected; };
  var fmt = function (s) { return Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2); };
  var tick = function () {
    var el = $("#lgcd", pair);
    if (!alive() || !el || LG.dead) { lgStop(); return; }
    var s = Math.ceil((LG.ex - Date.now()) / 1000);
    if (s <= 0) { if (LG.busy || document.visibilityState === "hidden") return; if (LG.auto >= LG_AUTO) { gone("這組代號已經過期（" + LG_MIN + " 分鐘）"); return; } LG.auto++; start("⌛ 超過 " + LG_MIN + " 分鐘沒有登入，已經換成新的代號：把這組新的再貼到 LINE 就好。"); return; }
    el.textContent = fmt(s); el.className = s <= 20 ? "low" : "";
  };
  var copy = function (b) {
    var c = LG.code, done = function (ok) { b.textContent = ok ? "已複製 ✓" : "複製不了，請長按上面的代號"; setTimeout(function () { if (b.isConnected) b.textContent = "複製代號"; }, 2200); };
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(c).then(function () { done(true); }, function () { done(false); }); return; } } catch (e) { /* 換下面的 */ }
    done(false);
  };
  var live = function () {
    var dev = LG.dev, c = LG.code, shown = dev ? c.slice(0, 3) + " " + c.slice(3) : c;
    var cb = h("button", { class: "lgcopy", type: "button" }, ["複製代號"]); cb.onclick = function () { copy(cb); };
    var again = h("button", { class: "lglink", type: "button" }, ["重新取得代號"]); again.onclick = function () { LG.auto = 0; start(""); };
    pair.innerHTML = "";
    if (dev) pair.appendChild(h("div", { class: "lgrole" }, ["🛠 開發者登入"]));
    if (LG.note) pair.appendChild(h("div", { class: "lgnote" }, [LG.note]));
    pair.appendChild(h("div", { class: "lgst" }, ["① 打開 LINE 的「藥戰手冊」（一對一，不是群組），把這組", h("b", {}, [dev ? "開發者代號" : "代號"]), dev ? "打進去" : "貼進去"]));
    pair.appendChild(h("div", { class: "lgcode" + (dev ? " num" : ""), id: "lgcode", role: "img", "aria-label": (dev ? "開發者代號 " : "代號 ") + c.split("").join(" ") }, [shown]));
    pair.appendChild(cb);
    pair.appendChild(h("div", { class: "lgmeta" }, [dev ? "" : "英文大小寫都可以　", "請在 ", h("b", { id: "lgcd" }, [""]), " 內完成登入", h("br"), again]));
    wrap.hidden = false;
    lgStop(); tick(); LG.tm = setInterval(tick, 1000);
  };
  var gone = function (why2) {
    LG.dead = true; lgSave(); lgStop();
    var again = h("button", { class: "btn pri", type: "button" }, ["重新取得代號"]); again.onclick = function () { LG.auto = 0; start(""); };
    pair.innerHTML = ""; pair.appendChild(h("div", { class: "lgst" }, ["① " + why2])); pair.appendChild(h("div", { class: "lgcode gone" }, ["⌛ 請重新取得代號"])); pair.appendChild(again);
    wrap.hidden = true; msg.textContent = "";
  };
  var start = function (note) {
    if (LG.busy) return;
    var old = LG.sec && !LG.dead ? LG.sec : "", s0 = Date.now(), mine = ++LG.seq;
    my = mine; LG.note = note || ""; LG.code = ""; LG.dead = true; lgSave(); lgStop();
    pair.innerHTML = ""; pair.appendChild(h("div", { class: "lgst" }, ["① 正在向後端要代號…"])); pair.appendChild(h("div", { class: "lgcode gone" }, ["⏳"]));
    wrap.hidden = true; msg.textContent = ""; cin.value = "";
    var slow = setTimeout(function () { if (my === mine && pair.isConnected && !LG.code) pair.appendChild(h("div", { class: "lgst" }, ["後端剛睡醒的時候要等 30 秒左右，請先別關掉這個畫面。"])); }, 6000);
    call("appCodeStart", [lgLabel(), old, LG.role], { ms: 75000 }).then(function (x) {
      clearTimeout(slow);
      if (my !== mine || !pair.isConnected) return;
      var dev = LG.role === "dev";
      if (x && x.ok && (dev ? LG_NUM : LG_AN).test(String(x.code || "")) && TRE.test(String(x.sec || ""))) {
        LG.code = String(x.code); LG.sec = String(x.sec); LG.dev = dev; LG.dead = false; LG.ex = s0 + Math.max(30, Math.min(900, +x.ttl || LG_MIN * 60)) * 1000;
        lgSave(); live(); return;
      }
      pair.innerHTML = ""; pair.appendChild(h("div", { class: "lgst" }, ["① 沒拿到代號"])); pair.appendChild(h("div", { class: "lgcode gone" }, [String(x && x.err || "沒拿到代號，再試一次").slice(0, 200)]));
      var tryb = h("button", { class: "btn pri", type: "button" }, ["再試一次"]); tryb.onclick = function () { start(""); }; pair.appendChild(tryb);
    }, function (e) {
      clearTimeout(slow);
      if (my !== mine || !pair.isConnected) return;
      pair.innerHTML = ""; pair.appendChild(h("div", { class: "lgst" }, ["① 沒拿到代號"])); pair.appendChild(h("div", { class: "lgcode gone" }, [/等太久/.test(String(e && e.message)) ? "等太久沒有回應，再試一次" : "連不上後端，網路好了再試一次"]));
      var tryb = h("button", { class: "btn pri", type: "button" }, ["再試一次"]); tryb.onclick = function () { start(""); }; pair.appendChild(tryb);
    });
  };
  var submit = function () {
    if (LG.busy) return;
    var v = String(cin.value || "").replace(/[０-９]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) - 65248); }).replace(/[\s-]/g, "");
    if (!LG.code || LG.dead) { gone("這組代號已經不能用了"); return; }
    if (LG.ex <= Date.now()) { start("⌛ 超過 " + LG_MIN + " 分鐘沒有登入，已經換成新的代號：把這組新的再貼到 LINE 就好。"); return; }
    if (!/^\d{6}$/.test(v)) { msg.textContent = "請打 LINE 回給你的 6 位數字"; try { cin.focus(); } catch (e) { /* 沒關係 */ } return; }
    if (LG.dev && v === LG.code) { msg.textContent = "這裡要打 LINE 回給你的 6 位數驗證碼，不是上面的開發者代號（開發者代號是要打進 LINE 的）。"; return; }
    LG.busy = true; go.disabled = true; cin.readOnly = true; msg.textContent = "確認中…";
    var slow = setTimeout(function () { if (LG.busy && pair.isConnected) msg.textContent = "確認中…後端剛睡醒的時候要等 30 秒左右，請先別關掉、也不用再按。"; }, 6000);
    var P = LG.sec;
    call("hbCodeLogin", [P, v, DEVLAB], { ms: 80000 }).then(function (x) {
      clearTimeout(slow); LG.busy = false; go.disabled = false; cin.readOnly = false;
      if (x && x.full && x.swap) {   // 第 34 批追加：開發者版綁滿 3 台 → 選一台換掉（換好了才拿到鑰匙）
        LG.code = ""; LG.dead = true; lgSave(); lgStop();
        scrSwap(x, function (t2) { T = t2; FROMSAVED = false; FROMLINK = false; keySave(); boot(); }, function () { scrLogin("again", { err: "沒有換掉任何一台，這台還沒登入。要登入：重新取得代號，驗證完再選一台換掉。" }); });
        return;
      }
      if (x && TRE.test(String(x.t || ""))) {   // 驗證碼對了：這台記住鑰匙，接著看要做什麼
        LG.code = ""; LG.dead = true; lgSave(); lgStop();
        T = String(x.t); FROMSAVED = false; FROMLINK = false; keySave();
        onBoot(x); return;
      }
      if (!pair.isConnected || P !== LG.sec) return;
      if (x && x.dead) { gone("這組代號已經用不了了（打錯太多次）"); return; }
      if (x && x.gone) { if (x.full) gone(String(x.err || "開發者版名額滿了").replace(/^🔒\s*/, "")); else gone("這組代號已經不能用了（過期、用掉了，或已經作廢）"); return; }
      if (x && x.wait) { msg.textContent = "⏳ LINE 還沒收到這組代號。到 LINE 的「藥戰手冊」" + (LG.dev ? "打 " : "貼上 ") + LG.code + "，拿到驗證碼再回來輸入。"; return; }
      if (x && x.bad) { msg.textContent = "❌ 驗證碼不對，再輸入一次。（要照 LINE 卡片上現在這一張；不確定就按「重新取得代號」換新的一組）"; cin.value = ""; try { cin.focus(); } catch (e) { /* 沒關係 */ } return; }
      msg.textContent = "❌ " + String(x && x.err || "沒登入成功，再試一次").slice(0, 200);
    }, function (e) {
      clearTimeout(slow); LG.busy = false; go.disabled = false; cin.readOnly = false;
      msg.textContent = /等太久/.test(String(e && e.message)) ? "❌ 等太久沒有回應。再試一次；若說「代號已經不能用」，按「重新取得代號」重來。" : "❌ 連不上後端，網路好了再試一次";
    });
  };
  go.onclick = submit;
  cin.onkeydown = function (e) { if (e.key === "Enter") submit(); };
  cin.oninput = function () { LG.auto = 0; };
  role.onclick = function () {
    if (LG.role === "dev") { LG.role = ""; LG.auto = 0; scrLogin(why, r); return; }   // 第 36 批：回藥師登入＝員工編號＋姓名（按過「改用代號登入」的照舊是代號）
    LG.role = "dev"; role.textContent = "← 回藥師登入"; if (back) back.hidden = true; LG.auto = 0; start("");
  };
  var p = lgLoad();
  if (p && (p.dev ? "dev" : "") === LG.role) { LG.code = p.code; LG.sec = p.sec; LG.ex = +p.ex; LG.dev = !!p.dev; LG.dead = false; LG.note = ""; live(); try { cin.focus({ preventScroll: true }); } catch (e) { /* 沒關係 */ } }
  else start("");
}
document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") LG.auto = 0; });

/* ── 第 36 批：電腦登入（員工編號＋姓名）──
   用「電腦用的入口連結」（…/hb.html，存成書籤）打開 → 打員工編號＋姓名 → 手機 LINE 的「藥戰手冊」傳「登入」→ LINE 回 6 位數 → 打在這裡。
   第 43 批：拿掉「記住這台電腦」：每次都要驗證（共用電腦最安全）；員工編號的英文字母大小寫都可以。
   第 42 批：用自己在 LINE 按「🔗 複製連結」拿的連結打開的（10 分鐘內、第一次用）：②不用做（連結本來就是從他的 LINE 拿的）。
   等驗證碼的那一組記在這個分頁（sessionStorage）：切去別的分頁再回來，還是同一組（10 分鐘內）。 */
var PC = { sec: "", ex: 0, busy: false, tm: 0, seq: 0 };
var MSG_PC = "在電腦（或別的瀏覽器）上：打開 LINE 的「藥戰手冊」，按下面那排的「🔗 複製連結」（電腦版 LINE 打「複製連結」），貼到瀏覽器的網址列打開。這台用過一次以後，直接打開「…/hb.html」（存成書籤）就是登入畫面。";
/* ── 第 42 批：這台不知道後端在哪（第一次用、無痕視窗、清掉了網站資料）：請從 LINE 複製自己的連結（網址列、或貼在這裡都可以）──
   why："old"＝打開的是以前的固定短連結（停用了）；"nocfg"／"bad"＝自己的連結打不開（cfg.js 還沒放好、對不上） */
function scrFirst(why) {
  var inp = h("input", { class: "in", id: "pclin", type: "text", autocomplete: "off", spellcheck: "false", placeholder: "貼上 LINE「🔗 複製連結」拿到的連結", "aria-label": "LINE 複製的連結" });
  var m = h("div", { class: "scr-m", role: "status", "aria-live": "polite" });
  var go = function () {
    var v = String(inp.value || "").replace(/\s+/g, ""), mm = /#([a-z0-9]{28}|[a-z0-9]{12})$/.exec(v) || /^([a-z0-9]{28}|[a-z0-9]{12})$/.exec(v);   // 第 43 批：12 碼的也收
    if (!mm) { m.textContent = "這不像 LINE「🔗 複製連結」拿到的連結：請在 LINE 再按一次，整條貼上來。"; try { inp.focus(); } catch (e) { /* 沒關係 */ } return; }
    SCODE = mm[1]; SCOLD = false; SCERR = ""; PCLK = lkOf(SCODE); lkSave(PCLK);
    m.textContent = "打開中…";
    start();
  };
  inp.onkeydown = function (e) { if (e.key === "Enter") go(); };
  var t = why === "old" ? "這條連結打不開" : why ? "連結打不開" : "請從 LINE 打開";
  var lines = why === "old" ? ["這條連結打不開：可能是以前管理頁給的固定短連結（已經停用），或沒有複製完整。現在每個人用自己的連結（每個人、每次都不一樣）。"] : [];
  if (why === "nocfg") lines.push("網站上還沒有放好 cfg.js（剛上傳的話，等 1～2 分鐘再重新整理）。還是不行，請跟開發者說。");
  if (why === "bad") lines.push("這條連結跟網站上的 cfg.js 對不上（可能開發者剛換過設定，或連結沒有複製完整）：請在 LINE 再按一次「🔗 複製連結」。");
  lines.push(MSG_PC, "在手機上：" + MSG_LINE);
  if (!why) lines.push("（藥戰手冊是自己的 LINE 帳號：還沒加的話，補藥神器下面那排的「📘 藥戰手冊」就是加入的按鈕。）");
  screen([logo(), h("h2", {}, [t]), h("div", { class: "scr-p" }, lines.map(function (l) { return h("p", {}, [l]); })),
    h("div", { class: "pclrow" }, [inp, btn("打開", go, "pri")]), m,
    why ? h("div", { class: "scr-b" }, [reloadBtn()]) : null], "pclscr");
}
function pcStop() { clearInterval(PC.tm); PC.tm = 0; }
function pcSave() { try { if (PC.sec) sessionStorage.setItem("hbpc", JSON.stringify({ x: X, sec: PC.sec, ex: PC.ex })); else sessionStorage.removeItem("hbpc"); } catch (e) { /* 記不住就算了 */ } }
function pcLoad() {
  try {
    var o = JSON.parse(sessionStorage.getItem("hbpc") || "null"), now = Date.now();
    if (o && o.x === X && TRE.test(String(o.sec || "")) && +o.ex > now + 3000 && +o.ex <= now + 960000) return o;
  } catch (e) { /* 沒有 */ }
  return null;
}
function pcRemDrop() { try { localStorage.removeItem("pcrem"); } catch (e) { /* 沒關係 */ } }   // 第 43 批：沒有「記住這台電腦」了（以前記的勾勾拿掉）
function loginWhy(why, r, pc) {   // 登入畫面最上面那一句（為什麼要登入）
  var again = pc ? "重新登入" : "重新取得代號、驗證碼登入";
  if (why === "idle") return "閒置超過 " + Math.round(IDLE_MS / 6e4) + " 分鐘，已自動登出，手冊內容已經從畫面上拿掉。要再看：" + again + "。";
  if (why === "out") return "已登出，手冊內容已經從畫面上拿掉。";
  if (why === "expired") return "太久沒動作，這一台的登入過期了：" + again + "。";
  if (why === "bad") return pc ? "這條連結用過了、或已經過期（從 LINE 按下去之後太久才開）。在下面打員工編號＋姓名登入，或回 LINE 再按一次「🌐 網頁」。" : "這條連結用過了、或已經過期（從 LINE 按下去之後太久才開）。用下面的代號登入，或回 LINE 再按一次「🌐 網頁」。";
  if (why === "tok") return pc ? "這台記住的登入過期了：重新登入。" : "這台記住的登入過期了：用下面的代號重新登入。";
  if (why === "again") return (r && r.err) || "太久沒完成：" + again + "。";
  if (why === "forgot") return "✅ 這台電腦已經忘記你了：下次在這台登入，要再用 LINE 驗證碼。";
  return "";
}
function scrLoginPc(why, r) {
  r = r || {};
  lgStop(); pcStop();
  var w0 = loginWhy(why, r, true), lines = w0 ? [w0] : [];
  if (!canLogin()) { scrMsg("請從 LINE 打開", lines.concat([MSG_LINE, MSG_PC])); return; }
  var my = ++PC.seq, alive = function () { return my === PC.seq && box.isConnected; };
  var emp = h("input", { class: "in", maxlength: "20", autocomplete: "off", autocapitalize: "characters", spellcheck: "false", placeholder: "例：E10107", "aria-label": "員工編號", "aria-required": "true" });
  var nm = h("input", { class: "in", maxlength: "20", autocomplete: "off", spellcheck: "false", placeholder: "例：王小明", "aria-label": "姓名", "aria-required": "true" });
  var go = h("button", { class: "btn pri lggo", type: "button", id: "pcgo" }, ["登入"]);
  pcRemDrop();
  var m = h("div", { class: "scr-m lgm", role: "status", "aria-live": "polite" });
  var cin = h("input", { class: "in lgin", type: "text", inputmode: "numeric", autocomplete: "one-time-code", maxlength: "9", placeholder: "6 位數", "aria-label": "LINE 回的 6 位數驗證碼", id: "pccode" });
  var go2 = h("button", { class: "btn pri lggo", type: "button", id: "pcgo2" }, ["確定"]);
  var m2 = h("div", { class: "scr-m lgm", role: "status", "aria-live": "polite" });
  var cd = h("b", { id: "pccd" }, [""]);
  var restart = h("button", { class: "lglink", type: "button" }, ["重新開始"]);
  var step1 = h("div", { class: "pcbox", id: "pcstep1" }, [
    PCLK ? h("div", { class: "pclhint", id: "pclhint" }, ["🔗 這一頁是用你在 LINE 複製的連結打開的：10 分鐘內打員工編號＋姓名就能進去（不用驗證碼）。"]) : null,   // 第 42 批
    h("div", { class: "lgst" }, ["① 打你的", h("b", {}, ["員工編號"]), "和", h("b", {}, ["姓名"]), "（要跟申請時填的一樣）"]),
    h("div", { class: "scr-form" }, [h("label", {}, [h("span", {}, ["員工編號", h("small", { class: "pcaa" }, ["（英文字母大小寫都可以）"])]), emp]), h("label", {}, [h("span", {}, ["姓名"]), nm])]),
    h("div", { class: "scr-b" }, [go]), m]);
  var step2 = h("div", { class: "pcbox pc2", id: "pcstep2", hidden: true }, [
    h("div", { class: "lgst" }, ["② 拿出手機，用", h("b", {}, ["申請藥戰手冊的那個 LINE 帳號"]), "，在「藥戰手冊」傳「", h("b", {}, ["登入"]), "」兩個字（或按下面那排的「🌐 網頁」）"]),
    h("div", { class: "lgst2" }, ["LINE 會回你 6 位數的", h("b", {}, ["驗證碼"]), "，打在這裡："]),
    h("div", { class: "lgrow" }, [cin, go2]), m2,
    h("div", { class: "lgmeta" }, ["請在 ", cd, " 內完成　", restart])]);
  var box = screen([logo(), h("h2", {}, ["🔐 登入藥戰手冊"]),
    lines.length ? h("div", { class: "scr-p" }, lines.map(function (l) { return h("p", {}, [l]); })) : null,
    step1, step2,
    h("p", { class: "lgfine" }, ["每次登入都要用手機 LINE 拿 6 位數驗證碼，確認是本人（用 LINE「🔗 複製連結」剛拿的連結打開的，10 分鐘內不用）。這台電腦不會記住你，共用的電腦也可以放心用。", h("br"), "驗證碼、自己的連結都只能自己用，不要傳給任何人。"]),
    KEEP_ED || (typeof KEEP_QE !== "undefined" && KEEP_QE) ? h("p", { class: "lockkeep" }, ["✏️ 你有還沒儲存的修改：登入以後會接著編輯（還沒存進去）。"]) : null,
    h("div", { class: "lgrolew" }, [
      h("button", { class: "lglink", type: "button", onclick: function () { pcStop(); LG.mode = "code"; LG.role = ""; scrLogin(why, r); } }, ["改用代號登入"]),
      h("button", { class: "lglink", type: "button", onclick: function () { pcStop(); LG.role = "dev"; scrLogin(why, r); } }, ["開發者登入"])])], "lgscr pcscr");
  var focus = function (el) { try { el.focus(); } catch (e) { /* 沒關係 */ } };
  var tick = function () {
    if (!alive() || !PC.sec) { pcStop(); return; }
    var s = Math.ceil((PC.ex - Date.now()) / 1000);
    if (s <= 0) { pcStop(); PC.sec = ""; pcSave(); m2.textContent = "⌛ 超過 10 分鐘了：按「重新開始」再登入一次。"; cd.textContent = "0:00"; go2.disabled = true; return; }
    cd.textContent = Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2); cd.className = s <= 30 ? "low" : "";
  };
  var toStep2 = function () {   // 要 LINE 驗證碼
    step1.hidden = true; step2.hidden = false; go2.disabled = false; cin.value = ""; m2.textContent = "";
    pcStop(); tick(); PC.tm = setInterval(tick, 1000); focus(cin);
  };
  var toStep1 = function (msg) {
    pcStop(); PC.sec = ""; pcSave();
    step2.hidden = true; step1.hidden = false; go.disabled = false; m.textContent = msg || ""; focus(emp.value ? nm : emp);
  };
  var done = function (x) { pcStop(); PC.sec = ""; pcSave(); PCLK = ""; lkSave(""); T = String(x.t); FROMSAVED = false; FROMLINK = false; keySave(); LG.mode = ""; onBoot(x); };
  var slowMsg = function (el) { return setTimeout(function () { if (alive() && PC.busy) el.textContent = "確認中…後端剛睡醒的時候要等 30 秒左右，請先別關掉、也不用再按。"; }, 6000); };
  var submit = function () {
    if (PC.busy) return;
    var e = String(emp.value || "").replace(/\s+/g, ""), n = String(nm.value || "").replace(/\s+/g, " ").trim();
    if (!e) { m.textContent = "請打員工編號"; focus(emp); return; }
    if (!/^[A-Za-z0-9Ａ-Ｚａ-ｚ０-９\-－]{2,20}$/.test(e)) { m.textContent = "員工編號只能是英文字母、數字（2～20 個字）"; focus(emp); return; }
    if (!n) { m.textContent = "請打姓名"; focus(nm); return; }
    PC.busy = true; go.disabled = true; m.textContent = "確認中…";
    var slow = slowMsg(m), lk = PCLK;
    call("hbPcLogin", [e, n, 0, lk || ""], { ms: 80000 }).then(function (x) {   // 第 42 批：帶這一頁的連結號碼（LINE 複製的；10 分鐘內第一次不用驗證碼）。第 43 批：不記住這台（第三個一律 0）
      clearTimeout(slow); PC.busy = false; go.disabled = false;
      if (!alive()) return;
      if (x && TRE.test(String(x.t || ""))) { done(x); return; }
      if (x && x.need === "line" && TRE.test(String(x.sec || ""))) {
        PC.sec = String(x.sec); PC.ex = Date.now() + Math.max(60, Math.min(900, +x.ttl || 600)) * 1000; pcSave(); m.textContent = ""; toStep2();
        if (lk) { PCLK = ""; lkSave(""); var hn = $("#pclhint"); if (hn) hn.remove(); m2.textContent = "這條連結已經用過、超過 10 分鐘，或不是你自己的：照上面拿 6 位數驗證碼。"; }   // 第 42 批
        return;
      }
      if (x && x.st && !x.err) { onBoot(x); return; }   // 被撤銷了、手冊關了…
      m.textContent = (x && x.wait ? "⏳ " : "❌ ") + String(x && x.err || "沒登入成功，再試一次").slice(0, 260);   // 第 43 批：還在等核可（不是打錯）
      if (x && x.field) focus(x.field === "name" ? nm : emp);
    }, function (er) { clearTimeout(slow); PC.busy = false; go.disabled = false; if (alive()) m.textContent = /等太久/.test(String(er && er.message)) ? "❌ 等太久沒有回應，再按一次「登入」。" : "❌ 連不上後端，網路好了再試一次"; });
  };
  var submit2 = function () {
    if (PC.busy) return;
    var v = String(cin.value || "").replace(/[０-９]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) - 65248); }).replace(/[\s-]/g, "");
    if (!PC.sec || PC.ex <= Date.now()) { toStep1("⌛ 超過 10 分鐘了：再按一次「登入」。"); return; }
    if (!/^\d{6}$/.test(v)) { m2.textContent = "請打 LINE 回給你的 6 位數字"; focus(cin); return; }
    PC.busy = true; go2.disabled = true; cin.readOnly = true; m2.textContent = "確認中…";
    var slow = slowMsg(m2), P = PC.sec;
    call("hbPcCode", [P, v], { ms: 80000 }).then(function (x) {
      clearTimeout(slow); PC.busy = false; go2.disabled = false; cin.readOnly = false;
      if (!alive() || P !== PC.sec) return;
      if (x && TRE.test(String(x.t || ""))) { done(x); return; }
      if (x && (x.gone || x.dead)) { toStep1("❌ " + String(x.err || "這次的登入已經不能用了") + ""); return; }
      if (x && x.wait) { m2.textContent = "⏳ " + String(x.err || "LINE 還沒收到「登入」"); return; }
      if (x && x.bad) { m2.textContent = "❌ " + String(x.err || "驗證碼不對") + (x.left ? "（還可以打 " + x.left + " 次）" : ""); cin.value = ""; focus(cin); return; }
      if (x && x.st && !x.err) { pcStop(); PC.sec = ""; pcSave(); onBoot(x); return; }
      m2.textContent = "❌ " + String(x && x.err || "沒登入成功，再試一次").slice(0, 260);
    }, function (er) { clearTimeout(slow); PC.busy = false; go2.disabled = false; cin.readOnly = false; if (alive()) m2.textContent = /等太久/.test(String(er && er.message)) ? "❌ 等太久沒有回應，再按一次「確定」。" : "❌ 連不上後端，網路好了再試一次"; });
  };
  go.onclick = submit; go2.onclick = submit2;
  [emp, nm].forEach(function (inp) { inp.onkeydown = function (ev) { if (ev.key === "Enter") submit(); }; });
  cin.onkeydown = function (ev) { if (ev.key === "Enter") submit2(); };
  restart.onclick = function () { toStep1(""); };
  var p = pcLoad();
  if (p) { PC.sec = p.sec; PC.ex = +p.ex; toStep2(); } else focus(emp);
}

/* ── 驗證過是本人了，第一次要打員工編號＋姓名（審核用）── */
function scrId(r) {
  r = r || {};
  var need = r.need || "join";
  var emp = h("input", { class: "in", maxlength: "20", autocomplete: "off", autocapitalize: "characters", placeholder: "例：E10107", "aria-label": "員工編號", "aria-required": "true" });
  var nm = h("input", { class: "in", maxlength: "20", autocomplete: "off", placeholder: "例：王小明", "aria-label": "姓名", "aria-required": "true" });
  var m = h("div", { class: "scr-m", role: "status" });
  var b = btn(need === "join" ? "送出申請" : "進入藥戰手冊", function () {
    var e = emp.value.replace(/\s+/g, "").toUpperCase(), n = nm.value.replace(/\s+/g, " ").trim();
    if (!e) { m.textContent = "請打員工編號"; try { emp.focus(); } catch (x) { /* 沒關係 */ } return; }
    if (!/^[A-Z0-9Ａ-Ｚａ-ｚ０-９-－]{2,20}$/.test(e)) { m.textContent = "員工編號只能是英文字母、數字（2～20 個字）"; try { emp.focus(); } catch (x) { /* 沒關係 */ } return; }
    if (!n) { m.textContent = "請打姓名"; try { nm.focus(); } catch (x) { /* 沒關係 */ } return; }
    b.disabled = true; m.textContent = "送出中…";
    call("hbIdLogin", [e, n]).then(function (x) {
      b.disabled = false;
      if (x && x.again) { scrLogin("again", x); return; }
      if (x && x.err) { m.textContent = "❌ " + x.err; var f = x.field === "name" ? nm : emp; try { f.focus(); } catch (y) { /* 沒關係 */ } return; }
      onBoot(x);
    }, function (er) { b.disabled = false; m.textContent = "❌ " + er.message; });
  }, "pri");
  [emp, nm].forEach(function (inp) { inp.onkeydown = function (ev) { if (ev.key === "Enter") b.onclick(); }; });
  var title = need === "join" ? "最後一步：員工編號＋姓名" : need === "every" ? "打員工編號＋姓名" : "補上員工編號＋姓名（只要一次）";
  var say = need === "join" ? ["✅ 已經從 LINE 確認是你了。第一次用藥戰手冊，請打員工編號和姓名（兩個都要填），送出申請。", "開發者核可以後，你的 LINE 會收到通知，就能看手冊（核可之前看不到任何內容）。"]
    : need === "every" ? ["✅ 已經從 LINE 確認是你了。請打員工編號和姓名（要跟申請時填的一樣）。"]
    : ["✅ 已經從 LINE 確認是你了。名單上還沒有你的員工編號或姓名，補上就能進去（只要一次）。"];
  screen([logo(), h("h2", {}, [title]), h("div", { class: "scr-p" }, say.map(function (l) { return h("p", {}, [l]); })),
    h("div", { class: "scr-form" }, [h("label", {}, [h("span", {}, ["員工編號（必填）"]), emp]), h("label", {}, [h("span", {}, ["姓名（必填）"]), nm])]),
    h("div", { class: "scr-b" }, [b]), m,
    h("p", { class: "lgfine" }, ["要在 10 分鐘內送出；超過的話，重新取得代號登入。"])]);
  try { emp.focus(); } catch (e) { /* 沒關係 */ }
}
var POLL = 0, POLL2 = 0;
function stopPolls() { clearTimeout(POLL); clearInterval(POLL2); POLL = POLL2 = 0; }
/* 第 43 批：等核可的那一頁：已經從 LINE 確認是本人的（後端給了暗碼 aw，只放在這個分頁）＝核可以後自己進去（員工編號、姓名已經驗證過，不用再登入）。
   前 30 分鐘每 20 秒問一次，之後每 1 分鐘，最多 6 小時；分頁關掉、換一台：照平常登入（回 LINE 按「🌐 網頁」也可以）。 */
var AW = "";
function awSave(v) { AW = v || ""; try { if (AW) sessionStorage.setItem("hbaw", JSON.stringify({ x: X, aw: AW, ex: Date.now() + 6 * 36e5 })); else sessionStorage.removeItem("hbaw"); } catch (e) { /* 記不住就算了 */ } }
function awLoad() {
  if (AW) return AW;
  try { var o = JSON.parse(sessionStorage.getItem("hbaw") || "null"); if (o && o.x === X && TRE.test(String(o.aw || "")) && +o.ex > Date.now()) return (AW = String(o.aw)); } catch (e) { /* 沒有 */ }
  return "";
}
function scrWait(r) {
  var emp = r && r.me && r.me.emp, aw = r && TRE.test(String(r.aw || "")) ? String(r.aw) : awLoad();
  if (aw) awSave(aw);
  var stamp = h("p", { class: "muted", id: "awst" }, [aw ? "這個畫面會自己檢查（核可以後自己進去）。" : "這個畫面每 30 秒會自己檢查一次。"]);
  screen([logo(), h("h2", {}, ["⏳ 已送出申請，等開發者核可"]),
    h("div", { class: "scr-p" }, [h("p", {}, [(emp ? "員工編號 " + emp + "。" : "") + "核可後你的 LINE 會收到通知。"]),
      h("p", {}, [aw ? "✅ 員工編號、姓名已經送出：開發者核可以後，這個畫面會自己進去手冊，不用再登入（這個分頁先不要關；最多等 6 小時）。分頁關掉了也沒關係：核可以後回 LINE 按「🌐 網頁」就能看。" : "核可以後，回 LINE 打開「📘 藥戰手冊」按「🌐 網頁」就能看（或回到這個網頁重新登入）。"]),
      stamp]),
    h("div", { class: "scr-b" }, [btn("現在檢查", function () { boot(); })])]);
  var t0 = Date.now(), max = aw ? 6 * 36e5 : 30 * 6e4;
  (function loop() {
    var gap = aw ? (Date.now() - t0 < 30 * 6e4 ? 20000 : 60000) : 30000;
    POLL = setTimeout(function () {
      if (Date.now() - t0 > max) { if (aw) awSave(""); stamp.textContent = "⌛ 等太久了（超過 " + (aw ? "6 小時" : "30 分鐘") + "）：核可以後，回 LINE 按「🌐 網頁」，或重新整理這一頁登入。"; return; }
      if (document.visibilityState === "hidden") { loop(); return; }
      call("hbBoot", ["", aw]).then(function (x) {
        if (x && x.st === "wait") { if (aw && x.aw !== aw) { aw = ""; awSave(""); } loop(); return; }
        awSave(""); onBoot(x);
      }, function () { loop(); });
    }, gap);
  })();
}

/* ── 開場 ── */
function gate(cb) {
  if (!X) { cb("none"); return; }   // 不知道後端在哪：要先從 LINE 開過一次（或開發者放了 cfg.js）
  if (!XRE.test(X) || (T && !TRE.test(T))) { cb("bad"); return; }
  if (!window.fetch || !window.Promise) { cb("old"); return; }
  if (!DK || !(window.crypto && crypto.subtle && window.TextEncoder)) { cb("nodk"); return; }
  crypto.subtle.digest("SHA-256", new TextEncoder().encode(DK + "|" + X)).then(function (b) { DKX = hex(b).slice(0, 32); cb(T ? "ok" : "login"); }, function () { cb("nodk"); });   // 第 32 批：沒有鑰匙＝代號登入
}
function boot() {
  stopPolls();
  scrLoad();
  var tk = TICKET, sid = SESS;
  var prog = function (ph, got, tot) { if (sid !== SESS || !BOOT.on) return; BOOT.ph = ph; BOOT.got = got; BOOT.tot = tot; if (BOOT.tick) BOOT.tick(); };   // 第 40 批：後端做完了、下載了多少（進度條）
  var aw0 = awLoad();   // 第 43 批：等核可的暗碼（沒有就不帶：跟以前一樣）
  call("hbBoot", aw0 ? [tk, aw0] : [tk], { ms: 30000, prog: prog, onTry: function (n) { BOOT.n = n; if (n > 1) { BOOT.ph = "go"; BOOT.tq = Date.now(); } } }).then(function (r) {   // 開發者這一台還沒綁定時，後端還沒看通行證：綁好再帶一次
    // 第 35 批：自動再試過（第一次等太久沒回應）：第一次可能其實做完了、已經用掉 LINE 給的通行證 → 等 3 秒、不帶通行證再問一次（第一次做完的話，這一台已經驗證過了）
    if (tk && BOOT.n > 1 && r && (r.st === "lock" || r.st === "none") && r.bad && !BOOT.again) {
      BOOT.again = true; BOOT.step = "再確認一次";
      BOOT.ph = "go"; BOOT.tq = Date.now();
      setTimeout(function () { if (sid !== SESS) return; call("hbBoot", [""], { ms: 30000, prog: prog }).then(onBoot, bootNo); }, 3000);
      return;
    }
    onBoot(r);
  }, bootNo);
}
function bootNo(e) { scrMsg("沒辦法打開", [e && e.message || "後端沒有回應。", "可以按「再試一次」；一直不行的話，把這個畫面截圖給開發者。"], [retryBtn()]); }
/* ── 第 35 批：開場的「載入中…」：寫出現在在做什麼、等了幾秒；等太久出「再試一次」；網頁自己出錯也一定寫原因（不會一直停在載入中）── */
function scrLoad() {
  // 第 40 批：LOGO＋翻書動畫＋進度條。剛打開網頁時 hb.html 已經畫好同一個畫面（還沒載入程式就在翻書）：直接接著用，動畫不會重來
  var more = h("div", { class: "bootmore", hidden: true }, [
    h("p", { class: "muted" }, ["比平常久：可能是網路比較慢，或藥戰手冊的後端剛睡醒（很久沒人用、剛部署完的第一次會比較久，最多大約半分鐘）。"]),
    h("div", { class: "scr-b" }, [retryBtn()])]);
  var old = APP.querySelector(".bootscr .scr-in.ld");
  if (old && document.getElementById("ldFill")) {
    stopPolls(); MAIN = false;
    var hb = old.querySelector(".hbl"); if (hb) hb.remove();
    old.appendChild(more);
  } else {
    screen([h("div", { class: "ld-logo" }, [logoImg()]), h("div", { class: "ld-name" }, ["藥戰手冊"]), bookAnim(),
      h("div", { class: "ldbar", id: "ldBar", role: "progressbar", "aria-label": "載入進度", "aria-valuemin": "0", "aria-valuemax": "100" }, [h("i", { id: "ldFill" })]),
      h("p", { class: "muted ldtx", id: "bootMsg", role: "status", "aria-live": "polite" }, ["載入中…"]), more], "bootscr");
    APP.querySelector(".scr-in").classList.add("ld");
  }
  BOOT.on = true; BOOT.t0 = Date.now(); BOOT.n = 1; BOOT.step = "連線到藥戰手冊"; BOOT.again = false; BOOT.ph = "go"; BOOT.tq = Date.now(); BOOT.got = 0; BOOT.tot = 0; BOOT.pct = 0;
  var tick = function () {
    if (!BOOT.on) return;
    var now = Date.now(), sec = Math.floor((now - BOOT.t0) / 1000), w = (now - BOOT.tq) / 1000, p, t;
    if (BOOT.ph === "dl") {   // 後端做完了，正在下載（照下載了多少）
      p = BOOT.tot > 0 ? 72 + 22 * Math.min(1, BOOT.got / BOOT.tot) : 72 + 22 * (1 - Math.exp(-BOOT.got / 250000));
      t = "下載手冊" + (BOOT.got > 2048 ? "（" + Math.round(BOOT.got / 1024) + " KB）" : "") + "…";
    } else {   // 等後端：確認身分、準備手冊（後端在做，看不到裡面：慢慢往前，不會停在同一格）
      p = 18 + 52 * (1 - Math.exp(-w / 6));
      t = w < 1.2 ? "連線到藥戰手冊…" : BOOT.step === "再確認一次" ? "再確認一次…" : "確認身分、準備手冊…";
    }
    if (BOOT.n > 1) t = t.replace(/…$/, "（第 " + BOOT.n + " 次）…");
    ldSet(p, t + (sec >= 2 ? "　" + sec + " 秒" : ""));
    if (sec >= 12) more.hidden = false;
  };
  BOOT.tick = tick;
  ldSet(18, "連線到藥戰手冊…");
  POLL2 = setInterval(tick, 250);
}
// 翻書動畫（hb.html 開場的那一個一樣）
function bookAnim() { return h("div", { class: "bk", "aria-hidden": "true" }, [h("i", { class: "bk-c" }), h("i", { class: "bk-l" }), h("i", { class: "bk-r" }), h("i", { class: "bk-p" }), h("i", { class: "bk-p" }), h("i", { class: "bk-p" })]); }
// 進度條：只會往前（不會倒退）
function ldSet(p, txt) {
  var f = document.getElementById("ldFill"), m = document.getElementById("bootMsg"), b = document.getElementById("ldBar");
  p = Math.max(BOOT.pct || 0, Math.min(100, p)); BOOT.pct = p;
  if (f) { f.classList.remove("pre"); f.style.width = p.toFixed(1) + "%"; }
  if (b) b.setAttribute("aria-valuenow", String(Math.round(p)));
  if (m && txt !== undefined) m.textContent = txt + "　" + Math.round(p) + "%";
}
// 第 40 批：手冊拿到了：進度條跑到 100%，畫面先畫出來再打開手冊（一下下）
function bootDone(cb) {
  if (!BOOT.on || !document.getElementById("ldFill")) { cb(); return; }
  if (POLL2) { clearInterval(POLL2); POLL2 = 0; }
  ldSet(100, "打開手冊…");
  var sid = SESS, go = function () { if (sid === SESS) cb(); };
  if (window.requestAnimationFrame) requestAnimationFrame(function () { setTimeout(go, 60); }); else setTimeout(go, 60);
}
function bootErr(m) {   // 開場的時候網頁自己出錯（不是後端的錯）：寫原因、給「再試一次」
  if (!BOOT.on) return;
  BOOT.on = false;
  scrMsg("沒辦法打開", ["網頁出錯了：" + String(m || "不知道的錯誤").slice(0, 160), "可以按「再試一次」；一直這樣的話，把這個畫面截圖給開發者。"], [retryBtn()]);
}
window.addEventListener("error", function (e) { if (e && /hb\.js/.test(String(e.filename || ""))) bootErr(e.message || (e.error && e.error.message)); });   // 只管這個網頁自己的程式（LINE 內建瀏覽器自己加的程式出錯不算）
window.addEventListener("unhandledrejection", function (e) { var r = e && e.reason; if (r && /hb\.js/.test(String(r.stack || ""))) bootErr(r.message || String(r)); });
function onBoot(r) {
  TICKET = "";   // 通行證只用一次
  if (!r) { scrMsg("沒辦法打開", ["後端沒有回應。"], [reloadBtn()]); return; }
  if (r.err) { stop(r.err, "tok"); return; }
  if (FROMLINK && !FROMSAVED) keySave();   // 從 LINE 開的：這台記住鑰匙
  var st = r.st;
  if (st === "closed") { scrMsg("藥戰手冊還沒開放", ["請等開發者通知。"]); return; }
  if (st === "setup") { scrMsg("藥戰手冊還沒接上", ["在藥戰手冊的 Apps Script 編輯器，選 yzMoveIn → 執行一次（從補藥神器搬過來）。", "好了以後重新整理這一頁。"], [reloadBtn()]); return; }
  if (st !== "wait" && typeof awSave === "function") awSave("");   // 第 43 批：不是在等核可了：等核可的暗碼丟掉
  if (st === "need") { scrId(r); return; }   // 第 32 批：驗證過是本人了，第一次要打員工編號＋姓名
  if (st === "wait") { scrWait(r); return; }
  if (st === "no") { scrMsg("沒有通過審核", ["看不到藥戰手冊的內容。有疑問請找開發者。"]); return; }
  if (st === "off") { scrMsg("權限已經撤銷", ["你的藥戰手冊權限已經被撤銷，看不到內容了。有疑問請找開發者。"]); return; }
  if (st === "nodk") { scrMsg("這個瀏覽器不能用", [MSG_NODK]); return; }
  if (st === "lock" || st === "none") { ME = r.me || ME; if (r.cfg) { CFG = r.cfg; applyCfg(); } if (r.me && r.me.dev) LG.role = "dev"; else if (st === "none" && T) LG.mode = "code"; scrLogin(r.bad ? "bad" : "", r); return; }   // 第 32 批：代號登入；第 36 批：藥師＝員工編號＋姓名，開發者的連結＝開發者代號
  if ((st === "ok" || st === "dev") && r.data) { bootDone(function () { enterMain(r); }); return; }
  scrMsg("沒辦法打開", ["看不懂後端的回應（" + String(st) + "）。"], [reloadBtn()]);
}

// 第 43 批：LINE 的檔案連結打開手冊 → 直接打開那個檔（只能看）
function fvFromHash() {
  var m = /^(\d{1,3})\.(\d{1,2})\.([a-z0-9]{1,8})$/.exec(String(HP.f || ""));
  if (!m || !HP.t) return;
  var t = titleOf(HP.t), b = t && (t.blocks || [])[+m[1]], it = b && b.t === "link" ? _yzLinkItems_(b)[+m[2]] : null;
  if (!it || _yzLinkTag_(it.u) !== m[3]) (t && t.blocks || []).forEach(function (bb) { if (bb && bb.t === "link") _yzLinkItems_(bb).forEach(function (x) { if (_yzLinkTag_(x.u) === m[3]) it = x; }); });
  fvOpen({ tid: HP.t, bi: +m[1], ii: +m[2], tag: m[3], label: it ? _yzLinkLabel_(it) : "檔案", kind: it ? _yzLinkFileKind_(it) : "" });
}
/* ── 打開手冊：上面一排（標題、頁籤、誰、閒置倒數、登出）＋頁籤內容＋浮水印 ── */
var IDLE_MS = 30 * 6e4, LAST_ACT = Date.now(), LAST_PING = 0, TAB = "view";
// 有人改了手冊（hbPing 看到 rev 變了）：重新拿一次，看的這邊換成新的（編輯器裡還沒存的修改不動）
function refreshData() {
  call("hbData", []).then(function (x) {
    if (!MAIN || !x) return;
    if (x.st === "lock") { logout("expired"); return; }
    if (!x.data) return;
    HB = x.data; if (x.cfg) { CFG = x.cfg; applyCfg(); }
    if (typeof edBaseChanged === "function") edBaseChanged();
    if (TAB === "view") drawWeb();
    toast("手冊有更新，已經換成新的內容");
  }, function () { /* 下次再說 */ });
}
function enterMain(r) {
  stopPolls();
  OUTED = false;
  HB = r.data; CFG = r.cfg || CFG || {}; ME = r.me || {}; IS_DEV = r.st === "dev"; if (r.v) BACKV = String(r.v);
  applyCfg();
  MAIN = true; LAST_ACT = Date.now(); LAST_PING = Date.now();
  APP.className = "app hb-on"; APP.innerHTML = "";
  var tabs = h("nav", { class: "tabs", role: "tablist", "aria-label": "頁籤" });
  [["view", "📘 看手冊"], ["edit", "✏️ 編輯"], ["admin", "👥 管理"]].forEach(function (p) {
    if (p[0] !== "view" && !IS_DEV) return;
    tabs.appendChild(h("button", { class: "tab", type: "button", role: "tab", "data-t": p[0], "aria-selected": "false", onclick: function () { showTab(p[0]); } }, [p[1]]));
  });
  var who = (ME.name || "") + (ME.emp ? "　" + ME.emp : "") + (IS_DEV && ME.name !== "開發者" ? "　（開發者）" : "");
  var hdr = h("header", { class: "hdr", id: "hdr" }, [h("div", { class: "hrow" }, [
    h("button", { class: "hlogo", type: "button", title: "回首頁（手冊目錄）", onclick: function () { goHomeTab(); } }, [logoImg(), "藥戰手冊"]), IS_DEV ? tabs : null, h("span", { class: "sp" }),
    h("span", { class: "who" }, [who]), h("span", { class: "idle", id: "idle" }, [""]),
    btn("登出", function () { logout("out"); }, "sm")
  ])]);
  APP.appendChild(hdr);
  APP.appendChild(h("main", { class: "panes" }, [h("div", { class: "pane", id: "pane-view" }), IS_DEV ? h("div", { class: "pane", id: "pane-edit" }) : null, IS_DEV ? h("div", { class: "pane", id: "pane-admin" }) : null]));
  if (CFG.watermark !== false) APP.appendChild(h("div", { class: "wm", id: "wm", "aria-hidden": "true" }));
  paintWm();
  buildView();
  if (IS_DEV) { buildEditPane(); buildAdminPane(); }
  syncTabsH();
  var qeBack = IS_DEV && typeof qeRestore === "function" && qeRestore();   // 第 32 批：還沒存的問卷
  if (IS_DEV && KEEP_ED) { edRestore(KEEP_ED); KEEP_ED = null; showTab("edit"); toast("接著剛剛還沒儲存的修改（還沒存進手冊）"); }
  else if (qeBack) { ED.mode = "qz"; ED.cur = { kind: "qz", id: "" }; ED.view = "web"; showTab("edit"); toast("接著剛剛還沒儲存的問卷（還沒存進問卷試算表）"); }
  else if (IS_DEV && HP.edit && edTitleExists(HP.edit)) { gotoEdit(HP.edit); }
  else { showTab("view"); if (HP.t && titleOf(HP.t)) { openTitle(HP.t); fvFromHash(); } }   // 第 43 批：LINE 檔案連結（&f＝第幾塊.第幾個.指紋）→ 打開那個檔
  HP.t = HP.edit = HP.f = "";
  idleTick();
  guardSync();
}
function showTab(name) {
  if (!MAIN) return;
  if ((name === "edit" || name === "admin") && !IS_DEV) name = "view";
  TAB = name;
  if (name !== "view") homeClass(false);   // 首頁（滿版）只在「看手冊」；編輯、管理照舊有上面那一排
  $$(".tab").forEach(function (t) { t.setAttribute("aria-selected", t.getAttribute("data-t") === name ? "true" : "false"); });
  $$(".pane").forEach(function (p) { p.classList.toggle("on", p.id === "pane-" + name); });
  syncTabsH();
  if (name === "edit") { renderEdit(); if (typeof edOnShow === "function") edOnShow(); } else if (typeof pvSync === "function") pvSync();
  if (name === "view") drawWeb();
  if (name === "admin") adminLoad();
  guardSync();   // 第 41 批：看手冊＝不能複製、截圖遮住；編輯、管理（開發者）不擋
}
function syncTabsH() { var t = $("#hdr"); if (t) document.documentElement.style.setProperty("--tabsH", t.offsetHeight + "px"); }
window.addEventListener("resize", syncTabsH);
// 浮水印：名字＋員工代號＋時間（每分鐘換一次時間）
// 第 41 批：浮水印加重（怕用別的手機、平板拍）：兩行（姓名＋員工代號／日期時間＋「內部資料勿外傳」），字比較大、比較粗、比較密（兩層錯開）；
//   深色字＋白邊：白底、深色底都看得到（拍下來也看得出是誰、什麼時候）。不能影響查閱：濃度 0.11（以前 0.075），內容的字照樣清楚
var WM_W = 320, WM_H = 210;
function wmCss(lines) {
  var cx = WM_W / 2, cy = WM_H / 2;
  var t = function (dy, s, sz, w) { return '<text x="' + cx + '" y="' + (cy + dy) + '" font-size="' + sz + '" font-weight="' + w + '" font-family="sans-serif" text-anchor="middle" fill="#0F172A" stroke="#fff" stroke-width="3" stroke-linejoin="round" paint-order="stroke">' + esc(s) + "</text>"; };
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + WM_W + '" height="' + WM_H + '"><g transform="rotate(-26 ' + cx + " " + cy + ')">' + t(-4, lines[0], 19, 700) + t(18, lines[1], 13.5, 600) + "</g></svg>";
  var u = 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
  return u + "," + u;   // 兩層錯開（hb.css 的 .wm：background-position）
}
function wmText() {
  var who = [ME && ME.name, ME && ME.emp, ME && !ME.emp && ME.tail ? "…" + ME.tail : ""].filter(Boolean).join("　");
  return [who || "藥戰手冊", stamp() + "　內部資料勿外傳"];
}
var WM_LV = [0, 0.05, 0.08, 0.11, 0.15];   // 第 43 批：浮水印濃淡（管理頁 ②：1 很淡、2 淡（預設）、3 中（第 41 批的濃度）、4 濃）
function wmLv() { var v = parseInt(CFG && CFG.wmLv, 10); return v >= 1 && v <= 4 ? v : 2; }
function paintWm() { var w = $("#wm"); if (w) { w.style.backgroundImage = wmCss(wmText()); w.style.setProperty("--wmo", String(WM_LV[wmLv()])); } }

/* ── 第 41 批：看手冊的時候不能複製、盡量不能截圖（內部資料）──
   網頁沒辦法 100% 擋住截圖（手機的截圖鍵、用另一支手機拍，網頁都不會知道）：所以浮水印加重（拍下來看得出是誰）；其他能擋的都擋：
   ① 不能選字、不能複製（Ctrl+C）、不能右鍵／長按另存圖片、不能拖、不能列印（Ctrl+P）、不能存網頁（Ctrl+S）、不能看原始碼（Ctrl+U）、盡量不能開「開發人員工具」。
      「反灰可複製」那幾條照樣可以按「📋 複製」；打字的框（搜尋…）照樣可以用；瀏覽器的「尋找」（Ctrl+F）照常。
   ② 電腦上常見的截圖：按 PrintScreen → 剪貼簿裡的截圖換成一句「內部資料」、畫面遮住一下；按 ⊞／⌘＋Shift（Windows、Mac 截圖鍵的開頭）→ 畫面先遮住，
      點一下、按任何鍵就顯示。切到別的分頁、縮到最小、手機切到別的 App（看不到這一頁的時候）→ 遮住（多工畫面看不到內容），一回來就顯示。
   不能影響查閱：只是切到別的視窗（例如左右並排、一邊看手冊一邊打醫令）不遮，照常可以看；搜尋框、「反灰可複製」照常。
   開發者在「✏️ 編輯」「👥 管理」時不擋（要複製、貼上）。 */
var GUARD = { on: false, el: null, toastAt: 0, keyCover: false, t: 0 };
function guardWant() { return !!(MAIN && (TAB === "view" || !IS_DEV)); }
function guardSync() {
  GUARD.on = guardWant();
  document.body.classList.toggle("guard", GUARD.on);
  if (GUARD.on) guardEl();   // 遮住的那一層先做好（LOGO 先載入）：按截圖鍵的那一下馬上遮得住
  else { GUARD.keyCover = false; guardShow(false); }
}
function guardEl() {
  if (!GUARD.el) {
    GUARD.el = h("div", { class: "guardcv", "aria-hidden": "true" }, [h("div", { class: "gcv-in" }, [logoImg("gcv-lg"), h("b", {}, ["藥戰手冊　內部資料"]), h("p", { class: "gcv-m" }, [""])])]);
    document.body.appendChild(GUARD.el);
  }
  return GUARD.el;
}
function guardSay(msg) { if (Date.now() - GUARD.toastAt > 2500) { GUARD.toastAt = Date.now(); toast(msg); } }
function guardFree(t) {   // 這裡可以選字、複製：打字的框、反灰可複製
  t = t && t.nodeType === 3 ? t.parentNode : t;
  return !!(t && t.closest && t.closest("input, textarea, select, [contenteditable='true'], .ycp-t, .ycp-b"));
}
function guardSelFree() {   // 選起來的字都在可以複製的地方（沒選＝也算）
  var s = window.getSelection ? getSelection() : null;
  if (!s || !s.rangeCount || s.isCollapsed) return true;
  return guardFree(s.anchorNode) && guardFree(s.focusNode);
}
function guardShow(on, why) {   // 遮住整個畫面（只是蓋住看不到；點一下、按任何鍵、回到這個視窗就拿掉）
  if (on && (!GUARD.on || GUARD.bye)) return;   // bye：要離開這一頁了（換頁、重新整理）：不用遮
  if (!GUARD.el && !on) return;
  guardEl().classList.toggle("on", !!on);
  if (on) GUARD.el.querySelector(".gcv-m").textContent = why || "畫面先遮住了：點一下、按任何鍵就會顯示。";
}
function guardBack() { GUARD.keyCover = false; clearTimeout(GUARD.t); guardShow(false); }   // 人回來了（點一下、按鍵、回到這個視窗）
function guardShot() {   // 按了 PrintScreen：剪貼簿裡的截圖換成一句話、畫面遮住一下
  guardShow(true, "內部資料：不能截圖。");
  try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText("藥戰手冊：內部資料，不能截圖。").catch(function () { /* 換不掉也沒關係 */ }); } catch (x) { /* 沒關係 */ }
  clearTimeout(GUARD.t); GUARD.t = setTimeout(function () { if (!GUARD.keyCover && (!document.hasFocus || document.hasFocus())) guardShow(false); }, 1500);
}
function guardCopy(e) {
  if (!GUARD.on || guardSelFree() || guardFree(e.target)) return;
  e.preventDefault();
  try { if (e.clipboardData) e.clipboardData.setData("text/plain", "藥戰手冊：內部資料，不能複製。"); } catch (x) { /* 沒關係 */ }
  guardSay("🔒 內部資料：不能複製");
}
document.addEventListener("copy", guardCopy, true);
document.addEventListener("cut", guardCopy, true);
document.addEventListener("contextmenu", function (e) { if (!GUARD.on || guardFree(e.target)) return; e.preventDefault(); guardSay("🔒 內部資料：不能另存、不能複製"); }, true);
document.addEventListener("dragstart", function (e) { if (!GUARD.on || guardFree(e.target)) return; e.preventDefault(); }, true);
document.addEventListener("selectstart", function (e) { if (!GUARD.on || guardFree(e.target)) return; e.preventDefault(); }, true);
document.addEventListener("keydown", function (e) {
  if (!GUARD.on) return;
  var k = (e.key || "").toLowerCase(), mod = e.ctrlKey || e.metaKey;
  if (k === "printscreen" || e.keyCode === 44) { guardShot(); return; }
  if (e.metaKey && e.shiftKey) { GUARD.keyCover = true; clearTimeout(GUARD.t); guardShow(true, "按了截圖鍵（⊞／⌘＋Shift）：畫面先遮住了；點一下、按任何鍵就會顯示。"); return; }
  if (!/^(shift|control|meta|alt|os)$/.test(k) && GUARD.el && GUARD.el.classList.contains("on")) guardBack();   // 按任何鍵＝回來了
  if (k === "f12" || (mod && e.shiftKey && /^[ijc]$/.test(k)) || (e.metaKey && e.altKey && /^[ijcu]$/.test(k))) { e.preventDefault(); return; }   // 開發人員工具（盡量）
  if (mod && !e.altKey && !e.shiftKey) {
    if (k === "p") { e.preventDefault(); guardSay("🔒 內部資料：不能列印"); return; }
    if (k === "s" || k === "u") { e.preventDefault(); guardSay("🔒 內部資料：不能存檔"); return; }
    if (guardFree(e.target)) return;   // 打字的框：照常（全選、複製、貼上）
    if ((k === "c" || k === "x") && !guardSelFree()) { e.preventDefault(); guardSay("🔒 內部資料：不能複製"); return; }
    if (k === "a") { e.preventDefault(); return; }   // 全選
  }
}, true);
document.addEventListener("keyup", function (e) { if (GUARD.on && (e.key === "PrintScreen" || e.keyCode === 44)) guardShot(); }, true);   // Windows 的 PrintScreen 通常只收得到放開的那一下
window.addEventListener("focus", function () { if (GUARD.on) guardBack(); });
window.addEventListener("pagehide", function () { GUARD.bye = true; });
window.addEventListener("pageshow", function () { GUARD.bye = false; });
window.addEventListener("pointerdown", function () { if (GUARD.on) guardBack(); }, true);
document.addEventListener("visibilitychange", function () { if (!GUARD.on) return; if (document.visibilityState === "hidden") guardShow(true, "切到別的地方了：回到這一頁就會顯示。"); else guardBack(); });   // 只是切到別的視窗（還看得到這一頁）不遮：不影響查閱

/* ── 閒置自動登出 ── */
function act() {
  LAST_ACT = Date.now();
  if (MAIN && Date.now() - LAST_PING > 4 * 6e4) {   // 有在動：每 4 分鐘讓後端也知道（後端那邊的驗證才不會先過期）
    LAST_PING = Date.now();
    call("hbPing", []).then(function (x) {
      if (!MAIN) return;
      if (x && x.st === "lock") { logout("expired"); return; }
      if (x && x.st) { MAIN = false; lockClean(); onBoot(x); return; }   // 被撤銷了、手冊關了
      if (x && x.rev && HB && x.rev !== HB.rev) refreshData();           // 有人改了手冊：看的這邊換成新的
    }, function () { /* 網路不好：下次再說 */ });
  }
}
["pointerdown", "keydown", "wheel", "touchstart", "input"].forEach(function (ev) { window.addEventListener(ev, act, { capture: true, passive: true }); });
window.addEventListener("scroll", act, { capture: true, passive: true });
function idleTick() {
  if (!MAIN) return;
  var left = IDLE_MS - (Date.now() - LAST_ACT);
  if (left <= 0) { logout("idle"); return; }
  var s = Math.ceil(left / 1000);
  var mmss = Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2);
  $$(".idle").forEach(function (e) { e.textContent = e.classList.contains("short") ? "⏱ " + mmss : "閒置 " + mmss + " 後自動登出"; e.classList.toggle("soon", s <= 60); });   // 上面那一排、首頁右上角（手機上用短的「⏱ 29:59」）
}
setInterval(idleTick, 1000);
setInterval(function () { if (MAIN) paintWm(); }, 60000);
document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") idleTick(); });
// 登出：內容從畫面、記憶體拿掉（還沒存的修改只留在記憶體，驗證後接著編輯）；後端那邊這一台的驗證作廢
function lockClean() {
  try { if (WV && WV.pano) { WV.pano.destroy(); WV.pano = null; } } catch (e) { /* 沒關係 */ }
  try { if (typeof PV !== "undefined" && PV.pano) { PV.pano.destroy(); PV.pano = null; } } catch (e) { /* 沒關係 */ }
  $$(".lightbox, .bigov, #pvwin, .modal").forEach(function (x) { x.remove(); });
  catBlobDrop();
  if (typeof qzReset === "function") qzReset();   // 第 32 批：還沒送出的問卷答案也丟掉
  if (typeof RTE !== "undefined") RTE.clip = null;   // 第 32 批：「📋 複製」的內容也丟掉（手冊內容只在記憶體）
  if (typeof ED_CLIP !== "undefined") ED_CLIP = null;
  if (typeof exClear === "function") { exClear(); EXP = null; }   // 第 37 批：匯出的 zip（記憶體裡的）也收掉
  HB = null;
}
var OUTED = false;   // 這邊自己登出的（後端那邊也要確定作廢，才可以出驗證碼）
function hbOut(n) { return post("hbOut", [], 8000).then(function (j) { if (!j || j.ok !== 1) throw new Error("x"); }).catch(function () { if ((n || 0) < 2) return new Promise(function (ok) { setTimeout(ok, 1200); }).then(function () { return hbOut((n || 0) + 1); }); throw new Error("登出沒有送到後端"); }); }
function logout(why) {
  if (!MAIN) return;
  if (IS_DEV && typeof ED !== "undefined" && ED && ED.dirty) KEEP_ED = edKeep();
  if (IS_DEV && typeof qeKeep === "function") { KEEP_QE = qeKeep() || KEEP_QE; qeDrop(); }   // 還沒存的問卷：留在記憶體，驗證後接著改
  MAIN = false; OUTED = true;
  guardSync();
  lockClean();
  if (typeof ED !== "undefined") ED = null;
  screen([logo(), h("h2", {}, [why === "idle" ? "閒置太久，登出中…" : "登出中…"])]);
  var sid = ++SESS;
  if (IS_DEV) LG.role = "dev";   // 第 32 批：開發者登出：登入畫面直接出開發者代號（才拿得到能編輯的鑰匙）
  hbOut().then(function () { if (sid === SESS) scrLogin(why); }, function () { if (sid === SESS) scrMsg("已登出", ["手冊內容已經從畫面上拿掉。", "（網路不好，登出還沒送到後端；網路好了請重新載入。）"], [reloadBtn()]); });
}
window.addEventListener("beforeunload", function (e) { if (MAIN && IS_DEV && ((typeof ED !== "undefined" && ED && ED.dirty) || (typeof QE !== "undefined" && QE && (QE.dirty || QE.bDirty)))) { e.preventDefault(); e.returnValue = ""; } });

/* ── 小視窗（取代瀏覽器的 confirm，網頁不用跳出系統視窗）── */
function modal(o) {
  var bx = h("div", { class: "modal", role: "dialog", "aria-modal": "true" });
  var close = function () { bx.remove(); };
  var dlg = h("div", { class: "dlg" }, [h("h3", {}, [o.title || ""]), h("div", { class: "dlg-p" }, (o.lines || []).map(function (l) { return h("p", {}, [l]); })),
    h("div", { class: "dlg-b" }, (o.buttons || []).map(function (b) { return btn(b.label, function () { close(); if (b.fn) b.fn(); }, b.cls || "sm"); }))]);
  bx.appendChild(dlg); document.body.appendChild(bx);
  var f = $("button", dlg); if (f) try { f.focus(); } catch (e) { /* 沒關係 */ }
  bx.onkeydown = function (e) { if (e.key === "Escape") close(); };
  return close;
}

/* ── 目錄圖的原始檔（3D 目錄要用；只放記憶體，登出就丟掉）── */
var CATBLOB = { url: "", fid: "", busy: false, err: false };
function catBlobDrop() { if (CATBLOB.url) try { URL.revokeObjectURL(CATBLOB.url); } catch (e) { /* 沒關係 */ } CATBLOB = { url: "", fid: "", busy: false, err: false }; }
function catBlob(cat, cb) {   // 拿到了回 blob 網址；還在拿回 ""（拿到後叫 cb）；拿不到回 null
  if (!cat || !cat.img || !cat.fid) return null;
  if (CATBLOB.fid === cat.fid && CATBLOB.url) return CATBLOB.url;
  if (CATBLOB.fid === cat.fid && CATBLOB.err) return null;
  if (CATBLOB.fid === cat.fid && CATBLOB.busy) return "";
  catBlobDrop(); CATBLOB.fid = cat.fid; CATBLOB.busy = true;
  var sid = SESS, fid = cat.fid;
  call("hbCatImg", []).then(function (x) {
    if (sid !== SESS || CATBLOB.fid !== fid) return;
    CATBLOB.busy = false;
    if (!x || !x.b64) { CATBLOB.err = true; if (x && x.st === "lock") { logout("expired"); return; } if (cb) cb(); return; }
    var bin = atob(x.b64), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    CATBLOB.url = URL.createObjectURL(new Blob([u], { type: x.mime || "image/jpeg" }));
    if (cb) cb();
  }, function () { if (CATBLOB.fid !== fid) return; CATBLOB.busy = false; CATBLOB.err = true; if (cb) cb(); });
  return "";
}

/* ── 不同的後端（這台原本連的，跟這條連結的不一樣）：問一下用哪一個 ── */
function backendCheck(cb) {
  var RX = CFGX || (SAVED ? SAVED.x : bxLoad());
  if (!RX || !HP.x || RX === HP.x || !XRE.test(HP.x)) { cb(); return; }
  scrMsg("⚠️ 這條連結要連到不同的後端", ["這台原本連的後端（…" + RX.slice(-6) + "），跟這條連結的（…" + HP.x.slice(-6) + "）不一樣。", "如果這條連結不是你自己從 LINE 按的，請直接關掉這個網頁。"], [
    btn("用原本連的", function () { X = RX; try { history.replaceState(null, "", location.pathname); } catch (e) { /* 沒關係 */ } if (SAVED && SAVED.x === RX) { T = SAVED.t; FROMSAVED = true; FROMLINK = false; } else { T = ""; } TICKET = ""; cb(); }, "pri"),
    btn("用這條連結的", function () { cb(); })
  ]);
}

function start() {
  APP = $("#app");
  if (window.top !== window.self) { try { document.documentElement.innerHTML = ""; } catch (e) { /* 沒關係 */ } return; }   // 不讓別的網站用框框包住
  scResolve(function () { backendCheck(function () {   // 第 38 批：短連結先解出後端位置
    gate(function (g) {
      if (g === "ok") { API = "https://script.google.com/macros/s/" + X + "/exec"; boot(); return; }   // 第 35 批：「載入中…」由 boot() 畫（寫進度、秒數）
      if (g === "login") { API = "https://script.google.com/macros/s/" + X + "/exec"; scrLogin(""); return; }   // 第 32 批：沒有鑰匙 → 代號登入
      if (g === "nodk") { scrMsg("這個瀏覽器不能用", [MSG_NODK]); return; }
      if (g === "old") { scrMsg("瀏覽器太舊", ["請改用最新的 Chrome 或 Safari。"]); return; }
      if (g === "bad") { scrMsg("連結不完整", [MSG_LINE]); return; }
      if (SCERR) { scrFirst(SCERR); return; }   // 第 38 批；第 42 批：自己的連結打不開（cfg.js 還沒放、對不上）→ 寫原因，也可以貼一條新的
      scrFirst(SCOLD ? "old" : "");   // 第 42 批：這台不知道後端在哪 → 請從 LINE 複製自己的連結（貼在這裡也可以）
    });
  }); });
}

/* ════════ view.js ════════ */
/* ═══════════════ view.js：看手冊（首頁、章、標題、搜尋）＋畫內容的零件（編輯器的網頁預覽也用）═══════════════ */

/* ───────── 畫「內容」的零件 ───────── */
function hlNodes(text, hl, sq) {   // 搜尋的字用 <mark> 標出來（sq＝不管空白：圖片裡的字）
  text = String(text === undefined || text === null ? "" : text);
  if (!hl || !hl.length) return [text];
  return _yzHL_(text, hl, sq).map(function (g) { return g.h ? h("mark", {}, [g.t]) : g.t; });
}
// 第 31 批：公式 → 網頁上上下排的分數、次方、下標、根號（不靠外掛，用一般的 HTML＋CSS 排；每種瀏覽器都一樣）
// 第 32 批：排版要用的樣式直接寫在每個元件上（FXS），不靠 hb.css：GitHub 上 hb.css 慢一步更新、或沒換到，公式也不會散掉（第 31 批有人遇到）
var FXS = {
  fx: "display:inline-flex;align-items:center;white-space:nowrap;vertical-align:middle;line-height:1.2;margin:0 .1em;max-width:100%",
  r: "display:inline-flex;align-items:center",
  f: "display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 .15em",
  u: "display:block;padding:0 .2em .08em;text-align:center",
  d: "display:flex;justify-content:center;align-self:stretch;padding:.08em .2em 0;border-top:.08em solid currentColor",
  sup: "font-size:.68em;line-height:1;position:relative;vertical-align:0;top:-.55em",
  sub: "font-size:.68em;line-height:1;position:relative;vertical-align:0;top:.35em",
  ss: "display:inline-flex;flex-direction:column;font-size:.68em;line-height:1;margin-left:.05em",
  ssi: "font-size:1em;top:0;position:relative;vertical-align:0;line-height:1",
  q: "display:inline-flex;align-items:stretch;margin:0 .05em",
  qs: "display:inline-block;flex:0 0 .7em;width:.7em;min-height:1.2em;position:relative",
  qb: "display:inline-flex;align-items:center;padding:.14em .15em 0 .08em;border-top:.08em solid currentColor",
  o: "padding:0 .06em", ob: "padding:0 .28em", sp: "display:inline-block;width:.3em", p: "font-size:1.1em"
};
function fxNode(n) {
  if (!n) return h("span", {});
  switch (n.k) {
    case "num": return h("span", { class: "fxn" }, [n.t]);
    case "id": return h("span", { class: "fxi" }, [n.t]);   // 不用斜體：藥師寫的多半是單位、縮寫（mg/m²、CrCl）
    case "sp": return h("span", { class: "fxs", style: FXS.sp }, [" "]);
    case "op": return h("span", { class: "fxo", style: FXS.o }, [n.t]);
    case "seq": return h("span", { class: "fxr", style: FXS.r }, n.a.map(function (x, i) {
      var e = fxNode(x), pv = n.a[i - 1];
      if (x.k === "op" && YZ_FX_SP[x.t] && pv && pv.k !== "op" && pv.k !== "sp") { e.classList.add("b"); e.style.cssText = FXS.ob; }   // 二元運算：前後空一點
      return e;
    }));
    case "par": return h("span", { class: "fxr", style: FXS.r }, [h("span", { class: "fxp", style: FXS.p }, [n.o]), fxNode(n.a), h("span", { class: "fxp", style: FXS.p }, [n.c])]);
    case "grp": return fxNode(n.a);
    case "frac": return h("span", { class: "fxf", style: FXS.f }, [h("span", { class: "fxu", style: FXS.u }, [fxNode(n.n)]), h("span", { class: "fxd", style: FXS.d }, [fxNode(n.d)])]);
    case "sup": return h("span", { class: "fxr", style: FXS.r }, [fxNode(n.b), h("sup", { class: "fxsup", style: FXS.sup }, [fxNode(n.s)])]);
    case "sub": return h("span", { class: "fxr", style: FXS.r }, [fxNode(n.b), h("sub", { class: "fxsub", style: FXS.sub }, [fxNode(n.s)])]);
    case "subsup": return h("span", { class: "fxr", style: FXS.r }, [fxNode(n.b), h("span", { class: "fxss", style: FXS.ss }, [h("sup", { class: "fxsup", style: FXS.ssi }, [fxNode(n.sup)]), h("sub", { class: "fxsub", style: FXS.ssi }, [fxNode(n.sub)])])]);
    case "sqrt": return h("span", { class: "fxq", style: FXS.q }, [h("span", { class: "fxqs", style: FXS.qs, html: FX_ROOT }), h("span", { class: "fxqb", style: FXS.qb }, [fxNode(n.a)])]);   // 根號：勾勾跟著裡面的高度拉長，上面一條線
  }
  return h("span", {});
}
var FX_ROOT = '<svg viewBox="0 0 12 24" preserveAspectRatio="none" aria-hidden="true" focusable="false" style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible"><path d="M0.6 13.6 L3 11.9 L6.1 22.9 L11.4 0.6 L12 0.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>';
function fxEl(src) {   // 一個公式（念螢幕的軟體念一行的寫法：1/6 → ¹⁄₆）
  var lin = _yzFxLinear_(src);
  return h("span", { class: "fx", role: "math", "aria-label": lin, title: lin, style: FXS.fx }, [fxNode(_yzFxParse_(src))]);
}
// 第 32 批：反灰可複製（[cp]…[/cp]）：灰底的一條（字可以選）＋旁邊「📋 複製」（按了就複製好，直接去貼上）。樣式直接寫在元件上（hb.css 舊的也一樣）
var CPS = {
  w: "display:inline-flex;align-items:center;flex-wrap:wrap;gap:.35em;max-width:100%;vertical-align:middle;margin:.12em .2em",
  t: "background:#EEF1F5;border:1px solid #C5CED8;border-radius:6px;padding:.1em .5em;color:#1F2937;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,'Noto Sans TC',monospace;font-size:.94em;line-height:1.5;overflow-wrap:anywhere;-webkit-user-select:all;user-select:all;font-weight:400;font-style:normal;text-decoration:none",
  b: "display:inline-flex;align-items:center;gap:.2em;border:1px solid #0E7C76;background:#0E7C76;color:#fff;border-radius:999px;padding:.12em .7em;font-size:.84em;font-weight:700;line-height:1.4;cursor:pointer;white-space:nowrap;font-family:inherit"
};
function copyText(text) {   // 複製到剪貼簿：Promise（true＝好了）。新的瀏覽器用 clipboard；不行就用舊的方法（選起來、copy）
  return new Promise(function (ok) {
    var old = function () {
      var ta = h("textarea", { "aria-hidden": "true", style: "position:fixed;left:-9999px;top:0;opacity:0" }); ta.value = text; document.body.appendChild(ta);
      var done = false; try { ta.select(); done = document.execCommand("copy"); } catch (e) { done = false; }
      ta.remove(); ok(!!done);
    };
    try { if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext !== false) { navigator.clipboard.writeText(text).then(function () { ok(true); }, old); return; } } catch (e) { /* 換舊的方法 */ }
    old();
  });
}
function cpEl(text, hl) {
  var short = text.length > 36 ? text.slice(0, 36) + "…" : text;
  var b = h("button", { type: "button", class: "ycp-b", style: CPS.b, title: "複製：" + text, "aria-label": "複製「" + short + "」" }, ["📋 複製"]);
  b.onclick = function (e) {
    e.preventDefault(); e.stopPropagation();
    copyText(text).then(function (ok) {
      if (!ok) { toast("❌ 沒有複製成功：請把灰底的字選起來，按 Ctrl+C（手機：長按）"); return; }
      toast("📋 已複製「" + short + "」：直接去貼上就好");
      b.textContent = "✅ 已複製"; clearTimeout(b._t); b._t = setTimeout(function () { if (b.isConnected) b.textContent = "📋 複製"; }, 1800);
    });
  };
  return h("span", { class: "ycp", style: CPS.w }, [h("span", { class: "ycp-t", style: CPS.t }, hlNodes(text, hl)), b]);
}
// 一行字裡一小段一小段（各有自己的格式）→ 網頁上的 span。搜尋的字照樣用 <mark> 標出來
// 第 41 批：文字框（[x=…]）：連在一起、框一樣的那幾段包成一個框（像 Word 的字元框線）
function rtKids(runs, hl) {
  var out = [];
  _yzRtBoxGroups_(runs).forEach(function (g) {
    var kids = rtKids1(g.runs, hl), css = g.x ? _yzRtBoxCss_(g.x, g.runs) : "";
    if (css) out.push(h("span", { class: "rtx", "data-x": g.x, style: css }, kids)); else out = out.concat(kids);
  });
  return out;
}
function rtKids1(runs, hl) {
  var out = [];
  (runs || []).forEach(function (r) {
    if (r.cp) { out.push(cpEl(r.t, hl)); return; }   // 第 32 批：反灰可複製（自己的樣子，外面的粗體、顏色不套）
    var kids = r.fx ? [fxEl(r.t)] : hlNodes(r.t, hl);   // 第 31 批：公式
    if (!(r.b || r.i || r.u || r.s || r.c || r.z || r.m)) { out = out.concat(kids); return; }
    var mk = r.m && YZ_RT_MARKS[r.m];   // 第 30 批：螢光筆（底色）
    var cls = "rt" + (r.b ? " rt-b" : "") + (r.i ? " rt-i" : "") + (r.u ? " rt-u" : "") + (r.s ? " rt-s" : "") + (r.z && YZ_RT_SIZES[r.z] ? " rt-z" + r.z : "") + (mk ? " rt-m" : "");
    var sp = h("span", { class: cls }, kids);
    var zz = r.z && !YZ_RT_SIZES[r.z] ? _yzRtSz_(r.z) : null; if (zz) sp.style.fontSize = zz.em + "em";   // 第 40 批：點數（12 點＝1 倍）
    if (r.c && YZ_RT_COLORS[r.c]) sp.style.color = YZ_RT_COLORS[r.c];
    if (mk) { sp.style.backgroundColor = mk.bg; sp.setAttribute("data-m", r.m); }
    out.push(sp);
  });
  return out;
}
// 一段文字 → 網頁。o.plain：整段當一般字（備註）；o.go(標題代號)→{label}、o.onTitle(標題代號)：「連結到標題」的行
function webText(v, hl, o) {
  o = o || {};
  var box = h("div", { class: "txtb" }), ls = _yzParseLines_(v, o.plain), i = 0, j;
  function ind(L) { return L.lv ? "padding-left:" + (L.lv * 1.6) + "em" : ""; }
  function indM(L) { return L.lv ? "margin-left:" + (L.lv * 1.6) + "em;" : ""; }   // 有框、有底色的（標註、引用、分隔線）：整個框往右移（第 27 批：任何內容都能縮排）
  while (i < ls.length) {
    var L = ls[i];
    if (L.k === "gap") { box.appendChild(h("div", { style: "height:.45em" })); i++; continue; }
    if (L.k === "hr") { box.appendChild(h("hr", { class: "rt-hr", style: indM(L) })); i++; continue; }
    if (L.k === "go") {
      var tg = o.go ? o.go(L.go) : null;
      if (tg && tg.label) box.appendChild(h("a", { class: "rt-go" + (tg.kind === "c" ? " ch" : ""), href: "#", style: ind(L), onclick: function (id, kind) { return function (e) { e.preventDefault(); if (kind === "c") { if (o.onChapter) o.onChapter(id); } else if (o.onTitle) o.onTitle(id); }; }(L.go, tg.kind) }, [h("span", {}, [tg.kind === "c" ? "📚" : "→"]), h("b", {}, [tg.label]), h("span", {}, ["›"])]));   // 第 27 批：也能連到整章
      i++; continue;
    }
    if (L.k === "tbl") {   // 第 29 批：文字裡的表格（跟著這一行的縮排）
      var TB = o.tbls && o.tbls[L.tbl];
      if (TB) { var tw = webTable(TB, hl); tw.className += " rt-tbl"; if (L.lv) tw.style.marginLeft = (L.lv * 1.6) + "em"; box.appendChild(tw); }
      i++; continue;
    }
    if (L.k === "img") {   // 第 28 批：文字和圖片放在同一塊（圖跟著這一行的縮排）
      var P = o.pics && o.pics[L.img];
      if (P && P.url) box.appendChild(webFig(P, { hl: hl, onImg: o.onImg, cls: "rt-img", style: indM(L) }));
      i++; continue;
    }
    if (L.k === "box") {
      var T = _yzRtTone_(L.tone), lines = [];   // 第 39 批：顏色＋符號（不要符號：沒有圖示那一欄）
      for (j = i; j < ls.length && ls[j].k === "box" && ls[j].tone === L.tone && (ls[j].lv || 0) === (L.lv || 0); j++) lines.push(h("div", { class: "rt-bl" }, rtKids(ls[j].runs, hl)));
      box.appendChild(h("div", { class: "rt-box" + (lines.length > 1 ? " rows" : "") + (T.icon ? "" : " noic"), "data-tone": L.tone, style: indM(L) + "background:" + T.bg + ";border-color:" + T.bd + ";color:" + T.ink + ";--bd:" + T.bd }, (T.icon ? [h("span", { class: "rt-ic" }, [T.icon])] : []).concat([h("div", { class: "rt-bb" }, lines)])));   // 第 28 批：好幾行＝一行一列、中間一條線（跟編輯器一樣）
      i = j; continue;
    }
    if (L.k === "quote") {
      var qs = [];
      for (j = i; j < ls.length && ls[j].k === "quote" && (ls[j].lv || 0) === (L.lv || 0); j++) qs.push(h("div", { class: "rt-bl" }, rtKids(ls[j].runs, hl)));
      box.appendChild(h("div", { class: "rt-quote", style: indM(L) }, qs));
      i = j; continue;
    }
    if (L.k === "head") {
      var H = YZ_RT_HEAD["h" + L.h];
      box.appendChild(h("div", { class: "rt-h rt-h" + L.h, style: "font-size:" + H.em + "em;color:" + H.color + (L.lv ? ";padding-left:" + (L.lv * 1.6 / H.em).toFixed(2) + "em" : "") }, rtKids(L.runs, hl)));   // 標題字比較大：縮排用內文的 em 算（跟其他行對齊）
    } else if (L.k === "item") {
      box.appendChild(h("div", { class: "li", style: ind(L) }, [h("span", { class: "mkr" }, [L.mark]), h("span", {}, rtKids(L.runs, hl))]));
    } else box.appendChild(h("div", { class: "txt", style: ind(L) }, rtKids(L.runs, hl)));
    i++;
  }
  return box;
}
// 表格：欄寬預設自動（照內容分）；開發者指定了比例（b.w）才照比例。太寬時外面那層有左右拉條
// 圖片裡的字（第 27 批）：從搜尋打開時，這張圖裡有沒有要找的字（有的話，圖外面框黃色、寫一行「🔍 這張圖裡有你要找的字」，畫面捲到這張圖）
function ocrHit(p, hl) {
  if (!p || !p.ocr || !hl || !hl.length) return false;
  var j = _yzNorm_(String(p.ocr)).replace(/\s+/g, "");   // 不管空白、換行（跟搜尋一樣）
  return hl.some(function (tk) { return tk && j.indexOf(tk) >= 0; });
}
function ocrTag() { return h("div", { class: "ocrtag" }, ["🔍 這張圖裡有你要找的字"]); }
function webTable(b, hl) {
  var G = _yzTblMg_(b);   // 第 29 批：合併儲存格（左上角那一格跨好幾列、好幾欄；被蓋住的格子不畫）
  var rows = G ? G.rows : (b.rows || []).filter(function (r) { return r && r.length; });
  if (!rows.length) return h("div");
  var nc = 0; rows.forEach(function (r) { nc = Math.max(nc, r.length); });
  var w = (b.w && b.w.length === nc) ? b.w : null, sum = 0;
  if (w) w.forEach(function (x) { sum += x; });
  var tb = h("table");
  if (w) { var cg = h("colgroup"); w.forEach(function (x) { cg.appendChild(h("col", { style: "width:" + (x / sum * 100).toFixed(1) + "%" })); }); tb.appendChild(cg); tb.style.width = "100%"; }
  rows.forEach(function (r, ri) {
    var tr = h("tr");
    for (var ci = 0; ci < nc; ci++) {
      var at = {};
      if (G) { var p = G.ps[G.at[ri][ci]]; if (p.r !== ri || p.c !== ci) continue; if (p.rs > 1) at.rowspan = String(p.rs); if (p.cs > 1) at.colspan = String(p.cs); }
      tr.appendChild(h(ri === 0 && b.head !== false ? "th" : "td", at, hlNodes(r[ci] === undefined || r[ci] === null ? "" : String(r[ci]), hl)));
    }
    tb.appendChild(tr);
  });
  return h("div", { class: "tscroll" }, [tb]);
}
// 階梯式內容：編號跟 LINE 用同一份程式算（_yzLadderRows_），兩邊一定一樣。「接續上一段」的起始號碼（b.n0）由 webArticle 先算好
function webLadder(b, hl, o) {
  var r = _yzLadderRows_(b), st = YZ_LADDER_STYLES[b.style] ? b.style : "law", mw = {}, box = h("div", { class: "lad" + (st === "plain" ? " plain" : "") });
  r.items.forEach(function (it, i) { if (_yzLadderIsImg_(it) || !r.marks[i]) return; var w = _yzMarkW_(r.marks[i], 14); if (!mw[it.lv] || w > mw[it.lv]) mw[it.lv] = w; });
  r.items.forEach(function (it, i) {
    if (_yzLadderIsImg_(it)) {
      var im = h("img", { src: it.img.url, alt: it.img.cap || "", loading: "lazy" });
      im.onclick = function () { if (o && o.onImg) o.onImg(it.img.url); };
      var oh = ocrHit(it.img, hl);
      box.appendChild(h("figure", { class: "lim lv" + it.lv + (oh ? " ocrhit" : ""), style: "margin-left:" + ((it.lv - 1) * 1.7 + (mw[it.lv] ? mw[it.lv] / 14 + 0.45 : 0)).toFixed(2) + "em" }, [im, it.img.cap ? h("figcaption", {}, hlNodes(it.img.cap, hl)) : null, oh ? ocrTag() : null]));
      return;
    }
    var strong = st === "law" && it.lv === 1, mk = r.marks[i];
    box.appendChild(h("div", { class: "lr lv" + it.lv + (strong ? " strong" : ""), style: "padding-left:" + ((it.lv - 1) * 1.7).toFixed(1) + "em" }, [
      mk ? h("span", { class: "lm", style: "width:" + (mw[it.lv] / 14).toFixed(2) + "em" }, [mk]) : null,   // 只縮排：沒有記號
      h("span", { class: "lt" }, hlNodes(it.v, hl))
    ]));
  });
  return box;
}
/* ───────── 動畫（網頁）─────────
 * 手機有開「減少動態效果」的人，動畫一律先停住（只看第一格），按「▶ 播放」才會動。設定「網頁動畫自動播放」關掉也一樣。 */
function reduceMotion() { try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) { return false; } }
function animAuto() { return !reduceMotion() && !(CFG && CFG.webAnimAuto === false); }
function animWhyStopped() { return reduceMotion() ? "你的裝置開了「減少動態效果」，所以動畫先停住；按「▶ 播放」才會動。" : "設定是「不自動播放」，按「▶ 播放」才會動。"; }
function webAnimFile(b, o) {
  o = o || {};
  var playing = animAuto(), first = playing;
  var img = h("img", { class: "animimg", alt: b.cap || "" });
  var tog = h("button", { class: "btn sm animtog", type: "button" });
  function paint() {
    img.src = playing ? (b.raw || b.url) : (b.poster || b.url);
    tog.textContent = playing ? "⏸ 暫停" : "▶ 播放"; tog.setAttribute("aria-pressed", playing ? "true" : "false");
    tog.setAttribute("aria-label", playing ? "暫停動畫" : "播放動畫");
  }
  tog.onclick = function () { playing = !playing; paint(); };
  img.onclick = function () { if (o.onImg) o.onImg(playing ? (b.raw || b.url) : (b.poster || b.url)); };
  paint();
  var box = h("div", { class: "animbox" }, [img, h("span", { class: "animtag" }, ["🎞 動畫"])]);
  if (b.ar && /^\d+:\d+$/.test(b.ar)) box.style.aspectRatio = b.ar.replace(":", " / ");
  return h("figure", { class: "anim" }, [box, h("div", { class: "animbar" }, [tog, first ? null : h("span", { class: "muted animnote" }, [animWhyStopped()])]), b.cap ? h("figcaption", {}, hlNodes(b.cap, o.hl)) : null]);
}
function webSteps(b, o) {
  o = o || {};
  var steps = (b.steps || []).filter(function (s) { return s && (s.url || String(s.cap || "").trim()); }), n = steps.length;
  if (!n) return h("div", { class: "muted" }, ["（分步動畫還沒有內容）"]);
  var i = 0, auto = animAuto() && n > 1, playing = auto, sec = Math.max(1, +b.sec || 2), loop = b.loop !== false;
  var hitAt = -1; steps.forEach(function (s, k) { if (hitAt < 0 && ocrHit(s, o.hl)) hitAt = k; });
  if (hitAt >= 0) { i = hitAt; playing = false; }   // 從搜尋打開：停在圖裡有那個字的那一步
  var img = h("img", { class: "stepimg", alt: "" }), cap = h("div", { class: "stepcap", "aria-live": "polite" }), dots = h("div", { class: "stepdots" });
  var tog = h("button", { class: "btn sm animtog", type: "button" }), pv = h("button", { class: "btn sm", type: "button", "aria-label": "上一步" }, ["◀ 上一步"]), nx = h("button", { class: "btn sm", type: "button", "aria-label": "下一步" }, ["下一步 ▶"]);
  var box = h("div", { class: "animbox stepbox" }, [img, h("span", { class: "animtag" }, ["🎞 分步動畫"])]);
  var ar = (steps.filter(function (s) { return s.url && s.ar; })[0] || {}).ar;
  if (ar && /^\d+:\d+$/.test(ar)) box.style.aspectRatio = ar.replace(":", " / ");
  img.onclick = function () { var s = steps[i]; if (s && s.url && o.onImg) o.onImg(s.url); };
  function paint() {
    var s = steps[i] || {};
    if (s.url) { img.src = s.url; img.style.display = ""; } else { img.removeAttribute("src"); img.style.display = "none"; }
    cap.innerHTML = ""; cap.appendChild(h("b", {}, ["步驟 " + (i + 1) + "／" + n + "　"])); if (s.cap) cap.appendChild(document.createTextNode(s.cap));
    dots.innerHTML = ""; steps.forEach(function (x, k) { dots.appendChild(h("i", { class: k === i ? "on" : "" })); });
    tog.textContent = playing ? "⏸ 暫停" : "▶ 播放"; tog.setAttribute("aria-pressed", playing ? "true" : "false");
    pv.disabled = i === 0 && !loop; nx.disabled = i === n - 1 && !loop;
  }
  function go(d) { i = (i + d + n) % n; paint(); }
  tog.onclick = function () { if (!playing && i === n - 1 && !loop) i = 0; playing = !playing; paint(); };
  pv.onclick = function () { playing = false; go(-1); }; nx.onclick = function () { playing = false; go(1); };
  paint();
  var fig = h("figure", { class: "stepsfig" + (hitAt >= 0 ? " ocrhit" : "") }, [box, cap, h("div", { class: "animbar" }, [pv, tog, nx, dots, auto || n < 2 ? null : h("span", { class: "muted animnote" }, [animWhyStopped()])]), hitAt >= 0 ? ocrTag() : null]);
  if (n > 1) { var timer = setInterval(function () {
    if (!fig.isConnected) { clearInterval(timer); return; }
    if (!playing) return;
    if (i < n - 1) i++; else if (loop) i = 0; else playing = false;
    paint();
  }, sec * 1000); }
  return fig;
}
function webAnim(b, o) { return b.kind === "steps" ? webSteps(b, o) : (b.url ? webAnimFile(b, o) : h("div")); }
function webFig(b, o) {   // 圖還沒載好就先照長寬比留好位置（下面的東西不會跳；從搜尋捲到的位置也不會跑掉）。o.cls、o.style：文字裡的圖用（第 28 批）
  o = o || {};
  var im = h("img", { src: b.url, alt: b.cap || "", loading: "lazy", style: /^\d+:\d+$/.test(b.ar || "") ? "aspect-ratio:auto " + b.ar.replace(":", " / ") : null });
  im.onclick = function () { if (o.onImg) o.onImg(b.url); };
  var oh = ocrHit(b, o.hl);
  return h("figure", { class: [o.cls || "", oh ? "ocrhit" : ""].join(" ").trim() || null, style: o.style || null }, [im, b.cap ? h("figcaption", {}, hlNodes(b.cap, o.hl)) : null, oh ? ocrTag() : null]);
}
// 第 40 批：流程圖。電腦：整張；手機（640 px 以下）：沒有說明框的那一張＋下面說明框的字（跟 LINE 一樣）。點圖＝放大
// o.pv：編輯器的預覽（改過還沒畫成圖片的，用瀏覽器先畫的那一張）
function webDraw(b, o) {
  o = o || {};
  var pv = o.pv && typeof drPv === "function" ? drPv(b) : null, full = pv ? pv.full : b.url, far = pv ? pv.ar : b.ar;
  var L = pv ? (pv.line ? { url: pv.line, ar: pv.lar } : null) : (b.draw && b.draw.line && b.draw.line.url ? b.draw.line : null);
  var notes = _yzDrawNotes_(b.draw), two = !!(L && notes.length);
  if (!full) return h("div", { class: "muted drwait" }, ["（流程圖還沒畫成圖片：存檔以後就會出現）"]);
  var rat = function (a) { return /^\d+:\d+$/.test(a || "") ? a.replace(":", " / ") : "auto"; };
  var lw = pv ? pv.lw : b.info && b.info.ow, im = h("img", { src: full, alt: b.cap || "流程圖", loading: "lazy", style: lw ? "max-width:" + Math.round(lw) + "px" : null });   // 照畫布上的大小顯示（字跟畫的時候一樣大；太寬就縮到放得下）
  im.onclick = function () { if (o.onImg) o.onImg(im.currentSrc || full); };
  var pic = h("picture", {}, [two ? h("source", { media: "(max-width: 640px)", srcset: L.url }) : null, im]);
  var hit = false;
  if (o.hl && o.hl.length) { var all = _yzNorm_(_yzDrawLines_(b.draw).join(" ")).replace(/\s+/g, ""); hit = o.hl.some(function (tk) { return tk && all.indexOf(tk) >= 0; }); }
  var fig = h("figure", { class: "drawfig" + (two ? " two" : "") + (hit ? " ocrhit" : ""), style: "--ar1:" + rat(far) + ";--ar2:" + rat(L && L.ar) }, [pic, b.cap ? h("figcaption", {}, hlNodes(b.cap, o.hl)) : null, hit ? h("div", { class: "ocrtag" }, ["🔍 這張流程圖裡有你要找的字"]) : null]);
  if (two) fig.appendChild(h("div", { class: "drnotes" }, [h("div", { class: "drnh" }, ["📝 說明"])].concat(notes.map(function (s) {
    var T = _yzDrawTone_(s.c);
    return h("div", { class: "drnote", style: "background:" + T.bg + ";border-color:" + T.bd + ";color:" + T.ink }, [webText(s.v, o.hl)]);
  }))));
  return fig;
}
/* ───────── 藥品卡片（第 29 批）：補藥神器的藥，網頁上直接打開（補藥神器網頁電腦版的樣子：藥品特徵｜適應症／注意｜照片；不給位置）─────────
   先用手冊裡存的名字畫出來，再向後端（hbDrugs）拿最新的藥品特徵、照片…補上（同一支藥這一次開網頁只拿一次）。 */
var DRUG_ICON = {"錠":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAABgFBMVEURo3BhoOUOY9rj4+WlzO6h0+wIa+pjo+aZtNMmhuehzOkGZC4VqXMLZuAhjvJa1GAKnXImm3AA/wAVh/PV4/crkfCsy+MRT7lc2mb29rOhsuaO6Vmf4poNr4Bg2Wmmr6lp3XV98f3xqatqruX//wAXdOUCd1c8wf6Q6FkUdWwxyW/M1t8s1INbsPMAOrd/f/9psZSJ5V3uregHdmNGknYtym1Pdtdtk7WQ5Wn//3sgijh4xfZPw/sv0npkf3Bn1Yw3zGZ4w/KSsNKfutbG090AfwADVi4CeW0uooJSerqheF2hj2GKyqf/AP//fz//f/8AKr0APMs5u4tVVapNfcVPqH5FtFRHv4tJzIC/Pz+/fz+/f7+Cnb+sybj/AAD/f3/fn38AAADw+/4TiPoXlf7M6vva8v3+/v4PefCLyfSu2ve54/pL2m4mqP4y03Yco/4KaeWL6Vpt5WQry3c2uP4Wx30FWNgA//8AAP8nmPkoeccWxYB35V1S4m58xPWPuPEnToQTAAAAgHRSTlP3+OwS8h6aG/Lrq/1jW1r5oCcBpvsuX/6qBg/lFv5iDh4KBqcBJvT+qSBpY/9U/gITYQZpGq74+isC/1/35wkaJ61qr5kCTZtV/AkI0AEEAmX/NQO5l/9AZQQEBP2YAQIIAP7+/v7+A/3+/f79/v7//vz9/P75/gEB+/38/f/+/Ab/E9AAAA3SSURBVHja7Zv3e9pIE8e1kqimGAwYsOMWpzhOLo6T3KWX6/3e3hsIaUGA45iAwI1//Z3ZlUBYBeFy+eUmebjEz919P/vd2dnRrhAqHzmE3wBcf9qHMD4iAKgbRr//0QDoKD4GAJXKkfwCRiofCdFK/9cFoKF8KhaLKQr8VmKxhWTkqm2wAfTXaSS1EIuRYU7NQaj6kMTCyTyl/V8FAKY8FR6AetUW6pCEwYX+rwBAd2H4hKlrECoLDf4mx8L5Uv/KAaiUXyCyJT9GUMEFEs5v9K8aAPVzprrlP2NoAsIwnKfG1QKgPh+9PQM4AhDI4fyqcYUA1NKvOgI9aDIPrigPBNv4XcMkIOFI6coAyhGv8VsEajVHkiXjigCMciqmVr0D9IEA0oBeEQC9tzD00cdMZJOQvOR6lDUB6G4qlvMDqCKAWtXD+c1LBeC7jNCn90Tiq88sUJkFl6kvLa+tIYBRSim6P4BpwTAcuTwC6clKsbgiUZgCydwBfAHQAlW8JAsoXQb59HGaAdDnMeK5BO1zoFWjycjlyD+4vZQ+Pk63issIcE8ZTgMw50AVb1zYgiwtP7m99P798fFBq9VaodmgAMwCkpQuSEB3YfjvmX4aAXazwmZKiU4HaKIFmnzBNMzS0NqD92P91p1/UhNgWjRNC26ULqTPhw/66TQH2KkgwPQpAAsgtAtaAPpL1vifoX7r8RoNlgNVDfR1VVPDF0hD+tqmjwbs7XVWEKBOAgCYFgzD9P659Vcs/YNnAqhDdBIAEJpWiVmnpFoWnHdPpMtjfeEZ12cAFZoaqNMBzDnQSJjeuID+MdOfS59w/S4AGE9TdTkAALMA0zB/noVApZW0KX+QnrMmgAFUaCTs0w/ZAXScA9gTz9EZ0bWiaf9Ja24ubepzAGMjVc8FAkAC6IzWN88zAcfHXP5EmBNOJgDQguFMFpTOY8ABxsnJSXrOzMAOpED3WwRYl1hLpPnrcwugHJJkaHYD7jB1NOCZaQDqHwl/RYDKRn6aBeyBic+Bps/eFtA3RdRvgQHC3Jy1BLvdo8QOa8tpeSEWAEDVAQB25ZktWKN3mPtYfOfmhJdMv3vU7XYTPzMHDCklyr4EmmYlAbNgxnr8U4kBQO19OTKgyyJBDfZkVPJ9MhkDgD7LgvBMbUGWvn6M+Y/FX8Aa0GL6R0dHj/9A+aOZsZsSc34Emo0A2gI/C5yHW1n6tz3uAMuAkxaf/6OjbmLVBBgXI83PAQ4AC1H0bAuyy8ulkjTJkKV3WrgIWntYAw5arASiBd3EhjF6PE+ypzNfC1S2I+pkUBt4tQWb9MFtFk+eQL9ZoXYAMKADRbDFFwACzGfo6HyA5sPRqQA4B0Tcr7UHnnNAWcf5/v3S0u0HT5Z3qQmwxwFgBjp7dgPWbSckSVaMNB+AqqqT+j78qg2UcGjdo+nCmv/eYliW1hhAhychzACvAEeYA8yAEQDsiX7FCOQ1ncSUOkatNhA9nlRh11uy9OGjuAYEWbrSaZkp2LmLK+DuXcjAl4kNO8BmOUw86zH8VJVBvqYwAqVWU8LSfd9tj1McF9eWX2XpzjzrAJkBHajBqN9NPKITx3SSb1sgEwVlFcsCRUxK7hasWo0Pfh4cFNdCfbo83zEB7mIOHDH9DJ08J9z0bgvUIamB/BgA/lJP+loABGlsPg7SxTc76/9LdEEY1oBwd+9uB+WPLP0xgMEtcJYCdTioWTG2oObZHO6sLC0tMe00y/3iG0oTgtDZYykA8ghwx9K3HdU+XQ+7nNTlSLtmi7EFXmlYoZki0weAdBpz/3FC+rMgCF2cASyAWAJH+vaz4lJKVCcBYN3V3mHYHBhlQdjrUTnE6g4+e7b+gh97wo8yAAhzFoAA+lmX03KrM7IA1Eb73bt22xWAW+BRjDKP0yZASxBanb2ukPuMAwjCtWvCPOR/Nms4AdbLC2JuZIHeaNfaGHYLlEkLPAikTJE/+kHiweR3OsKP/54HgJvow3wiA1vQV19lsw4Ae1ugk3e1dx8cAAEtWM4UTX0QF45AlWbmbyIAyH9PQ6MroezkjQl0RoQnHqnV2qfknTcA1ONaPVz2IFjdSbCF39rD3BfA9VIpATMA8j9QKq2u4fnQ2uudVYlOAPSZBbjd1Qg04A0O4EgCywLFuy2AAXc66Q6rekAgzP9AX3399cPMBshn7jwu4gQVIVbeTN4Z0chC7AWuO3hYg92vPbKg5gDYZ3MgebYlmcS8gP5D2gk3hXlIu8p/KWwVjxKPX3J3wJ4O7EeTl1bQoH/48AIIhrD7V21z4ATALPB5WKevMvOCGTdvCgm27rbAmZfgSye9x+ESr8/emkUWBi8+oAUIkHNaoAS1AJp9ILhmEggP8XnOkBCq0+HiqL9DzwJIyfqHWx9ASR9b4JiCkQWK74HJBk6DacHDn7FB2gIkFqZ+hhpnAZ5GRG4BqapWGjoMQAJoTGB/BAvOPKka7NoZL377Bl3dSszPc4C/U6YvTOjjLYzj4jKscAtkaMHYHLxzOoAA+64WGGx5/8JX+foW3fj+0beJhw+/efgPSlcfskp4zfL/0YbhcnULG8JZC9wA9jEU1hYYkz25FIIoFPCT0hJy7G68epTZrEhbo6xkBfEV3w8cd8cR04IBZoHadndgRFC3WwDahTgLWcbPt8+RwnpS2Prm5s2x/KNfqPvldR8saN+61a4pzAJIQz8ABSwwzysoqsuyajvuUXU5XlgPUX6esAUxzzeDzA71uT0P2SzQ1JprEvIkgCxQ0AJIN4rqbofuqhx/HqJP++b/exVi8sHJAWA8RQsAQCGaZYHTgPrIgl6SRlBe9zzp0uPPJesC3PlOgvMFBopZ8AEICBhQ1Wt+AJAF+7+LSCDve76CJnidLDkBjA2wAAGUBktDsKDmMgWmBfXe9bjP6HlXLzcQwQj6CgdYMLjFViJYoDVqfgBiL6rqzSnnzI3T04Ye9yBwAUALWBoqLA09poARiL2hOmX4XB/+8TbkevPp+hILZIFpgdqsggVuBiBArydrAfXhD9ddPXADWJcW6iwNFV1tavrAoW8C9ERZa0676mg0uL4Xget7RFJetLKg2awSLwBxGFyfNZpAEPBNqnIYLGijBU1XC7g+UVV1ur75WgZ+Nu4538lxB6DMAuwNNVcLEEAUp+o3x/oa/qvq2/WAAGCBMrag4bYI9iEBpumfNk517r9J4DIJHgClUT2GLNCImwFTJ0BvjPQZAJ4ynN6TggGwXZk1h3pT12QnQK+nVwPqj86YMAuuhwICPLXqMVQaPTdwAIhsqwqqP7YA8jAYQCUUrqEFClqgDpWzWxEuwRn0LYBq4+2ZLPACMEqWBaSpN3OxSQOUaUsA9ZuOc0YEeBEJBsC2JGYBQQsayuQM/J5Up+g3ms6jVvbUe0+igQAqfFeGxrOB1wSxszPgB4DjV11OWtk6iJcDAqxyCxRmQXOo2AF6Ys6nCOD4VeeVjwUQCQhQ2YVdGQDQArkJFtjXgF8KyI7xWwD401N58o0oHwCeBQMF01C2WYAAn1Y9AWTn+O0AjcZ1uh4MADfFsQXjNPQHgN3PVd+cAgZwvx8MYGTBQNcRwFaHPQFcx28DUE/RgYAAlY0bzAKYhEaDTDhAPADc9S2AKgeQaFAAekOMQTFC1YFSCwDQcNe3AcAKmQUAjwvaaMGZ8xH3KVCn6PMcnCEH2EXKAKohOxweO6DsuwJ46k/mYGOBbgUGqNCkOAALTAJrHfbETzVHIfDWty1ClQHcqAQGgL6g3m4P+AG55UCvB4Xo7G7soz/einCRklTQSshboyTkIVpQt1YBPA1ARKvc0gl9zU/fMuB6ZCaAShkI2CTU9/nDQE8EfbYM7EcBp/7jNw3AXWJhNoA+jWAaDMwjiX1RZAawzUCd1Neq0yYADJDJgjSbA/1VIFDGBD0TYGhLQ2x/p4xfs8pELB+wIZn0AEyoAYI5fpwGYi0sMPZ09PjlBaBZE0BSocqMAJygBwjsZAbV9yEdDnOWBTr6769vtQkyOWtAsG/Z0IgIYxdtG7LY+4SYa3sGfTAgGbQtP7Mxf/4nEQMnH1EWMWT+8nvDR3/UDHN9MCBCzwVQkaTPPxV7i5/wWFyE34uEv/+vTxl/1a6fClXOB9DvS9tx8t3iOL4jn0X5y/e6T/7by5RMDhci9JwAlcr9srT9ZTwa/QzjX1EMguVQnfqMbE4/jD+WoucHqND75Uhou1AoxKNmyGRYVacjsOHj+GPkc+dl5wzfNTMoXd0tl0PlAkZchhh5MLkx2OdBZ8Nv6DD+2BdSpHIBADznNODXfTx8lqTt7cJ2jhDzWxjspVfne5hywwwYfyy6Hbp/MYAzOBVIC0L0qkWAYVoBVPpIHIeP+l9K5cplApjLkwxV9pITf8UFAydnJN6Qcfgw/6DvckZ14e8b/pEWCCBU+UtGHIAzWOpDkD88JHI8VKKVywegq9L29UMy1C0Gps7FIf+GhByKIB8F/VDQo9pZCUJS4Tpq6FYumC5wdZHZHy+EPL41d/GvfFLjBpW+IGTxkLCIEisOF2HjgJ/i8CWve+ZL+M7pf2g/AoU6Cgi4VR2yEM0/EqhXclyS1r1eRL2cL71SAxAKX0Rx9DFOgH6wchkvFEDf84LzEr91i8UJsj9qC1kuhEKS7391uV/7lTDMq7s4uzuUpr2Ce9nfO6abnAKjshngBeAr+OLzJr+4NYK9dXkV37zuZzF+qnw0gJniN4D/A98gkWK7rKd1AAAAAElFTkSuQmCC","水":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAABgFBMVEUTm/Wi2fkKY9XS4vMCMqobTrNhqek3xP4GnYcLnW6Qr+AZS7AkzGKU5Fdk1lUDclxPc8Vqy/otz5KV4zkDNKlRaKtLaLYAAP/8qFcDMaQrjTMVnVvt5+j/1FZUrVoA//8ib1EsUaVbZ55bqzQLdDMHbkwSR65pb2z47bEQNqCescsCc1d///9Xm1cnWTP/4xoTDnYrk06y6Y/I8qR5yzVqk6Rp01LhpaienaTzp+iYd5Sz4uoSYscinFIA/38syFh2f/azyNb0YnYmk+AA/wBLZqxvg7JqkM5xyzufq9YAPMQCR8MwjDYzpONuGWBmZjtQukhohLZrxTtg042ekW6Dk7yVsqObsc2L4E/H3OEJGy46xftLO41OeMJNrT1ilq9ticOqeW2hctCN4Tq6ztz/cpnlXeX/qioCEVsAf/8gnD9MMwBmM8xTtzd//39hzkeg8GOU5WCNxqr/AH8AAADz/P7Q+P6u9f6M6f7+/v5Jyf104/4tuP1q2v5V1f6V8/6DOF2/AAAAgHRSTlP+/v7+9/j+/v76/Wv9/fr5/P/++6Ne9gEGW/+ZEQb5AR0pF//7XJwKBS5kpgIcGwQIJf7++/aaBw4HDRRoXQKaAlwJewGUaCaFGf+qJJgNDVulaP0OYe2YnVMNtRFOJxZbCgWYqwoEBlkCjAoFQAJENnoJAgD+/v//Av///v////14JAcAAA/8SURBVHja7ZuHd9tGEoexKAuBFAtMmjIlRt0qtuTu2I7tS7k0p/d26cnlehcqAfJfv5nZRSVBUomU5L27zbMlUwrmw29mZ2Z3AeVk5gimjZOzHMrUT1c2hKlXvv6iDqMvBn5b/+IVibFyjgDBweAVstrVdaM09C6xvBIcBBvnBLDy1Xa93zWMNue8Vqux/IB/w6e8Z3T79e3B+QCsHG33dYMzprmVgzHe07v1eyvnosAzfaOmOY5Lt1yk0DRNfuo4Wq+7HZwHQHBR74F9Mdyyffwif1bT62cQiRUALEWoGJp2zgDM0ZjjIAei5P7Qx8xhtZ8BQENLCKHl/rCfCaDmaLVfCqAuAf6XFWj/H+CXBfjVzIJfUIH2r2AaQibkqbUyQO18Aba7BsN6I2tBQQEnEQWKQru7dS7l+OTgsGu0a5o2sxbWeK97+MzGuQAc7W9RL9jrYUemFQf2ZL0etIa63t9/7pya0o1gSycT1JKqhSE/16E5PTgL+xVd8faeAQ6v1e72cKQdMf2rh7JABHaDG+cI0EWAqjDAOfJzAHDsPqkLTQIgac7t2rkD7BGAh/0nKzamHi0PHKZ3B386P4CtLodUo1E68KYCaHr3meC8AAIoB3CPzGWTnblLywVIksaZrAoqAPb3dIhzRiuAiVURSsAZJeKN8wFYubfVbUMxrABwpQ+MM8nE0wBwDmDRcb3pAJ7wAUhw7+g8AJ6714cIgDkg1mDZWqxAUHMcKEYHG2cPsHEPp0AqgJOtBTMESgbkhIOzBzjY6vbIAdJwzr5TikN2FjNBmUwBFAAstZ8DcEpTsab3f7ITygAQgDIApgEkCCwh6B4OzhQgOKAArFXalwSe2K9xHOhKgjMFwAwADvA8z5kFICVgZ5ANlFIKxACAKsQya1MBUAJfEPR/Wk0oANyriwwAITgHACTQRBjw00jwYhD8J6gGoCrs0L6cMzEFywDYL8uUvKgEQfDDjc2bNysBNg6oCBYEqARAJ2lJVRqsLHT3P3z2+J1nn70ZVAEE32AE8JwAFIlVPnBJAg4S7F1aQILg3rV3nm42l5cfDzaqALaxCOYBUAG3ygdAIKKgvUA+DE72j8E82F9euxdMB8g84Gs5U5VBQJlA+mBuPtx+4x9onwD2qwCu13VGHvDdqiQwCYA+0OtPzZTgevDG38i8ALhWARA8VTc0bR5AqS8RQdCfCRAcfinNN5sWELxRBXAJAFguBKZOgpRCSwA0Te0fBDPm3vF7nyT2lxHgz4PfLAzgZotCsUktRjoVOQVBu/tVJUCwffxJp9lsCIBVBFh75mgegNiWZpxzRZ0YsFpst7OTBATQL1YBBJvH33UazcatRmp/ee2tYDYA53YYMt/nqjJlSAxauPbafDZAsPned2D8zq1bt9H+KtpffvbtmQBw00ocx77nxcrMIdQw1BkAwc1XO43bzu1OAwbYtwTAtVkAcOUo8odDDwEiMWYhqJA7KgBeJPuQU243Oo0O2EcBmnMAeBTGZjQkAD8yxajAQPPwJQ9wvag/2KdoBoDGzs4OCNBsQAzcnAWght4w9Ic+Apj5MYUC7UcKTwGCra2C/u+BXbR/u9Np7KzugADNDihgPc7PwzKAoozCWGaaOB7RCDOEzHrEMVgBIlVgY1CvZ/cW3Hjnzi0HPKA1Op3OndU7ZJ8A1h7MBAAXQAjKPCCaP5gSPiuPWM7RFCD4pru3lTrhwZevwu03GnD7YH/3DjgA7IMHFgAw/bEH1j0y63nJcVmyP2HbMFWyCZkBHO4Z/YPUAU83If5udWisrnZ2l1GJZQL4/cZMgJAAQIDxeDwUg3wRhmYxCIoAG0Gf1/aS/ux4De1rMAPB7M5qZ9WiqSAAXjiaARABwFgCQCQCxBiUSDAAIouFIkAw6HJNlV16cHP5fbTf2EEBdu/cWW2m9ucBDPMAY8/1EAAJ4liqMBVgg3Y1ev2BaK/XLA3t4/03wAGr65iKln8EgIwF3/ekAmGVAvf7BnO5WKgMblrvO9otTIB3Gju7nR0LvluW9ucDhCUFxlKDeJT4wLYnAPCcw7GZ0b8Plzpes5hD9hs7jd3VBgjQTO3PCcIiAMUAAgxTH4RmCHMQc7bCcwAHfVhURm77dQjDYHPNggQsAHZ2m+uWNE/2YRqeAqAQhkKCiLmxHdpFBVa2YVXvR4zpj+5vIIAm7Dc6KICVt2+tzcyE8wHM2PVjSEMSQKTib/s6d5lpa8brhw+Dx9bdW6g+KgACtKzlZmbfWgs2TwswLgCYMYvtQgy8jNsKkKPMSKvpj/aDNQujbqcJfwkB8vaty7OK0UIAUAeiAkDt4z2dQ6o0TQ4SbA8kAEiwvrsOAlA7mIy1a6cD8IoAVJrERMwAuKEbzHZic4QS7L1rtVpNbEGajd3dhmXl7h4B3j5aECCdBAnASObCAgDEAB4icNt2Qvgx0wDGsFrrJAEI0GxZS9L08gX8++oHiwO49Hcahczz41Bm4zyAAjY1xWUAMFJgpYQAFrSi66uru4311pIYFy5ckCHw90UBsCJ7lIooE/ku/JGJIMxcoIWKrtfs0GEhKBQBkGostVCC5uqu1QAByLi0v1S9MpoC4FIMeJ4QwHehMYAYCKFXQQKpgA8CtJnCnBhdNFLcmqqrSxQFFoagtH5haQlRrMtVa8PgD2UAl1oSHDIPwBcMQkhEcZaI+EiFCAwjxx3FOEACrhoKEVi7TauVmBfD2qzaH5gE8PIAST2cAAhBgBqLYocJgFBhGjTsSqtl4QRsWXnzS9bVaoBLVQBuPhNiNfChXYwkQIhTELppx/EFACwn3Jqhq0AAgbBOIZAN6/L9UwB4wr6XBzBNCAIoCElfjg6oxYrvOLEcoWK7beGEFnigZH+zcpOKluflPIANoZfVAggz36dpKMuxMoIZwLUodMADom0aggSMgQQRAEBGKthvle3PBSgVI6pDYZQCCAfYMAUcmKKCACTgXk3XFQyDgges1uXj6n3CqZmwXAtKANEIwo0i0HGG1Djh742gU/C4bkTohKL9CQEWBPBlcxyPGASgmQCAAyAFaNwEAVwJgJ0T/JR56AQjDwD2rwUzdkqrXIAEMBGTlggESDNxGIEAmh3hjobvpwBDTJM+hAE4wcrb33948uL10jOh8xXAvhBTcjoL0lIgHKBFsUsAHstLwMfgBNNIFIAadPn4IRj/6+f7b58yCD3xLYtzXSllgZFCAoQ+/rKfZiwgMLFhHKsggSGsW63dzUHw4Mbm8T+fXnucj4QFAFyHrsz8uAhghrg7wIQATMolAEYYIr5t6JECtRgzUuujwf1rx//65Ol1aAj+cioAdIAgSACEfUwBatsJQ3HA62UE4KxIEU5QwQmYEG99tI7VcZ16gquXjhYEoEQI35cUCBkJEKEAWhg7uazpUSCIMFTsIcXh+keadne92WiCJ6goX160KRW3PqZLwzo5iYHQ90KKAD2NAEesod1EgljsL5EE3NHuQlO4LqxDXVrbDBYNQldOQ/jKWNYSogJqRBHghhQBkwA0TfgQo+CuZZH594V9aMkWBRiXMzG1hJhq4eIjuDtVY0KA5Iw/A6DfUYYKZiPqCdPpaF1+MBsAur6xX700w1jgFIKvQTtox2IvZQKA5oEaDnXdVLJsCBzW1Zmb1VIBv7w/4KfdAMQCAqAHoCMXITgFgIJA5TbkgshIm0L0QHVLdr1KAZneGO5bhdiQQgiECAAeqACA5lQka0qH1lKCsGStVXdEGYBfAJBTmzlQENiImgFVCbmaCwE3i0EmF/KmkGAERVE1cj4oF+RJgCEB4BwcizyIkxCKPdiHTMAkAKbhtmNPAsgQSAGMJB/LinAtWBTAFQAOZgK4KQCA8Bv5EmBISxKZBiVAmoeoaEkARQZB0pIOTk4WccFYAIADsCWjYuxKBSgP86GMwQRA5oxUgNCUHUMWBKIin5wGAAfmQbEooHwsuiGYX0YewPHytQgARNeK+TJXlK3W1ZkdUZIHTADwRTOKU0D2Q9iPsqQZUcNYAvh5AOZnAiQAIQBgFGJJnmK/CoBuXCYh2Y3FuYWxAGAlgJx94YEUoIXm0f7+wgCJAn5hUZTW4sQFI7GrTCf+LN1LQ1IJEIe6HqnYnl+9PM1+BcAwAUjsDwu9QApggwT0rI/PRD+W3D94QOxlowIAAPav3Q9mH99PxoCfLMv9TADcsiYAVQJAZMitTJmDhacUyJscV66cXAC3PwhOFgMYmeHQFzEvLoozLGkHYV0ahpySvPoaxx2BOB4Oc/blFgqszpjHRB4AgD8eD+Y/wJAHkGtxcf8AwOQeZYTLglAUQ+O1tuNidY6l/unq2YxAAE8CwNLRfPOt4OTUAFmbj9dPPeD5sc2pFkA/xMgH2JK4Un7hf1PhGgKolIpV89ELR4sDKFBuxDqIzo2SNamwb0Yxs2mL0gwNPDBjIWZjKBx+nNnHhRGo5taAEyaB8ubhwcmPAUDfJzlolAAkqzLoB3S9DYEGTnCSA6Y0UWDlJg/YEALKm58FpwIIozhVIJ2BaD+/U08+0JnDOBUkTx6pEIDCcQ65DCIFPGCYv33rlACmGcfD5LAmLtlPAUIVF6YuN6lNpGHKnQNGmqg0B3TldzOfdSoBkNuw8R2Nkg2PzH4C4NsYBNiWQ1vMInm+GSVrRgFA9kMS4MbCALoGskV0M8n0Fmd2dGgXx7Ztw1TkzKZCC1FgGOBqICgfajLGcfcE5uA8AUoATMPDUKx7XvFRifzg4lg/wqZIVzHYlDKA2L5DB6hzBMg/QzKo67jFBz0RHhGJ7i4f21HBAFw6RCe0gYDjEe5U+4aizHnaTSk/SggXC5lsLpK5jWPi6NjAOBQEvl0+TeQh2Yd+8NH2wgBHH+yBBHiCH0GnQytCWeN8ioCYgsAO7ZiSIVS5MEICg4/H9IkcCuehbXMD79989Hmw+MNswWEXwhpfpxQMfm7Fhy4RZ8gx5+JBDkOF6AP7kJDYGOWyMTq4HY+GNu5fo/05AVACWAkO8WLiERk8H44iuBkcdGWeKdwGOzYURCBQ6GkOlbPkmBdyB6e3EMC+Wp/7jFXhcb7nnuCrFTx5oFSTIZ8ap+9qpAQeYfd0VYHKq8p3IZJflf9Uo0jtXTkdwEnwcE9cq/xuQf65Zpge+NKrsAMimAo901Ic8Lli9L5/uH/aZ0oH7+7ppF+bHtQpvmAiXvzlvJ2852H0DJi2hJC+/KHjWyERCnP3++f/fdqnaleeBMGTl/bSN0lgtGmAVRhGaoWs3wXGuwbmLtOMsqdKKDKM3sfPPxkEpwU4gf9jEARXXr5Y3zPy5vScYTD90sWLH16h8fzHvR7ZTZ82QZDeS1c+ffjc0QLPGU48Wb2ysiLeeR9c+fDlizDq+YEfvAxWATK4/+0AvjwYfPr81+/2srdxCO9KENzYX+g9LKXyJyvBjIGXXtmA/1Y28D35wadXLqbjwysD/IUF39JXTs5kTOItOv4LmyGziwdiNVMAAAAASUVORK5CYII="};   // 劑型圖示（跟補藥神器網頁同一套）
var DRUG = {}, DRUG_WAIT = {}, DRUG_Q = [], DRUG_T = null;
function drugFetch(code, cb) {   // 拿一支藥（cb(row 或 null)）；同時要的合成一次
  if (DRUG.hasOwnProperty(code)) { cb(DRUG[code]); return; }
  (DRUG_WAIT[code] = DRUG_WAIT[code] || []).push(cb);
  if (DRUG_Q.indexOf(code) < 0) DRUG_Q.push(code);
  clearTimeout(DRUG_T);
  DRUG_T = setTimeout(drugFlush, 30);
}
function drugFlush() {   // 一次最多拿 30 支（後端也是一次最多 30 支）
  var q = DRUG_Q.splice(0, 30);
  if (!q.length) return;
  if (DRUG_Q.length) DRUG_T = setTimeout(drugFlush, 0);
  call("hbDrugs", [q]).then(function (r) {
    q.forEach(function (c) { var v = r && r.ok && r.rows ? r.rows[c] : undefined; if (v && v.down) v = undefined; if (v !== undefined) DRUG[c] = v; var w = DRUG_WAIT[c] || []; delete DRUG_WAIT[c]; w.forEach(function (f) { f(v); }); });   // 第 34 批：down＝補藥神器現在連不到（不記，下次再問）
  }, function () { q.forEach(function (c) { var w = DRUG_WAIT[c] || []; delete DRUG_WAIT[c]; w.forEach(function (f) { f(undefined); }); }); });
}
function drugKind(d) { if (d && (d.kind === "水" || d.kind === "錠")) return d.kind; return /水|液|漿|滴|注射|針/.test(String(d && d.form || "")) ? "水" : "錠"; }
function drugCard(d0, o) {   // d0：手冊裡存的（code、brand、chName）
  var card = h("article", { class: "dcard", "data-code": d0.code });
  var paint = function (d, state) {
    card.innerHTML = "";
    var x = d || d0;
    card.appendChild(h("div", { class: "dhead" }, [
      h("div", { class: "dt" }, [h("div", { class: "dcode" }, [x.code]), h("div", { class: "dbrand" }, [x.brand || "—"]), x.chName ? h("div", { class: "dzh" }, [x.chName]) : null, d && d.generic ? h("div", { class: "dgen" }, [d.generic]) : null]),
      h("div", { class: "dicon" }, [h("img", { src: DRUG_ICON[drugKind(d)], alt: drugKind(d) })])
    ]));
    if (!d) { card.appendChild(h("div", { class: "dwait" }, [state === "gone" ? "⚠ 補藥神器裡找不到這一支藥（可能改了 CODE 或刪掉了）" : state === "fail" ? "⚠ 藥品資料現在拿不到（在補藥神器那邊，等一下重新整理）" : "藥品資料載入中…"])); return; }
    if (d.notice) card.appendChild(h("div", { class: "dnotice" }, [h("span", {}, ["⚠️"]), h("span", {}, [d.notice])]));
    var hf = !!d.feat, info = [], hp = !!d.photo;
    if (d.pair) info.push(h("div", { class: "dpair" }, [h("b", {}, ["⚠️ 注意"]), h("div", {}, [d.pair])]));
    if (d.note) info.push(h("div", { class: "dkv" }, [h("span", { class: "k" }, ["適應症"]), h("span", { class: "v" }, [d.note])]));
    if (d.old) info.push(h("div", { class: "dkv" }, [h("span", { class: "k" }, ["曾用藥品"]), h("span", { class: "v" }, [d.old])]));
    var hi = info.length > 0;
    if (!hf && !hi && !hp) return;
    var areas = [hf ? "f" : "", hi ? "i" : "", hp ? "p" : ""].filter(Boolean);
    var pnl = h("div", { class: "dpnl", style: "--ga:'" + areas.join(" ") + "';--gc:" + areas.map(function (a) { return a === "p" ? "auto" : a === "f" ? "minmax(0,1.1fr)" : "minmax(0,1fr)"; }).join(" ") });
    if (hf) pnl.appendChild(h("div", { class: "dfeat" }, [h("b", {}, ["🔍 藥品特徵"]), h("div", {}, [d.feat])]));
    if (hi) pnl.appendChild(h("div", { class: "dinfo" }, info));
    if (hp) { var im = h("img", { class: "dphoto", src: d.thumb || d.photo, alt: "藥品照片", loading: "lazy" }); im.onclick = function () { if (o && o.onImg) o.onImg(d.photo); }; pnl.appendChild(im); }
    card.appendChild(pnl);
  };
  paint(null, "wait");
  drugFetch(d0.code, function (d) { if (d) paint(d); else paint(null, d === null ? "gone" : "fail"); });
  return card;
}
function webDrugs(b, o) {
  var its = (b.items || []).filter(function (d) { return d && d.code; });
  var box = h("div", { class: "drugs" });
  if (!its.length) { box.appendChild(h("div", { class: "muted" }, ["（藥品卡片還沒有放藥）"])); return box; }
  its.forEach(function (d) { box.appendChild(drugCard(d, o)); });
  return box;
}
function extLink(url, label) {   // 外部網址：只收 https，開新分頁、不帶來源
  return /^https:\/\/[^\s"'<>]+$/.test(url || "") ? h("a", { class: "src ext", href: url, target: "_blank", rel: "noopener noreferrer" }, [label]) : null;
}
// 互相連結（第 27 批）：「從這些標題連過來」的那一區（沒有＝null）。網頁文章最下面、章的頁面最下面都用
function webBacklinks(list, fromCh, onTitle) {
  if (!list || !list.length) return null;
  return h("div", { class: "backl" }, [h("div", { class: "bl-h" }, ["↩ 從這些標題連過來（互相連結）"])].concat(list.map(function (x) {
    return h("a", { class: "rt-go back", href: "#", onclick: function (e) { e.preventDefault(); if (onTitle) onTitle(x.t.id); } }, [h("span", {}, ["↩"]), h("b", {}, [_yzBackLabel_(x, fromCh)]), h("span", {}, ["›"])]);
  })));
}
// ── 第 40 批（一起做的）：網址連結：一個連結一個小框（🌐 名稱、網站、說明、↗）。
//   電腦：點了開一個小視窗（手冊還在後面）；手機、LINE 裡的瀏覽器：開新分頁（手機沒有小視窗）。不帶手冊的網址過去（no-referrer、noopener）
// 第 43 批：連結指到檔案（Word、PDF、Excel、PPT、圖片）：點了在手冊裡的小視窗看（fview.js；只能看）。ctx：{ tid, bi }（手冊裡的哪一塊）；編輯器的預覽＝試開（還沒存也可以）
function webLinks(b, hl, ctx) {
  ctx = ctx || {};
  var its = _yzLinkItems_(b);
  if (!its.length) return null;
  return h("div", { class: "xlinks" }, its.map(function (x, i) {
    var u = _yzLinkFix_(x.u), lab = _yzLinkLabel_(x), n = String(x.n || "").trim(), host = _yzLinkHost_(u), fk = _yzLinkFileKind_(x);
    if (fk) {
      var go = function (e) { if (e) e.preventDefault(); if (ctx.pv) fvOpen({ try: u, label: lab, kind: fk }); else if (ctx.tid) fvOpen({ tid: ctx.tid, bi: ctx.bi, ii: i, tag: _yzLinkTag_(u), label: lab, kind: fk }); };
      return h("a", { class: "xlink xfile", href: "#", role: "button", "data-k": fk, title: "在手冊裡看（只能看）：" + lab, onclick: go, onkeydown: function (e) { if (e.key === " ") go(e); } }, [
        h("span", { class: "xl-i", "aria-hidden": "true" }, [YZ_FILE_ICO[fk] || "📄"]),
        h("span", { class: "xl-t" }, [h("b", {}, hlNodes(lab, hl)), h("small", {}, hlNodes(YZ_FILE_NAME[fk] + "｜在手冊裡看（只能看）" + (n ? "｜" + n : ""), hl))]),
        h("span", { class: "xl-o", "aria-hidden": "true" }, ["›"])
      ]);
    }
    return h("a", { class: "xlink", href: u, target: "_blank", rel: "noopener noreferrer", referrerpolicy: "no-referrer", title: (xlSmall() ? "在小視窗打開：" : "打開：") + u, onclick: function (e) { if (xlOpen(u)) e.preventDefault(); } }, [
      h("span", { class: "xl-i", "aria-hidden": "true" }, ["🌐"]),
      h("span", { class: "xl-t" }, [h("b", {}, hlNodes(lab, hl)), h("small", {}, hlNodes(host + (n ? "｜" + n : ""), hl))]),
      h("span", { class: "xl-o", "aria-hidden": "true" }, [xlSmall() ? "⧉" : "↗"])
    ]);
  }));
}
function xlSmall() {   // 可以開小視窗嗎：電腦（滑鼠、畫面夠大），不是手機、不是 LINE 裡的瀏覽器
  try { return window.matchMedia("(pointer: fine)").matches && (window.screen.availWidth || innerWidth) >= 900 && !/Line\/|Android|iPhone|iPad/i.test(navigator.userAgent); } catch (e) { return false; }
}
function xlOpen(u) {   // 開小視窗（右邊、大概手機的大小）；回 true＝開了（連結本身不要再開一次）
  if (!xlSmall()) return false;
  var sw = window.screen.availWidth || 1280, sh = window.screen.availHeight || 800, w = Math.min(560, sw - 40), hh = Math.min(820, sh - 60);
  var left = Math.max(0, (window.screenX || 0) + Math.min(outerWidth || sw, sw) - w - 30), top = Math.max(0, (window.screenY || 0) + 50);
  try { window.open(u, "_blank", "popup=yes,noopener,noreferrer,width=" + w + ",height=" + hh + ",left=" + left + ",top=" + top); return true; } catch (e) { return false; }
}
function webArticle(ch, t, o) {   // o.page：在「圖一」樣式的頁面裡（章名、標題已經寫在上面，這裡不再寫）
  o = o || {};
  var a = h("article", { class: "art" });
  if (o.width) a.style.setProperty("--aw", o.width + "px");
  if (!o.page) {
    a.appendChild(h("div", { class: "crumb" }, [ch.name]));
    a.appendChild(h("h2", {}, hlNodes(t.name || "（還沒有標題）", o.hl)));
  }
  var goFn = o.hb ? function (id) { return _yzGoTarget_(o.hb, id, ch.id); } : null;
  if (o.hb) _yzLadderNumberAll_(o.hb);   // 條文「接續上一段」：先算好這一章每一段從第幾號開始
  var hidN = 0, shown = 0;
  (t.blocks || []).forEach(function (b, bIdx) {
    if (_yzOnlyHide_(b, "web")) { hidN++; return; }   // 第 41 批：只在 LINE 的這一塊：網頁不放
    var el = null;
    if (b.t === "text") el = webText(b.v, o.hl, { go: goFn, onTitle: o.onTitle, onChapter: o.onChapter, pics: b.pics, tbls: b.tbls, onImg: o.onImg });
    else if (b.t === "ladder") el = webLadder(b, o.hl, o);
    else if (b.t === "table") el = webTable(b, o.hl);
    else if (b.t === "img" && b.draw) el = webDraw(b, o);   // 第 40 批：流程圖
    else if (b.t === "img" && b.url) el = webFig(b, o);
    else if (b.t === "anim") el = webAnim(b, o);
    else if (b.t === "drug") el = webDrugs(b, o);   // 第 29 批：藥品卡片（補藥神器的藥）
    else if (b.t === "link") el = webLinks(b, o.hl, { tid: t.id, bi: bIdx, pv: !!o.pv || !o.page });   // 第 40 批（一起做的）：網址連結；第 43 批：檔案在手冊裡的小視窗看（編輯器的預覽＝試開）
    if (!el) return;
    var bi = _yzBlockInd_(b);
    if (bi) { el.style.marginLeft = (bi * 1.6).toFixed(1) + "em"; el.classList.add("bind"); }   // 整塊縮排（第 27 批：圖片、表格、動畫、階梯式也能縮排）
    a.appendChild(el); shown++;
  });
  if (hidN && !shown) a.appendChild(h("p", { class: "muted onlyln" }, ["💬 這一篇的內容放在 LINE：請到 LINE 的「藥戰手冊」看。"]));   // 第 41 批：全部都是只在 LINE 的
  if (o.hb) { var bk = webBacklinks(_yzBacklinks_(o.hb, [t.id, ch.id], t.id), ch.id, o.onTitle); if (bk) a.appendChild(bk); }   // 互相連結：從別的標題連到這裡的
  var pg = _yzPageText_(t.page), nt = _yzNoteHas_(t.note) ? String(t.note).replace(/^(?:[ \t　\r]*\n)+|(?:\r?\n[ \t　\r]*)+$/g, "") : "";   // 沒填備註（空白、只有空行、看不見的字）：不顯示備註框；前後多打的空行也拿掉
  var pgEl = pg ? h("div", { class: "pgline" + (nt ? " gap" : " solo") }, [h("span", { class: "pgtag" }, [h("span", {}, ["📖 藥戰手冊頁數　"]), h("b", {}, [pg])])]) : null;
  if (nt) {
    var nb = h("div", { class: "note" }, [h("b", { class: "nl" }, ["備註"])]);
    nb.appendChild(webText(nt, o.hl, { plain: true }));
    if (pgEl) nb.appendChild(pgEl);
    a.appendChild(nb);
  } else if (pgEl) a.appendChild(pgEl);   // 第 28 批：只寫了頁數（備註沒有字）：只放頁數小框，不要黃色的「備註」框
  if (YZ_CFG.footer) a.appendChild(h("div", { class: "foot" }, [YZ_NOTICE]));
  return a;
}
// 標籤（圖示＋名稱）＋圓點：網頁和編輯器共用（編輯器裡看到的標籤，就是網頁上的樣子）。ghost＝看不見的複製品（點擊層佔位置用）
function webSpotTag(s, cat, ghost) {
  var kids = [];
  if (!ghost) kids.push(h("i", { class: "sp-dot" }));
  if (cat.labels !== false && s.label) {
    var ico = s.st === "lock" ? "🔒" : s.ico, p = h("span", { class: "sp-tag" + (ghost ? " ghost" : "") });
    if (ico) p.appendChild(h("i", { class: "sp-ico" }, [ico]));
    p.appendChild(h("b", {}, [s.label]));
    if (s.st === "new") p.appendChild(h("em", { class: "sp-new", title: "新" }));
    kids.push(p);
  }
  return kids;
}
function mapSpotBox(s) { return "left:" + s.x + "%;top:" + s.y + "%;width:" + s.w + "%;height:" + s.h + "%"; }
function arCss(ar) { return /^\d+:\d+$/.test(ar || "") ? ar.replace(":", " / ") : "20 / 13"; }
var MAP_ZOOM = 1.3;
// 平面目錄圖（不能 3D 的時候）：圖＋標籤＋圓點。滑過：標籤變色、物品亮起來、鏡頭靠近、底下說明卡；手機第一下選到、第二下進去
// 第 25 批：cat.dim（預設開）＝整張圖淡一點，有按鍵的物品留一半顏色。做法：圖本身用 CSS 濾鏡變淡，
// 　每個物品框上面再疊一塊「原本顏色」的同一張圖（邊緣慢慢淡出），平常半透明、滑到時全彩又亮一點（跟 3D 的樣子一樣）。
function webCatalogMap(cat, hb, o) {
  o = o || {};
  var spots = _yzMapSpots_(cat).slice(0, YZ_MAP_MAX), fx = cat.fx !== false && o.fx !== false, dim = cat.dim !== false;
  // o.full：滿版（首頁）＝整張圖放進畫面裡（不裁掉），左右或上下留深色邊
  var touch = !!(window.matchMedia && window.matchMedia("(hover: none)").matches), still = reduceMotion();
  var box = h("div", { class: "catmap" + (fx ? " fx" : "") + (dim ? " dim" : "") });
  if (o.width) box.style.maxWidth = o.width + "px";
  if (o.full) { var arN = (function () { var a = String(cat.ar || "20:13").split(":"); return (Number(a[0]) || 20) / (Number(a[1]) || 13); })(); box.classList.add("full"); box.style.width = "min(100%, calc(var(--hsh, 80vh) * " + arN.toFixed(4) + "))"; }
  var stage = h("div", { class: "catstage", style: "aspect-ratio:" + arCss(cat.ar) });
  var cam = h("div", { class: "catcam", "aria-hidden": "true" }, [h("img", { src: o.img || cat.img, alt: "", draggable: "false" })]);
  var hit = h("div", { class: "cathit" }), vis = {}, pat = {}, info = null, cur = null, leaveT = 0, lastPT = "";
  stage.appendChild(cam);
  if (dim || fx) {   // 物品上面那一塊「原本顏色」的圖：照物品的形狀（沒有輪廓＝整個框）挖出來、邊緣淡出（遮罩是畫布畫的）
    var src = o.img || cat.img, A = (function () { var a = String(cat.ar || "20:13").split(":"); return (Number(a[0]) || 20) / (Number(a[1]) || 13); })();
    spots.forEach(function (s) {
      if (s.st === "lock") return;   // 還沒開放的：一直是淡的，不用疊
      var ey = 2.4, ex = ey / A, R = [s.x, s.y, s.x + s.w, s.y + s.h];
      if (Array.isArray(s.shape)) s.shape.forEach(function (rg) { for (var k = 0; k + 1 < rg.length; k += 2) { R[0] = Math.min(R[0], rg[k]); R[2] = Math.max(R[2], rg[k]); R[1] = Math.min(R[1], rg[k + 1]); R[3] = Math.max(R[3], rg[k + 1]); } });   // 物品比框大（第 27 批：整本書、整個藥盤）：這一塊要包住整個物品
      var X = Math.max(0, R[0] - ex), Y = Math.max(0, R[1] - ey), Wp = Math.min(100, R[2] + ex) - X, Hp = Math.min(100, R[3] + ey) - Y;
      if (Wp <= 0 || Hp <= 0) return;
      var mk = spotMask(s, X, Y, Wp, Hp, A); if (!mk) return;
      var bx = Wp < 100 ? (X / (100 - Wp)) * 100 : 0, by = Hp < 100 ? (Y / (100 - Hp)) * 100 : 0;
      pat[s.id] = cam.appendChild(h("i", { class: "spc", "data-id": s.id, "aria-hidden": "true", style: "left:" + X.toFixed(3) + "%;top:" + Y.toFixed(3) + "%;width:" + Wp.toFixed(3) + "%;height:" + Hp.toFixed(3) + "%;-webkit-mask-image:" + cssUrl(mk) + ";mask-image:" + cssUrl(mk) }, [
        h("b", { style: "background-image:" + cssUrl(src) + ";background-size:" + (10000 / Wp).toFixed(3) + "% " + (10000 / Hp).toFixed(3) + "%;background-position:" + bx.toFixed(3) + "% " + by.toFixed(3) + "%" })
      ]));
    });
  }
  if (fx) {
    var dust = h("div", { class: "dust", "aria-hidden": "true" }), r = 7;
    var rnd = function () { r = (r * 16807) % 2147483647; return r / 2147483647; };
    for (var i = 0; i < 22; i++) dust.appendChild(h("i", { style: "left:" + (rnd() * 100).toFixed(1) + "%;top:" + (25 + rnd() * 70).toFixed(1) + "%;--s:" + (2 + rnd() * 3).toFixed(1) + "px;--t:" + (9 + rnd() * 9).toFixed(1) + "s;--dl:-" + (rnd() * 14).toFixed(1) + "s;--dx:" + ((rnd() - 0.5) * 44).toFixed(0) + "px" }));
    stage.appendChild(dust);
    info = h("div", { class: "catinfo", role: "button", tabindex: "-1" }, [
      h("div", { class: "ci-txt" }, [h("div", { class: "ci-t" }), h("div", { class: "ci-d" })]),
      h("span", { class: "ci-go", "aria-hidden": "true", html: '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 5l7 7-7 7" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' })
    ]);
  }
  function cls(s) { return "mspot pos-" + _yzMapPos_(s.pos) + (s.st ? " st-" + s.st : "") + (s.empty && s.st !== "lock" ? " empty" : ""); }
  function infoOf(s) { return _yzMapToInfo_(s.to, hb); }
  function title(s) { return s.label || infoOf(s).short || "打開"; }
  function fill(s) {
    if (!info) return;
    $(".ci-t", info).textContent = (s.st === "lock" ? "🔒 " : "") + title(s);
    $(".ci-d", info).textContent = s.st === "lock" ? "還在整理，開放後這裡的標籤會變回彩色。" : s.empty ? "這一章還沒有標題：藥師看到的是🔒（寫好第一個標題就自動打開）" : (s.desc || infoOf(s).name || "");
    info.classList.toggle("lock", s.st === "lock");
  }
  function aim(s) {
    var W = stage.clientWidth, H = stage.clientHeight; if (!W || !H) return;
    var ax = (s.x + s.w / 2) / 100 * W, ay = (s.y + s.h / 2) / 100 * H, tx0 = W * 0.5, ty0 = H * 0.42, k = 0.62;
    var nx = ax + (tx0 - ax) * k, ny = ay + (ty0 - ay) * k;
    var tx = Math.min(0, Math.max(W - MAP_ZOOM * W, nx - MAP_ZOOM * ax)), ty = Math.min(0, Math.max(H - MAP_ZOOM * H, ny - MAP_ZOOM * ay));
    cam.style.transform = "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px) scale(" + MAP_ZOOM + ")";
  }
  function light(s) {   // 滑到的物品亮起來（還沒開放的不亮）；其他地方暗一點
    var on = !!(s && fx && s.st !== "lock");
    Object.keys(pat).forEach(function (id) { pat[id].classList.toggle("on", on && id === s.id); });
    box.classList.toggle("foc", on);
  }
  function pick(s) {
    clearTimeout(leaveT); cur = s;
    Object.keys(vis).forEach(function (id) { vis[id].classList.toggle("on", id === s.id); });
    light(s);
    if (!fx) return;
    fill(s); info.classList.add("show");
    if (!still) aim(s);
  }
  function unpick() { cur = null; Object.keys(vis).forEach(function (id) { vis[id].classList.remove("on"); }); light(null); if (fx) { info.classList.remove("show"); cam.style.transform = ""; } }
  function leave() { clearTimeout(leaveT); leaveT = setTimeout(unpick, 150); }
  function go(s) {
    if (s.st === "lock") { if (o.onLock) o.onLock(s); else toast("🔒 「" + title(s) + "」還在整理，開放以後就能看"); return; }
    if (o.onSpot) o.onSpot(s.to, s);
  }
  spots.forEach(function (s, i) {
    vis[s.id] = cam.appendChild(h("div", { class: "spv " + cls(s), style: mapSpotBox(s) + ";--d:" + ((i * 0.43) % 2.6).toFixed(2) + "s" }, webSpotTag(s, cat, false)));
    var nm = title(s), inf = infoOf(s);
    var b = h("button", { type: "button", class: cls(s) + " spot", "data-id": s.id, style: mapSpotBox(s), "aria-label": nm + (s.st === "lock" ? "（還沒開放）" : "：" + inf.name), title: s.st === "lock" ? "還沒開放" : inf.name }, webSpotTag(s, cat, true));
    b.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") pick(s); });
    b.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") leave(); });
    b.addEventListener("pointerdown", function (e) { lastPT = e.pointerType; });
    b.addEventListener("focus", function () { var kbd = true; try { kbd = b.matches(":focus-visible"); } catch (x) { /* 舊瀏覽器 */ } if (kbd) pick(s); });
    b.addEventListener("blur", function () { leave(); });
    b.addEventListener("click", function (e) {
      var tch = lastPT ? lastPT !== "mouse" : touch; lastPT = "";
      if (tch && fx && cur !== s) { e.preventDefault(); pick(s); return; }   // 手機：第一下只是「選到」，第二下才進去
      go(s);
    });
    hit.appendChild(b);
  });
  stage.appendChild(hit);
  if (info) {
    stage.appendChild(info);
    info.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") clearTimeout(leaveT); });
    info.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") leave(); });
    info.addEventListener("click", function () { if (cur) go(cur); });
    info.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && cur) { e.preventDefault(); go(cur); } });
  }
  stage.addEventListener("click", function (e) { if (!(e.target.closest && e.target.closest(".spot, .catinfo")) && cur) unpick(); });
  box.appendChild(stage);
  return box;
}
// 平面目錄圖的遮罩：這一塊（X、Y、Wp、Hp，整張圖的 %）裡，地點的形狀（物品輪廓；沒有＝圓角的框）塗白、邊緣模糊 → data: 網址
// 跟 3D 一樣用「影子」的模糊（Safari 不支援 ctx.filter）。畫不出來（很舊的瀏覽器）＝null（那一塊就不疊）。
function spotMask(s, X, Y, Wp, Hp, A) {
  try {
    var BASE = 1200, pw = Math.max(8, Math.round(Wp / 100 * BASE)), ph = Math.max(8, Math.round(Hp / 100 * BASE / A)), sx = pw / Wp, sy = ph / Hp;
    var cv = document.createElement("canvas"); cv.width = pw; cv.height = ph;
    var c = cv.getContext("2d"), blur = Math.max(2, 0.014 * BASE / A), off = pw + 60 + blur * 4;
    c.fillStyle = "#fff"; c.shadowColor = "#fff"; c.shadowBlur = blur; c.shadowOffsetX = off;
    c.beginPath();
    if (Array.isArray(s.shape) && s.shape.length) {
      s.shape.forEach(function (r) { for (var k = 0; k + 1 < r.length; k += 2) { var px = (r[k] - X) * sx - off, py = (r[k + 1] - Y) * sy; if (k) c.lineTo(px, py); else c.moveTo(px, py); } c.closePath(); });
    } else {
      var x = (s.x - X) * sx - off, y = (s.y - Y) * sy, w = s.w * sx, hh = s.h * sy, rr = Math.max(0, Math.min(w / 2, hh / 2, 2 * BASE / A / 100));
      c.moveTo(x + rr, y); c.arcTo(x + w, y, x + w, y + hh, rr); c.arcTo(x + w, y + hh, x, y + hh, rr); c.arcTo(x, y + hh, x, y, rr); c.arcTo(x, y, x + w, y, rr); c.closePath();
    }
    c.fill();
    return cv.toDataURL("image/png");
  } catch (e) { return null; }
}
// 3D 環景目錄（YZPano，hb3d.js）：圖要用「原始檔」（hbCatImg 拿來的，放記憶體），Google 的圖片網址不一定讓網頁讀像素。
// 不能 3D、拿不到原始檔、圖讀失敗 → 外面改用平面目錄（一樣能點）。一頁同時只留一個 3D（換頁、重畫前要 destroy）。
function panoOk(cat) { return !!(cat && cat.img && cat.fid && cat.p3d !== false && window.YZPano && YZPano.webglOk()); }
function webCatalogPano(parent, cat, hb, o) {
  o = o || {};
  if (!panoOk(cat) || !o.img) return null;
  var spots = _yzMapSpots_(cat).slice(0, YZ_MAP_MAX).map(function (s) { var inf = _yzMapToInfo_(s.to, hb); return Object.assign({}, s, { sub: inf.ok ? inf.name : "" }); });
  var wrap = h("div", { class: "panowrap" + (o.float ? " full" : "") }), box = h("div", { class: "pano" });
  if (o.width) wrap.style.maxWidth = o.width + "px";
  wrap.appendChild(box); parent.appendChild(wrap);
  var api = YZPano.mount(box, {
    img: o.img, ar: cat.ar, spots: spots, theta: cat.theta || 70, labels: cat.labels !== false, fx: cat.fx !== false, dim: cat.dim !== false, ctl: o.ctl || "", title: cat.title || "目錄", float: !!o.float, avoid: o.avoid,
    onOpen: function (s) { if (o.onSpot) o.onSpot(s.to, s); },
    onLock: function (s) { if (o.onLock) o.onLock(s); else toast("🔒 「" + (s.label || "這裡") + "」還在整理，開放以後就能看"); },
    onError: function () { if (o.onError) o.onError(); }
  });
  if (!api) { wrap.remove(); return null; }
  wrap._api = api;
  return wrap;
}
/* ───────── 章的主題（第 25 批）：背景＝目錄圖（圖一）上這一章的位置裁下來的圖；圖示＝目錄圖上那個地點的圖示 ───────── */
function cssUrl(u) { return 'url("' + String(u || "").replace(/["\\\n\r]/g, "") + '")'; }
function chIco(c, hb) { var o = _yzChIcons_(hb || HB); return (c && o[c.id]) || "📘"; }
function chBgUrl(c) { return _yzChBg_(c); }
// 章元卡片（沒有目錄圖時的首頁、編輯器的預覽）：主題圖＋圖示＋章名＋簡介。不寫「第幾章」
function webChapterCard(c, n, o) {
  o = o || {};
  var lock = !!o.lock, bg = chBgUrl(c), ico = o.ico || chIco(c, o.hb);
  var go = function () { if (o.onclick) o.onclick(); };
  var el = h("div", { class: "ccard" + (lock ? " lock" : ""), role: "button", tabindex: "0", "aria-label": (c.name || "") + (lock ? "（還在整理）" : ""), onclick: go, onkeydown: function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } } }, [
    bg && !lock ? h("div", { class: "cc-img", style: "background-image:" + cssUrl(bg) }) : h("div", { class: "cc-img noimg" }, [h("span", {}, [lock ? "🔒" : ico])]),
    h("div", { class: "cc-b" }, [
      h("div", { class: "cc-t" }, [(bg && !lock ? ico + " " : "") + (c.name || "（還沒有章名）")]),
      c.intro ? h("div", { class: "cc-it" }, [c.intro]) : null,
      h("div", { class: "cc-n" }, [lock ? "還在整理，開放以後就能看" : n ? n + " 個標題" : (IS_DEV ? "還沒有標題（藥師看到🔒）" : "還沒有內容")])
    ])
  ]);
  if (o.width) { el.style.width = o.width + "px"; el.style.cursor = "default"; }
  return el;
}

/* ───────── 看手冊 ───────── */
// view：""＝首頁／章／內容、"search"＝搜尋結果
var WV = { cid: null, tid: null, view: "", q: "", qv: "", hl: null, pano: null, flat: false };
function buildView() { WV = { cid: null, tid: null, view: "", q: "", qv: "", hl: null, pano: null, flat: false }; qzReset(); }
function seen(kind, label) { if (CFG && CFG.viewLog === false) return; call("hbSeen", [kind, String(label || "").slice(0, 80)]).then(function (x) { if (x && x.st === "lock") logout("expired"); }, function () { /* 記不到就算了 */ }); }
// 捲到某個地方以後，上面的圖才載好（高度變了）：再捲一次。自己動過畫面（滾輪、手指、按鍵）就不管；最多 5 秒
function keepInView(el) {
  var moved = false, t0 = Date.now(), stop = function () { moved = true; };
  ["wheel", "touchstart", "keydown", "mousedown"].forEach(function (ev) { window.addEventListener(ev, stop, { once: true, passive: true }); });
  Array.prototype.forEach.call(document.querySelectorAll("#pane-view img"), function (im) {
    if (im.complete || !(im.compareDocumentPosition(el) & 4)) return;   // 4＝這張圖在 el 前面
    im.addEventListener("load", function () { if (!moved && Date.now() - t0 < 5000 && el.isConnected) el.scrollIntoView({ block: "center" }); }, { once: true });
  });
}
function topOfView() { try { window.scrollTo(0, 0); } catch (e) { /* 沒關係 */ } }
function openChapter(cid) {
  var c = chapterOf(cid); if (!c) { toast("找不到這一章（可能被刪掉了）"); return; }
  var ts = titlesOf(cid);
  if (ts.length === 1) { openTitle(ts[0].id); return; }
  WV.cid = cid; WV.tid = null; WV.view = ""; WV.hl = null; drawWeb(); topOfView();
  seen("開啟章", c.name);
}
function openTitle(tid, hl) {
  var t = titleOf(tid); if (!t) { toast("找不到這個標題（可能被刪掉了）"); return; }
  var c = chapterOf(t.ch);
  WV.cid = t.ch; WV.tid = tid; WV.view = ""; WV.hl = hl && hl.length ? hl : null; drawWeb();
  var m = $("#pane-view mark, #pane-view figure.ocrhit"); if (m) { m.scrollIntoView({ block: "center" }); keepInView(m); } else topOfView();   // 第一個符合的字（或圖裡有那個字的那張圖）
  seen("看標題", (c ? c.name + "　" : "") + t.name);
}
function webSearch(q) {
  q = String(q || "").trim().slice(0, 60); WV.qv = q;
  if (!q) { WV.view = ""; drawWeb(); return; }
  WV.q = q; WV.view = "search"; WV.tid = null; drawWeb(); topOfView();
}
function goHome() { WV.cid = null; WV.tid = null; WV.view = ""; drawWeb(); topOfView(); }
function goHomeTab() { if (TAB !== "view") showTab("view"); goHome(); }   // 標誌、「🏠 首頁」、「‹ 調劑台」
function homeName() { return homeMapOn() ? ((HB.cat && HB.cat.title) || "藥師調劑台") : "首頁"; }

function drawWeb() {
  var root = $("#pane-view"); if (!root || !HB) return;
  if (WV.pano) { try { WV.pano.destroy(); } catch (e) { /* 沒關係 */ } WV.pano = null; }
  root.innerHTML = "";
  var atHome = !WV.cid && !WV.tid && !WV.view;
  if (atHome && homeMapOn()) drawHomeFull(root);   // 首頁＝滿版調劑台
  else { homeClass(true); drawPage(root, atHome); }   // 章、標題、搜尋、問卷（還有沒有目錄圖時的首頁）：也是整個畫面，上面那一排收起來
  qzPeek();   // 第 32 批：左下角「📋 問卷」要不要出現（5 分鐘問一次）
}

/* ───────── 章、標題、搜尋、沒有目錄圖時的首頁：照「圖一」的樣子（第 25 批）─────────
   背景＝這一章在目錄圖上的位置（放大、淡淡的）；上下各一條跑馬燈；左上「‹ 調劑台」（回上一層）；右上「藥戰手冊」標誌（＝回首頁）；
   名字、閒置倒數、登出在下面一行；每個標題一張粗黑框卡片，按了打開。
   第 28 批：大標題兩邊的波浪線拿掉；那個位置可以放自己上傳的符號（編輯器「📢 跑馬燈・大標題」；例如以後的藥劑部標誌），沒放就空著。 */
function pgSym() { var s = HB && HB.cat && HB.cat.sym; return s && /^https:\/\//.test(s.url || "") ? s : null; }
function pgHead(title, sub) {
  var sym = pgSym();
  var box = h("div", { class: "pgh" + (sym ? " sym" : "") }, [sym ? h("img", { class: "pgsym", src: sym.url, alt: "", "aria-hidden": "true" }) : null, h("h1", {}, [title])]);
  return sub ? h("div", {}, [box, h("div", { class: "pgsub" }, [h("span", {}, [sub])])]) : box;
}
function pgCard(kids, o) {   // 一張粗黑框卡片；o.go：整張可以按
  o = o || {};
  var el = h("div", { class: "pcard" + (o.cls ? " " + o.cls : "") }, kids);
  if (o.go) {
    el.setAttribute("role", "button"); el.setAttribute("tabindex", "0");
    if (o.label) el.setAttribute("aria-label", o.label);
    el.addEventListener("click", function (e) { if (e.target.closest && e.target.closest("a")) return; o.go(); });
    el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); o.go(); } });
  } else el.classList.add("flat");
  return el;
}
function titleThumb(t) {   // 標題卡片上的小圖：內容裡的第一張圖（沒有就不放）
  var u = "";
  (t.blocks || []).some(function (b) {
    if (_yzOnlyHide_(b, "web")) return false;   // 第 41 批：只在 LINE 的圖不拿來當網頁的小圖
    if (b.t === "img" && b.url) u = b.url;
    else if (b.t === "anim") u = b.kind === "steps" ? (((b.steps || []).filter(function (x) { return x && x.url; })[0] || {}).url || "") : (b.poster || "");
    else if (b.t === "ladder") { var im = _yzLadderImgs_(b)[0]; if (im) u = im.img.url; }
    return !!u;
  });
  return /^https:\/\//.test(u) ? u : "";
}
function pgStatus() {   // 名字、閒置倒數、登出（開發者多「編輯」「管理」）
  var who = (ME.name || "") + (ME.emp ? "　" + ME.emp : "") + (IS_DEV && ME.name !== "開發者" ? "　（開發者）" : "");
  return h("div", { class: "pgme" }, [
    h("div", { class: "hwho" }, [who ? h("b", {}, [who]) : null, h("span", { class: "idle" }, [""]), h("span", { class: "idle short", "aria-hidden": "true" }, [""])]),
    IS_DEV ? btn("✏️ 編輯", function () { showTab("edit"); }, "sm hbtn") : null,
    IS_DEV ? btn("👥 管理", function () { showTab("admin"); }, "sm hbtn") : null,
    btn("登出", function () { logout("out"); }, "sm hbtn")
  ]);
}
function drawPage(root, atHome) {
  var isQz = WV.view === "qz", other = WV.view === "search" || isQz;   // 第 32 批：問卷頁
  var t = !other && WV.tid ? titleOf(WV.tid) : null;
  var c = other ? null : t ? chapterOf(t.ch) : (WV.cid ? chapterOf(WV.cid) : null);
  if (!atHome && !other && !c) { WV.cid = null; WV.tid = null; atHome = true; }
  var bg = c ? chBgUrl(c) : "", ico = c ? chIco(c) : "";
  var pg = h("section", { class: "pg" + (bg ? " has-bg" : "") + (isQz ? " qzpg" : ""), "aria-label": c ? c.name : WV.view === "search" ? "搜尋" : isQz ? "問卷" : "藥戰手冊" });
  var back = h("div", { class: "pgbg", "aria-hidden": "true" });
  if (bg) back.style.backgroundImage = cssUrl(bg);
  pg.appendChild(back);
  var mqOn = mqConf(HB.cat).on, mqName = c ? c.name : WV.view === "search" ? "搜尋" : isQz ? "問卷" : "";
  if (mqOn) pg.appendChild(marquee(mqWords(mqName))); else pg.style.setProperty("--mqh", "0px");
  var pwb = c && !other && titlesOf(c.id).length ? pwBar(c, t) : null;   // 第 43 批：現在讀到哪裡（這一章每一篇排一排，讀到的亮）
  if (pwb) pg.appendChild(pwb);
  var col = h("div", { class: "pgcol" });
  // 上：‹ 回上一層 ＋ 標誌
  var up = isQz ? qzBackBtn() : null;   // 問卷：作答、結果頁＝「‹ 問卷清單」
  if (!up && t && c && titlesOf(c.id).length > 1) up = h("button", { class: "pgback", type: "button", onclick: function () { openChapter(c.id); } }, ["‹ " + c.name]);
  else if (!up && !atHome) up = h("button", { class: "pgback", type: "button", onclick: goHome }, ["‹ " + homeName()]);
  col.appendChild(h("div", { class: "pgtop" }, [up || h("span"), h("button", { class: "pglogo", type: "button", title: "回首頁", onclick: goHomeTab }, [h("span", { class: "lgb" }, [logoImg()]), "藥戰手冊"])]));
  col.appendChild(pgStatus());
  if (WV.view === "search") drawSearchResults(col);
  else if (isQz) qzDraw(col);
  else if (t) drawTitlePage(col, c, t);
  else if (c) drawChapterPage(col, c, ico, bg);
  else drawHome(col);
  if (YZ_CFG.footer) col.appendChild(h("div", { class: "pgfoot" }, [YZ_NOTICE]));
  pg.appendChild(col);
  if (mqOn) pg.appendChild(marquee(mqWords(mqName), "mqb"));
  pg.appendChild(h("div", { class: "pgdock" }, [
    btn("🔍 搜尋", function () { homeSearch(pg); }, "hfab"),
    btn("☰ 章元", function () { homeDrawer(pg); }, "hfab"),
    qzFab()
  ]));
  if (!atHome) pg.appendChild(h("button", { class: "hhome", type: "button", onclick: goHome, title: "回首頁" }, ["🏠 首頁"]));
  root.appendChild(pg);
  if (WV.cid || WV.tid || WV.view) pg.style.setProperty("--colw", (t ? Math.min(1000, Math.max(680, (t.ww || 760) + 70)) : isQz ? 760 : 680) + "px");
  if (pwb) { PW.cur = ""; if (t) pwSet(t.id); else pwScan(); }
  idleTick();
}
/* ── 第 43 批：上面固定一條「現在讀到哪裡」：這一章第 1 層的標題排成一排（太多可以左右滑），讀到的那一篇亮（黃底）；
   有分層的章：下面一行寫現在這一篇（在子標題裡＝「└ 子標題 › 再下一層」）。章的頁面：捲到哪一篇就亮哪一篇；點了直接捲過去。
   單篇的頁面：亮這一篇（或它的上層），點了打開那一篇。高度固定（不會捲一捲就跳）。 */
var PW = { raf: 0, cur: "", lock: 0 };   // lock：點了跳過去、還在捲的時候（上面那一條不跟著中間經過的篇跳）
var YZ_NO_RE = /^\s*[（(]?\s*(?:[0-9０-９]+|[一二三四五六七八九十百]+|[壹貳參叁肆伍陸柒捌玖拾]+)\s*(?:[、.．:：)）]|\s)|^\s*[（(]?\s*[A-Za-zＡ-Ｚａ-ｚ]\s*[、.．:：)）]|^\s*第\s*[0-9０-９一二三四五六七八九十百]+\s*[章節篇條項部]/;
function tocLabel(t, k, deep) { var n = t.name || "（還沒有標題）"; return deep || YZ_NO_RE.test(n) ? n : (k + 1) + ". " + n; }   // 照打的名字；沒分層、名字自己沒有編號的才在前面加「1.」
function pwBar(c, t) {
  var ts = titlesOf(c.id), lvs = _yzTLvs_(ts), deep = lvs.some(function (v) { return v > 1; });
  var row = h("div", { class: "pw-l" });
  ts.forEach(function (x, k) {
    if (lvs[k] !== 1) return;
    if (row.firstChild) row.appendChild(h("span", { class: "pw-sep", "aria-hidden": "true" }, ["｜"]));
    row.appendChild(h("button", { class: "pw-i", type: "button", "data-tid": x.id, onclick: function () { if (WV.tid) { if (x.id !== WV.tid) openTitle(x.id); } else pwJump(x.id); } }, [x.name || "（還沒有標題）"]));
  });
  var bar = h("nav", { class: "pgwhere" + (deep ? " deep" : ""), "aria-label": "現在讀到哪裡" }, [
    h("div", { class: "pw-row" }, [h("button", { class: "pw-ch", type: "button", title: t ? "回到這一章" : "回到這一章最上面", onclick: function () { if (WV.tid) openChapter(c.id); else { topOfView(); pwScan(); } } }, [chIco(c) + " " + (c.name || "")]), row]),
    deep ? h("div", { class: "pw-sub", "aria-live": "polite" }, [""]) : null
  ]);
  bar._ts = ts; bar._lvs = lvs;
  return bar;
}
function pwSet(tid) {   // 讀到 tid 那一篇（可以是子標題）：亮它的第 1 層；有分層：下面那一行寫它
  var bar = $(".pgwhere"); if (!bar || !bar._ts) return;
  var ts = bar._ts, lvs = bar._lvs, i = 0;
  ts.some(function (x, k) { if (x.id === tid) { i = k; return true; } return false; });
  var top = i; while (top > 0 && lvs[top] > 1) top--;
  var topId = ts[top] ? ts[top].id : "";
  $$(".pw-i", bar).forEach(function (b) {
    var on = b.getAttribute("data-tid") === topId;
    b.classList.toggle("on", on);
    if (on) b.setAttribute("aria-current", "location"); else b.removeAttribute("aria-current");
  });
  var sub = $(".pw-sub", bar);
  if (sub && ts[i]) {
    var p = lvs[i] > 1 ? _yzTPath_(ts, ts[i]).slice(1).concat([ts[i]]) : [];
    sub.textContent = p.length ? "└ " + p.map(function (x) { return x.name || "（還沒有標題）"; }).join(" › ") : "▸ " + (ts[i].name || "（還沒有標題）");
  }
  if (PW.cur !== topId) {   // 亮的那一個滑到看得到的地方（只滑這一排，不動整頁；剛打開這一頁：直接到，不用滑過去）
    var first = !PW.cur;
    PW.cur = topId;
    var row = $(".pw-l", bar), ab = $(".pw-i.on", bar);
    if (row && ab && row.scrollWidth > row.clientWidth + 2) {
      if (first || window.__SHOT) row.style.scrollBehavior = "auto";
      row.scrollLeft = Math.max(0, ab.offsetLeft - (row.clientWidth - ab.offsetWidth) / 2);
      if (first || window.__SHOT) row.style.scrollBehavior = "";
    }
  }
}
function pwOff() { var mq = $(".pg>.mq:not(.mqb)"), bar = $(".pgwhere"); return (mq ? mq.offsetHeight : 0) + (bar ? bar.offsetHeight : 0); }
function pwScan() {   // 章的頁面：現在讀到哪一篇（最上面那一條下面、最後一個捲過去的；捲到底＝最後一篇）
  PW.raf = 0;
  var bar = $(".pgwhere"); if (!bar || WV.tid) return;
  var ss = $$(".chsec"); if (!ss.length) return;
  var lim = pwOff() + 14, cur = ss[0];
  ss.forEach(function (x) { if (x.getBoundingClientRect().top <= lim) cur = x; });
  var de = document.documentElement;
  if (window.pageYOffset > 40 && window.innerHeight + window.pageYOffset >= de.scrollHeight - 4) cur = ss[ss.length - 1];
  pwSet(cur.getAttribute("data-tid") || "");
}
function pwJump(tid) {   // 捲到那一篇（扣掉上面固定的那兩條）
  var el = document.getElementById("cht-" + tid); if (!el) return;
  var y = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - pwOff() - 8);
  try { window.scrollTo({ top: y, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches || window.__SHOT ? "auto" : "smooth" }); } catch (e) { window.scrollTo(0, y); }
  pwSet(tid);
  var my = PW.lock = Date.now() + 1600;   // 捲到了（或 1.6 秒）就放開；點的那一篇一直亮著，直到自己再捲
  var done = function () { window.removeEventListener("scrollend", done); if (PW.lock === my) PW.lock = 0; };
  window.addEventListener("scrollend", done);
  setTimeout(done, 1600);
}
window.addEventListener("scroll", function () { if (PW.lock && Date.now() < PW.lock) return; if (!PW.raf && $(".pgwhere") && !WV.tid) PW.raf = requestAnimationFrame(pwScan); }, { passive: true });
["wheel", "touchstart", "keydown"].forEach(function (k) { window.addEventListener(k, function () { PW.lock = 0; }, { passive: true }); });   // 自己捲：馬上跟著
window.addEventListener("resize", function () { if (!PW.raf && $(".pgwhere") && !WV.tid) PW.raf = requestAnimationFrame(pwScan); });
function drawChapterPage(col, c, ico, bg) {
  var tts = titlesOf(c.id);
  col.appendChild(pgHead(ico + " " + c.name, c.intro || (tts.length ? tts.length + " 個標題" : "")));
  if (IS_DEV && !bg) col.appendChild(h("div", { class: "pgdev" }, [homeMapOn() || (HB.cat && HB.cat.img) ? "（開發者）這一章在目錄圖上沒有地點，所以沒有背景：到「✏️ 編輯」→「🖼 目錄圖」新增一個連到這一章的地點，按「儲存」就會自動做好。" : "（開發者）還沒有背景：先到「✏️ 編輯」→「🖼 目錄圖」放圖一，按「儲存」，每一章的背景就會自動做好。"]));
  if (!tts.length) {
    col.appendChild(pgCard([h("div", { class: "pc-t" }, [IS_DEV ? "這一章還沒有標題" : "🔒 這一章還在整理"]), h("div", { class: "pc-note" }, [IS_DEV ? "藥師在首頁看到的是🔒。到「✏️ 編輯」新增第一個標題，就會自動打開。" : "還沒有內容，開放以後就能看。"])]));
    return;
  }
  // 第 28 批：整章的內容直接展開（不用一篇一篇點進去）；上面一排是標題清單，點了直接捲到那一篇
  // 第 43 批：標題分層的章：清單改成直的一列（子標題往右縮，像目錄）；名字照打的（沒分層、名字沒有自己編號的才加「1.」）
  var lvs = _yzTLvs_(tts), deep = lvs.some(function (v) { return v > 1; });
  if (tts.length > 1) {
    var toc = h("div", { class: "chtoc" + (deep ? " deep" : "") }, [h("div", { class: "chtoc-h" }, ["這一章有 " + tts.length + " 個標題（點了直接捲到那一篇）"])]), tl = h("div", { class: "chtoc-l" });
    tts.forEach(function (tt, k) {
      tl.appendChild(h("button", { class: "chtoc-b" + (deep ? " lv" + lvs[k] : ""), type: "button", onclick: function () { pwJump(tt.id); } }, [tocLabel(tt, k, deep)]));
    });
    toc.appendChild(tl);
    col.appendChild(pgCard([toc], { cls: "slim" }));
  }
  tts.forEach(function (tt, k) {
    var lv = lvs[k], art = webArticle(c, tt, { width: tt.ww || 760, onImg: lightbox, hl: null, hb: HB, onTitle: openTitle, onChapter: openChapter, page: true });
    art.insertBefore(h("div", { class: "chsec-h" }, [h(lv === 1 ? "h2" : lv === 2 ? "h3" : "h4", { class: "chsec-t" }, [tt.name || "（還沒有標題）"]), h("button", { class: "pbtn chsec-o", type: "button", onclick: function () { openTitle(tt.id); }, "aria-label": "單獨看「" + (tt.name || "") + "」" }, ["單獨看 ›"])]), art.firstChild);
    col.appendChild(h("section", { class: "chsec lv" + lv, id: "cht-" + tt.id, "data-tid": tt.id }, [h("div", { class: "pgart" }, [art])]));
  });
  var bk = webBacklinks(_yzBacklinks_(HB, [c.id], null), c.id, openTitle);   // 互相連結：從別的標題連到這一章的
  if (bk) col.appendChild(pgCard([bk]));
}
function drawTitlePage(col, c, t) {
  var ts = titlesOf(c.id), i = ts.indexOf(t);
  col.appendChild(pgHead(t.name || "（還沒有標題）"));
  var up = _yzTPath_(ts, t);   // 第 43 批：子標題：章 › 上層 › 再上層（點了打開那一篇）
  col.appendChild(h("div", { class: "pgsub pgpath" }, [h("button", { class: "pgchip", type: "button", onclick: function () { openChapter(c.id); } }, [chIco(c) + " " + c.name])].concat(up.map(function (x) {
    return h("button", { class: "pgchip up", type: "button", onclick: function () { openTitle(x.id); } }, [x.name || "（還沒有標題）"]);
  }))));
  var art = webArticle(c, t, { width: t.ww || 760, onImg: lightbox, hl: WV.hl, hb: HB, onTitle: openTitle, onChapter: openChapter, page: true });
  col.appendChild(h("div", { class: "pgart" }, [art]));
  col.appendChild(h("div", { class: "pgnav" }, [
    i > 0 ? h("button", { class: "pbtn nav", type: "button", onclick: function () { openTitle(ts[i - 1].id); } }, ["‹ " + ts[i - 1].name]) : h("span"),
    i < ts.length - 1 ? h("button", { class: "pbtn nav", type: "button", onclick: function () { openTitle(ts[i + 1].id); } }, [ts[i + 1].name + " ›"]) : h("span")
  ]));
  if (IS_DEV) col.appendChild(h("div", { class: "pgnav c" }, [h("button", { class: "pbtn nav", type: "button", onclick: function () { gotoEdit(t.id); } }, ["✏️ 在編輯器打開這個標題"])]));
}
function drawHome(col) {   // 還沒有目錄圖（或「開啟目錄圖」關著）的首頁：章元卡片
  WV.cid = null; WV.tid = null;
  col.appendChild(pgHead("藥戰手冊", "點一章開始看；或用左下角的「🔍 搜尋」"));
  var g = h("div", { class: "pgrid" });
  HB.chapters.forEach(function (c) {
    var n = titlesOf(c.id).length, lock = !n && !IS_DEV;
    g.appendChild(webChapterCard(c, n, { lock: lock, onclick: function () { if (lock) { homeLockToast(c.name); return; } openChapter(c.id); } }));
  });
  col.appendChild(g);
}
/* ───────── 首頁：滿版調劑台（照參考網站：一打開整個畫面就是調劑台）─────────
   最上面一條跑馬燈；左上角「藥戰手冊」標誌＋提示；右上角名字、閒置倒數、登出（開發者多「編輯」「管理」）；
   左下角 🔍 搜尋、☰ 章元；右下角是 3D 的按鍵。還沒有目錄圖（或「開啟目錄圖」關著）：用章元卡片當首頁。 */
function homeMapOn() { var c = HB && HB.cat; return !!(c && c.on && c.img); }
function homeClass(on) { if (APP) APP.classList.toggle("home-on", !!on); }
function homeLockToast(name) { toast("🔒 「" + (name || "這一章") + "」還在整理，開放以後就能看"); }
/* 跑馬燈：開發者在編輯器「📢 跑馬燈」改（開關、內容一段一段、速度）；沒設定過＝預設。「［這一頁］」＝那一頁的名字 */
var MQ_PAGE = "［這一頁］", MQ_SPEED = { slow: 1.1, mid: 0.74, fast: 0.45 };   // 每個字跑幾秒（字越多，一圈越久，看起來一樣快）
function mqDefault() { return ["藥戰手冊", MQ_PAGE].concat(YZ_CFG.footer ? [YZ_NOTICE.replace(/[。.]$/, "")] : []); }
function mqConf(cat) {
  var q = cat && cat.mq;
  if (!q) return { on: true, items: mqDefault(), speed: "mid" };
  return { on: q.on !== false, items: (q.items || []).length ? q.items.slice() : ["藥戰手冊", MQ_PAGE], speed: MQ_SPEED[q.speed] ? q.speed : "mid" };
}
function mqWordsOf(conf, name) { return conf.items.map(function (w) { return String(w).split(MQ_PAGE).join(name); }); }
function mqWords(name) { return mqWordsOf(mqConf(HB && HB.cat), name || (HB && HB.cat && HB.cat.title) || "藥師調劑台"); }
function marquee(words, cls, speed) {
  var group = function () {
    var g = h("span", { class: "mq-g" });
    for (var i = 0; i < 6; i++) words.forEach(function (w) { g.appendChild(h("i", { class: "mq-ar" }, ["→"])); g.appendChild(h("b", {}, [w])); });
    return g;
  };
  var n = 0; words.forEach(function (w) { n += String(w).length + 2; });
  var el = h("div", { class: "mq" + (cls ? " " + cls : ""), "aria-hidden": "true" }, [h("div", { class: "mq-track" }, [group(), group()])]);   // 兩組一樣的接在一起，往左跑一組的寬度＝接得起來
  el.style.setProperty("--mqs", Math.max(16, Math.round(n * 6 * (MQ_SPEED[speed || mqConf(HB && HB.cat).speed] || MQ_SPEED.mid))) + "s");
  return el;
}
function drawHomeFull(root) {
  WV.cid = null; WV.tid = null;
  homeClass(true);
  var cat = _yzMapLive_(HB.cat, HB, IS_DEV);
  var goTo = function (to) { var m = /^([ctq]):(.+)$/.exec(to || ""); if (!m) return; if (m[1] === "q") { qzOpen(m[2] === "all" ? "" : m[2]); return; } if (m[1] === "c") openChapter(m[2]); else openTitle(m[2]); };   // 第 32 批：q＝問卷
  var onLock = function (s) { homeLockToast(s && s.label); };
  var home = h("section", { class: "home", "aria-label": "首頁（手冊目錄）" });
  var stage = h("div", { class: "hstage" }), scene = h("div", { class: "hscene" });
  if (mqConf(HB.cat).on) home.appendChild(marquee(mqWords(cat.title))); else home.style.setProperty("--mqh", "0px");   // 跑馬燈關掉：不放
  home.appendChild(stage); stage.appendChild(scene); root.appendChild(home);
  var flat = function () {
    if (WV.pano) { try { WV.pano.destroy(); } catch (e) { /* 沒關係 */ } WV.pano = null; }
    scene.innerHTML = ""; scene.classList.add("flat");
    scene.appendChild(webCatalogMap(cat, HB, { full: true, onSpot: goTo, onLock: onLock }));
  };
  if (panoOk(cat) && !WV.flat) {
    var u = catBlob(cat, function () { if (MAIN && TAB === "view" && !WV.tid && !WV.cid && !WV.view) drawWeb(); });
    if (u) {
      var pw = webCatalogPano(scene, cat, HB, { img: u, float: true, ctl: "hide", onSpot: goTo, onLock: onLock, onError: function () { WV.flat = true; flat(); },
        avoid: function () { return [$(".hbrand", stage), $(".hme", stage), $(".hdock", stage)]; } });   // 標籤避開蓋在圖上的標誌、名字、按鈕
      if (pw) WV.pano = pw._api; else flat();
    } else if (u === "") scene.appendChild(h("div", { class: "panoload hload", style: "background-image:url(\"" + String(cat.img).replace(/["\\]/g, "") + "\")" }, [h("span", {}, ["3D 目錄載入中…"])]));
    else flat();
  } else flat();
  // 左上：標誌＋提示
  stage.appendChild(h("div", { class: "hbrand" }, [
    h("h1", { class: "hlogo2" }, [h("span", { class: "lgb" }, [logoImg()]), h("span", { class: "sr" }, ["手冊目錄　"]), "藥戰手冊"]),   // 第 40 批：LOGO
    h("div", { class: "hchip" }, [cat.hint || "拖曳轉動、點圖上的按鍵，進到那一章"])
  ]));
  // 右上：誰、閒置倒數、登出（開發者：編輯、管理）
  var who = (ME.name || "") + (ME.emp ? "　" + ME.emp : "") + (IS_DEV && ME.name !== "開發者" ? "　（開發者）" : "");
  stage.addEventListener("scroll", function () { if (stage.scrollLeft || stage.scrollTop) { stage.scrollLeft = 0; stage.scrollTop = 0; } });
  stage.appendChild(h("div", { class: "hme" }, [
    h("div", { class: "hwho" }, [who ? h("b", {}, [who]) : null, h("span", { class: "idle" }, [""]), h("span", { class: "idle short", "aria-hidden": "true" }, [""])]),
    IS_DEV ? btn("✏️ 編輯", function () { showTab("edit"); }, "sm hbtn") : null,
    IS_DEV ? btn("👥 管理", function () { showTab("admin"); }, "sm hbtn") : null,
    btn("登出", function () { logout("out"); }, "sm hbtn")
  ]));
  // 左下：搜尋、章元
  stage.appendChild(h("div", { class: "hdock" }, [
    btn("🔍 搜尋", function () { homeSearch(stage); }, "hfab"),
    btn("☰ 章元", function () { homeDrawer(stage); }, "hfab"),
    qzFab()   // 第 32 批：有開放中的問卷、考試才出現
  ]));
  idleTick();
  if (WV.pano && WV.pano.refreshAvoid) WV.pano.refreshAvoid();
}
function homeSearch(stage) {
  var old = $(".hsearch", stage); if (old) { old.remove(); return; }
  var qin = h("input", { class: "in", type: "search", enterkeyhint: "search", placeholder: "搜尋手冊（打字，或打「第14頁」）", "aria-label": "搜尋手冊" });
  var box = h("form", { class: "hsearch", role: "search", onsubmit: function (e) { e.preventDefault(); var q = qin.value; box.remove(); webSearch(q); } }, [
    qin, h("button", { class: "btn pri", type: "submit" }, ["搜尋"]), h("button", { class: "btn", type: "button", "aria-label": "關掉搜尋", onclick: function () { box.remove(); } }, ["✕"])
  ]);
  box.addEventListener("keydown", function (e) { if (e.key === "Escape") box.remove(); });
  stage.appendChild(box);
  try { qin.focus(); } catch (e) { /* 沒關係 */ }
}
function homeDrawer(stage) {
  var close = function () { $$(".hdrawer, .hshade", stage).forEach(function (x) { x.remove(); }); };
  if ($(".hdrawer", stage)) { close(); return; }
  var list = h("nav", { class: "hdrawer", "aria-label": "章元" });
  list.appendChild(h("div", { class: "hdh" }, [h("b", {}, ["章元（" + HB.chapters.length + "）"]), h("button", { class: "btn sm", type: "button", "aria-label": "關掉章元", onclick: close }, ["✕"])]));
  var item = function (on, thumb, name, sub, label, fn) {
    return h("div", { class: "chI" + (on ? " on" : "") + (label.lock ? " lock" : ""), role: "button", tabindex: "0", "aria-label": label.text, onclick: fn, onkeydown: function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } } }, [
      thumb, h("div", {}, [h("div", { class: "t2" }, [name]), sub ? h("div", { class: "t1" }, [sub]) : null])
    ]);
  };
  var atHome = !WV.cid && !WV.tid && !WV.view;
  list.appendChild(item(atHome, h("div", { class: "th thi" }, ["🏠"]), homeName(), "", { text: "回首頁" }, function () { close(); goHome(); }));
  HB.chapters.forEach(function (c) {
    var n = titlesOf(c.id).length, lock = !n && !IS_DEV, bg = chBgUrl(c);
    var go = function () { if (lock) { homeLockToast(c.name); return; } close(); openChapter(c.id); };
    list.appendChild(item(WV.cid === c.id && !WV.view, bg && !lock ? h("div", { class: "th thimg", style: "background-image:" + cssUrl(bg) }) : h("div", { class: "th thi" }, [lock ? "🔒" : chIco(c)]),
      c.name, lock ? "還在整理" : n ? n + " 個標題" : "還沒有標題（藥師看到🔒）", { text: c.name + (lock ? "（還在整理）" : ""), lock: lock }, go));
  });
  list.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  stage.appendChild(h("div", { class: "hshade", onclick: close }));
  stage.appendChild(list);
  var f = $(".chI", list); if (f) try { f.focus(); } catch (e) { /* 沒關係 */ }
}
function drawSearchResults(col) {
  var r = _yzSearch_(HB, WV.q, "web");   // 第 41 批：只在 LINE 的那幾塊不算
  col.appendChild(pgHead(r.page ? "手冊第 " + r.page + " 頁" : "搜尋「" + WV.q + "」", r.hits.length ? "找到 " + r.hits.length + " 個標題" : ""));
  var qin = h("input", { class: "in", type: "search", enterkeyhint: "search", placeholder: "搜尋手冊（打字，或打「第14頁」）", value: WV.qv, "aria-label": "搜尋手冊" });
  col.appendChild(pgCard([h("form", { class: "pgsearch", role: "search", onsubmit: function (e) { e.preventDefault(); qin.blur(); webSearch(qin.value); } }, [qin, h("button", { class: "pbtn dark", type: "submit" }, ["搜尋"])])], { cls: "slim" }));
  if (!r.hits.length) col.appendChild(pgCard([h("div", { class: "pc-t" }, [r.page ? "手冊裡沒有對應這一頁的標題" : "手冊裡沒有「" + WV.q + "」"]), h("div", { class: "pc-note" }, [r.page ? "標題有填「藥戰手冊頁數」才找得到。" : "這裡只查手冊，不查藥。"])]));
  r.hits.forEach(function (hit) {
    var pg = _yzPageText_(hit.t.page), label = YZ_WHERE[hit.where] && hit.where !== "page" ? YZ_WHERE[hit.where] + "有符合" : "";
    col.appendChild(pgCard([
      h("div", { class: "pc-meta" }, [h("span", { class: "pc-ch" }, [chIco(hit.ch) + " " + [hit.ch.name].concat(_yzTPath_(titlesOf(hit.ch.id), hit.t).map(function (x) { return x.name; })).join(" › ")]), pg ? h("span", { class: "pc-pg" }, ["📖 " + pg]) : null, label ? h("span", {}, [label]) : null]),
      h("h2", { class: "pc-t" }, hlNodes(hit.t.name, r.toks)),
      hit.where !== "page" ? h("div", { class: "pc-note" }, hlNodes(hit.snip, r.toks, hit.where === "ocr")) : null
    ], { go: function () { openTitle(hit.t.id, r.toks); }, label: "打開「" + hit.t.name + "」" }));
  });
}

/* ════════ fview.js ════════ */
/* ═══════════════ fview.js：第 43 批：網址連結的檔案（Word、PDF、Excel、PPT、圖片）在手冊裡的小視窗看（只能看）═══════════════
   點了 → 跟後端要檔案（hbFile；Word、Excel、PPT 後端用雲端硬碟轉成 PDF）→
     PDF：用 PDF.js（hbpdf.js：第一次打開檔案才載入）一頁一頁畫在畫面上（捲到哪一頁才畫哪一頁）；圖片：直接放。
   只能看：沒有下載、列印的按鈕；不能右鍵、不能拖；浮水印蓋在上面；列印的時候整個不印。
   電腦：一個大的小視窗（手冊還在後面）；手機：整個畫面。放大縮小：－／＋／「適合寬度」（電腦也可以 Ctrl＋滾輪）。
   手機按「上一頁」也是關掉這個小視窗（不會離開手冊）。開發者在編輯器按「試開」：還沒存的網址也可以（hbFileTry）。 */
var FV = { el: null, doc: null, task: null, scale: 1, fit: true, n: 0, w1: 0, h1: 0, pages: [], io: null, seq: 0, img: null, url: "", lib: null, back: null, hist: false };
function fvB64(b) { var s = atob(String(b || "")), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
function fvLib() {   // PDF.js（第一次才載入；之後直接用）
  if (window.pdfjsLib && window.pdfjsWorker) return Promise.resolve(window.pdfjsLib);
  if (FV.lib) return FV.lib;
  FV.lib = new Promise(function (ok, bad) {
    var s = document.createElement("script");
    s.src = "hbpdf.js?v=" + HB_PDF_V;
    s.onload = function () { if (window.pdfjsLib && window.pdfjsWorker) ok(window.pdfjsLib); else { FV.lib = null; bad(new Error("看 PDF 的程式沒有載入好")); } };
    s.onerror = function () { FV.lib = null; bad(new Error("看 PDF 的程式（hbpdf.js）載入不了：請開發者確認 GitHub 上有放 hbpdf.js")); };
    document.head.appendChild(s);
  });
  return FV.lib;
}
function fvCMaps() {   // 字型對照表（hbcmap.js）：PDF 裡的中文字沒有嵌字型時才載入（大部分的 PDF 用不到）
  if (window.HB_CMAPS) return Promise.resolve(window.HB_CMAPS);
  if (FV.cml) return FV.cml;
  FV.cml = new Promise(function (ok, bad) {
    var s = document.createElement("script");
    s.src = "hbcmap.js?v=" + HB_PDF_V;
    s.onload = function () { if (window.HB_CMAPS) ok(window.HB_CMAPS); else { FV.cml = null; bad(new Error("字型對照表沒有載入好")); } };
    s.onerror = function () { FV.cml = null; bad(new Error("字型對照表（hbcmap.js）載入不了：請開發者確認 GitHub 上有放 hbcmap.js")); };
    document.head.appendChild(s);
  });
  return FV.cml;
}
function FvCMap() { /* PDF.js 要字型對照表時問這裡 */ }
FvCMap.prototype.fetch = function (o) {
  var nm = String(o && o.name || "");
  return fvCMaps().then(function (all) {
    var b = all[nm];
    if (!b) throw new Error("沒有這個字型對照表：" + nm);
    var lib = window.pdfjsLib, ct = lib && lib.CMapCompressionType ? lib.CMapCompressionType.BINARY : 1;
    return { cMapData: fvB64(b), compressionType: ct };
  });
};
function fvIco(k) { return (YZ_FILE_ICO && YZ_FILE_ICO[k]) || "📄"; }
function fvClose(fromPop) {
  FV.seq++;
  if (FV.io) { try { FV.io.disconnect(); } catch (e) { /* 沒關係 */ } FV.io = null; }
  if (FV.task) { try { FV.task.destroy(); } catch (e) { /* 沒關係 */ } FV.task = null; }
  if (FV.doc) { try { FV.doc.destroy(); } catch (e) { /* 沒關係 */ } FV.doc = null; }
  if (FV.url) { try { URL.revokeObjectURL(FV.url); } catch (e) { /* 沒關係 */ } FV.url = ""; }
  FV.pages = []; FV.img = null;
  var had = !!FV.el;
  if (FV.el) { FV.el.remove(); FV.el = null; }
  document.removeEventListener("keydown", fvKey, true);
  if (had && FV.hist && !fromPop) { FV.hist = false; try { if (history.state && history.state.hbfv) history.back(); } catch (e) { /* 沒關係 */ } }
  FV.hist = false;
  if (had && FV.back && FV.back.isConnected) { try { FV.back.focus({ preventScroll: true }); } catch (e) { /* 沒關係 */ } }
  FV.back = null;
}
window.addEventListener("popstate", function () { if (FV.el) fvClose(true); });   // 手機按「上一頁」：關掉小視窗
function fvKey(e) {
  if (!FV.el) return;
  if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); fvClose(); return; }
  if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) { e.preventDefault(); fvZoom(1.25); }
  else if ((e.ctrlKey || e.metaKey) && e.key === "-") { e.preventDefault(); fvZoom(0.8); }
}
// o：{ tid, bi, ii, tag, label, kind }（手冊裡的連結）；或 { try: 網址, label, kind }（開發者試開）
function fvOpen(o) {
  o = o || {};
  fvClose();
  var my = FV.seq, label = String(o.label || "檔案");
  FV.back = document.activeElement;
  var title = h("b", { class: "fv-t" }, [label]);
  var pg = h("span", { class: "fv-pg", role: "status", "aria-live": "polite" }, [""]);
  var zo = h("button", { class: "btn sm fv-z", type: "button", "aria-label": "縮小", title: "縮小", disabled: true }, ["－"]);
  var zf = h("button", { class: "btn sm fv-z fv-zf", type: "button", title: "照視窗的寬度", disabled: true }, ["適合寬度"]);
  var zi = h("button", { class: "btn sm fv-z", type: "button", "aria-label": "放大", title: "放大", disabled: true }, ["＋"]);
  var xb = h("button", { class: "btn sm fv-x", type: "button", "aria-label": "關掉", title: "關掉（Esc）" }, ["✕"]);
  var msg = h("div", { class: "fv-m" }, [h("div", { class: "fv-sp", "aria-hidden": "true" }), h("p", { id: "fvmsg" }, ["拿檔案中…"])]);
  var body = h("div", { class: "fv-b", tabindex: "0", "aria-label": "檔案內容" }, [msg]);
  var inner = h("div", { class: "fv-in" }, [h("div", { class: "fv-h" }, [h("span", { class: "fv-ic", "aria-hidden": "true" }, [fvIco(o.kind)]), h("div", { class: "fv-tt" }, [title, pg]), h("div", { class: "fv-zs" }, [zo, zf, zi]), xb]), body,
    h("div", { class: "fv-f" }, ["🔒 內部資料：只能看，不能下載、不能列印"])]);
  var box = h("div", { class: "fv", role: "dialog", "aria-modal": "true", "aria-label": "看檔案：" + label }, [inner]);
  box.addEventListener("click", function (e) { if (e.target === box) fvClose(); });   // 電腦：點旁邊的灰色也是關掉
  box.addEventListener("contextmenu", function (e) { e.preventDefault(); });
  box.addEventListener("dragstart", function (e) { e.preventDefault(); });
  body.addEventListener("wheel", function (e) { if (e.ctrlKey || e.metaKey) { e.preventDefault(); fvZoom(e.deltaY < 0 ? 1.15 : 1 / 1.15); } }, { passive: false });
  xb.onclick = function () { fvClose(); };
  zo.onclick = function () { fvZoom(0.8); }; zi.onclick = function () { fvZoom(1.25); }; zf.onclick = function () { FV.fit = true; fvFit(); };
  document.body.appendChild(box);
  FV.el = box; FV.zs = [zo, zf, zi]; FV.pg = pg; FV.body = body;
  document.addEventListener("keydown", fvKey, true);
  try { history.pushState({ hbfv: 1 }, "", location.href.split("#")[0]); FV.hist = true; } catch (e) { FV.hist = false; }
  try { xb.focus({ preventScroll: true }); } catch (e) { /* 沒關係 */ }
  var t0 = Date.now(), got = 0;
  var say = function () {
    var m = $("#fvmsg", box); if (!m || my !== FV.seq) return;
    var s = Math.round((Date.now() - t0) / 1000);
    m.textContent = got > 0 ? "下載中…" + (got > 1048576 ? (got / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(got / 1024)) + " KB") : "拿檔案中…" + (s >= 2 ? s + " 秒" : "") + (s >= 4 ? "（Word、Excel、PPT 第一次打開要轉成 PDF，大約 5～30 秒）" : "");
  };
  var tick = setInterval(function () { if (my !== FV.seq) { clearInterval(tick); return; } say(); }, 1000);
  var prog = function (ph, g) { if (ph === "dl") { got = g || 0; say(); } };
  var req = o.try ? call("hbFileTry", [o.try], { ms: 150000, prog: prog }) : call("hbFile", [o.tid, o.bi, o.ii, o.tag || ""], { ms: 150000, prog: prog });
  req.then(function (r) {
    clearInterval(tick);
    if (my !== FV.seq) return;
    if (r && r.st && !r.err) { fvClose(); if (r.st === "lock") logout("expired"); return; }   // 登入過期了
    if (!r || !r.ok) { fvErr(r && r.err || "沒拿到檔案"); return; }
    if (r.label || r.name) { title.textContent = r.label || r.name; box.setAttribute("aria-label", "看檔案：" + title.textContent); }
    if (r.kind === "img") fvImg(r, my); else fvPdf(r, my);
  }, function (e) { clearInterval(tick); if (my === FV.seq) fvErr(e && e.code === "bad" ? "藥戰手冊的後端還不認得「在手冊裡看檔案」（Apps Script 要貼第 43 批的 01、02、03，部署新版本）" : e && e.message || "連不上後端"); });   // 後端還是舊的：說清楚
}
function fvErr(t) {
  if (!FV.body) return;
  FV.body.innerHTML = "";
  FV.body.appendChild(h("div", { class: "fv-m err" }, [h("p", { class: "fv-e" }, ["❌ " + String(t).slice(0, 300)]), h("p", { class: "muted" }, ["關掉以後可以再按一次試試。一直打不開，請截圖給開發者。"])]));
}
function fvZoomOk(on) { (FV.zs || []).forEach(function (b) { b.disabled = !on; }); }
function fvImg(r, my) {
  var bytes = fvB64(r.b64); r.b64 = null;
  FV.url = URL.createObjectURL(new Blob([bytes], { type: r.mime || "image/png" }));
  var im = h("img", { class: "fv-img", alt: "", draggable: "false" });
  im.onload = function () { if (my !== FV.seq) return; FV.img = im; FV.w1 = im.naturalWidth || 1; FV.h1 = im.naturalHeight || 1; FV.fit = true; fvFit(); fvZoomOk(true); FV.pg.textContent = "圖片"; };
  im.onerror = function () { if (my === FV.seq) fvErr("這張圖打不開（格式不支援）"); };
  im.src = FV.url;
  FV.body.innerHTML = "";
  FV.body.appendChild(h("div", { class: "fv-ims" }, [im]));
}
function fvPdf(r, my) {
  var bytes = fvB64(r.b64); r.b64 = null;
  var m = $("#fvmsg", FV.el); if (m) m.textContent = "打開 PDF…";
  fvLib().then(function (lib) {
    if (my !== FV.seq) return null;
    FV.task = lib.getDocument({ data: bytes, isEvalSupported: false, CMapReaderFactory: FvCMap, cMapPacked: true, useSystemFonts: true, enableXfa: false, disableAutoFetch: true, disableStream: true, disableRange: true, verbosity: 0 });
    return FV.task.promise;
  }).then(function (doc) {
    if (!doc) return null;
    if (my !== FV.seq) { try { doc.destroy(); } catch (e) { /* 沒關係 */ } return null; }
    FV.doc = doc; FV.n = doc.numPages;
    return doc.getPage(1).then(function (p1) {
      if (my !== FV.seq) return;
      var vp = p1.getViewport({ scale: 1 });
      FV.w1 = vp.width; FV.h1 = vp.height;
      fvPages(my);
    });
  }).then(null, function (e) { if (my === FV.seq) fvErr(/password|Password/.test(String(e && e.message)) ? "這個 PDF 有密碼，打不開" : "PDF 打不開：" + (e && e.message || e)); });
}
function fvPages(my) {   // 每一頁先放一個框（大小照第一頁），捲到才畫
  var body = FV.body;
  body.innerHTML = "";
  FV.pages = [];
  for (var i = 1; i <= FV.n; i++) {
    var c = h("canvas", { class: "fv-cv", "aria-hidden": "true" });
    var d = h("div", { class: "fv-p", "data-n": String(i), role: "img", "aria-label": "第 " + i + " 頁" }, [c]);
    body.appendChild(d);
    FV.pages.push({ n: i, el: d, cv: c, at: 0, busy: false, w: FV.w1, h: FV.h1, task: null });
  }
  FV.fit = true;
  fvFit();
  fvZoomOk(true);
  if ("IntersectionObserver" in window) {
    FV.io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { var p = FV.pages[+en.target.getAttribute("data-n") - 1]; if (!p) return; p.vis = en.isIntersecting; if (en.isIntersecting) fvDraw(p, my); });
      fvTrim();
    }, { root: body, rootMargin: "800px 0px" });
    FV.pages.forEach(function (p) { FV.io.observe(p.el); });
  } else FV.pages.forEach(function (p) { fvDraw(p, my); });
  body.addEventListener("scroll", fvWhere, { passive: true });
  fvWhere();
}
function fvAvail() { return Math.max(160, (FV.body ? FV.body.clientWidth : 600) - 28); }
function fvFit() {   // 照視窗的寬度（最大 2.5 倍）
  if (!FV.w1) return;
  FV.scale = Math.max(0.2, Math.min(2.5, fvAvail() / FV.w1));
  fvApply();
}
function fvZoom(f) {
  if (!FV.w1) return;
  FV.fit = false;
  FV.scale = Math.max(0.2, Math.min(5, FV.scale * f));
  fvApply();
}
function fvApply() {   // 放大縮小：看的地方（中間那一點）不跑掉
  var body = FV.body;
  var cx = body ? (body.scrollLeft + body.clientWidth / 2) / Math.max(1, body.scrollWidth) : 0.5, cy = body ? body.scrollTop / Math.max(1, body.scrollHeight) : 0;
  if (FV.img) {
    FV.img.style.width = Math.round(FV.w1 * FV.scale) + "px";
    FV.img.style.height = Math.round(FV.h1 * FV.scale) + "px";
  } else FV.pages.forEach(function (p) {
    p.el.style.width = Math.round(p.w * FV.scale) + "px";
    p.el.style.height = Math.round(p.h * FV.scale) + "px";
    if (p.at && Math.abs(p.at - FV.scale) > 0.001) { p.at = 0; if (p.vis) fvDraw(p, FV.seq); }
  });
  if (body) { body.scrollTop = cy * body.scrollHeight; body.scrollLeft = Math.max(0, cx * body.scrollWidth - body.clientWidth / 2); }
}
function fvDraw(p, my) {   // 畫一頁（照現在的放大倍數；手機、高解析的螢幕畫清楚一點，但一頁最多 1200 萬像素）
  if (!FV.doc || p.busy || (p.at && Math.abs(p.at - FV.scale) < 0.001)) return;
  p.busy = true;
  var sc = FV.scale;
  FV.doc.getPage(p.n).then(function (pg) {
    if (my !== FV.seq) return null;
    var vp1 = pg.getViewport({ scale: 1 });
    if (Math.abs(vp1.width - p.w) > 0.5 || Math.abs(vp1.height - p.h) > 0.5) { p.w = vp1.width; p.h = vp1.height; p.el.style.width = Math.round(p.w * FV.scale) + "px"; p.el.style.height = Math.round(p.h * FV.scale) + "px"; }
    var vp = pg.getViewport({ scale: sc }), dpr = Math.min(window.devicePixelRatio || 1, 3);
    while (dpr > 1 && vp.width * vp.height * dpr * dpr > 12e6) dpr -= 0.25;
    var cv = p.cv;
    cv.width = Math.floor(vp.width * dpr); cv.height = Math.floor(vp.height * dpr);
    cv.style.width = Math.round(vp.width) + "px"; cv.style.height = Math.round(vp.height) + "px";
    var ctx = cv.getContext("2d", { alpha: false });
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height);
    p.task = pg.render({ canvasContext: ctx, viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null, annotationMode: window.pdfjsLib && pdfjsLib.AnnotationMode ? pdfjsLib.AnnotationMode.DISABLE : 0 });
    return p.task.promise.then(function () { p.at = sc; p.el.classList.add("on"); });
  }).then(function () {
    p.busy = false; p.task = null;
    if (my === FV.seq && Math.abs(p.at - FV.scale) > 0.001 && p.vis) fvDraw(p, my);   // 畫的時候又放大縮小了：再畫一次
  }, function () { p.busy = false; p.task = null; });
}
function fvTrim() {   // 離現在很遠的頁：清掉（手機記憶體不夠）；捲回來再畫
  var cur = FV.cur || 1;
  FV.pages.forEach(function (p) {
    if (p.vis || p.busy || !p.at || Math.abs(p.n - cur) <= 4) return;
    p.cv.width = 0; p.cv.height = 0; p.at = 0; p.el.classList.remove("on");
  });
}
function fvWhere() {   // 上面寫「第幾頁／幾頁」
  var body = FV.body; if (!body || !FV.pages.length) return;
  var mid = body.scrollTop + body.clientHeight * 0.35, cur = 1;
  FV.pages.forEach(function (p) { if (p.el.offsetTop <= mid) cur = p.n; });
  if (cur !== FV.cur) { FV.cur = cur; fvTrim(); }
  FV.pg.textContent = "第 " + cur + "／" + FV.n + " 頁";
}
window.addEventListener("resize", function () { if (FV.el && FV.fit) fvFit(); });

/* ════════ quiz.js ════════ */
/* ═══════════════ quiz.js：問卷、考試（藥師在網頁上填；第 32 批）═══════════════
 * 從哪裡進來：首頁目錄圖上的「問卷」、左下角的「📋 問卷」（有開放中的才出現；開發者一直都有）。
 * 問卷：一頁就是全部的題目，填好按「送出」（一個人填一次；不記名的問卷不記名字）。
 * 考試：按「開始考試」才向後端抽題（答案只在後端），交卷後馬上看到分數、正確答案、詳解。
 * 還沒送出的答案只放在記憶體：離開這一頁再回來還在；登出（閒置到時間）就不見。 */
var YZ_QZ_T = { one: "單選", many: "複選", text: "簡答", rate: "評分", tf: "是非" };   // 跟後端（LINE、網頁專案）一樣
var YZ_QZ_LET = "ABCDEF";
var QZ = qzFresh();
function qzFresh() { return { page: "list", list: null, none: false, busy: false, err: "", want: "", cur: null, ans: [], miss: [], res: null, peek: null, peekAt: 0, peekBusy: false, sending: false }; }
function qzReset() { QZ = qzFresh(); }
function qzEmpty(v) { return v === null || v === undefined || (typeof v === "string" && !v.trim()) || (Array.isArray(v) && !v.length); }
function qzErrText(e) { return e && e.code === "bad" ? "藥戰手冊的後端還不認得這個（Apps Script 要貼新版、部署新版本）" : String(e && e.message || e); }
function qzCall(act, a, b) {
  return call("hbQz", [act, a === undefined ? "" : a, b === undefined ? "" : b], { ms: 60000 }).then(function (r) {
    if (r && r.st === "lock") { logout("expired"); throw new Error("驗證過期了"); }
    if (!r) throw new Error("後端沒有回應");
    if (r.st && !r.ok && !r.err) throw new Error(r.st === "closed" ? "手冊還沒開放" : "現在不能填（請重新整理）");
    return r;
  });
}
function qzItem(id) { return (QZ.list || []).filter(function (x) { return x.id === id; })[0] || null; }

/* ── 左下角的「📋 問卷」：有開放中的才出現（開發者一直都有）；紅點＝還沒填的份數 ── */
function qzTake(r) {
  QZ.none = !!r.none; QZ.list = Array.isArray(r.list) ? r.list : []; QZ.err = "";
  var todo = 0; QZ.list.forEach(function (x) { if (!x.mine) todo++; });
  QZ.peek = { n: QZ.list.length, todo: todo }; QZ.peekAt = Date.now();
}
function qzPeek(force) {   // 每 5 分鐘最多問一次後端
  if (!MAIN || QZ.peekBusy || QZ.busy) return;
  if (!force && QZ.peekAt && Date.now() - QZ.peekAt < 5 * 6e4) return;
  QZ.peekBusy = true; QZ.peekAt = Date.now();
  qzCall("list").then(function (r) { QZ.peekBusy = false; if (r && r.ok) { qzTake(r); qzFabPaint(); } }, function () { QZ.peekBusy = false; });
}
function qzFab() {
  var b = h("button", { class: "btn hfab qzfab", type: "button", onclick: function () { qzOpen(""); } });
  qzFabSet(b);
  return b;
}
function qzFabSet(b) {
  var p = QZ.peek, n = p ? p.todo : 0;
  b.hidden = !(IS_DEV || (p && p.n > 0));
  b.textContent = "📋 問卷";
  if (n) b.appendChild(h("span", { class: "qzdot", "aria-hidden": "true" }, [n > 9 ? "9+" : String(n)]));
  b.setAttribute("aria-label", "問卷" + (n ? "（" + n + " 份還沒填）" : ""));
}
function qzFabPaint() {
  $$(".qzfab").forEach(qzFabSet);
  if (WV.pano && WV.pano.refreshAvoid) try { WV.pano.refreshAvoid(); } catch (e) { /* 沒關係 */ }
}

/* ── 打開問卷頁（id：直接開始那一份；沒給＝清單）── */
function qzOpen(id) {
  if (!MAIN || !HB) return;
  id = String(id || "").replace(/[^A-Za-z0-9_-]/g, "").slice(0, 80);
  WV.cid = null; WV.tid = null; WV.view = "qz"; WV.hl = null;
  if (id && QZ.cur && QZ.cur.z.id === id) QZ.page = "form";
  else { QZ.page = "list"; QZ.want = id; QZ.res = null; }
  if (TAB !== "view") showTab("view"); else drawWeb();
  topOfView();
  qzLoad();
}
function qzLoad() {
  if (QZ.busy) return;
  QZ.busy = true; QZ.err = "";
  qzCall("list").then(function (r) {
    QZ.busy = false;
    if (!r.ok) { QZ.err = r.err || "拿不到問卷"; qzRedraw("list"); return; }
    qzTake(r); qzFabPaint();
    var w = QZ.want; QZ.want = "";
    if (w) { if (qzItem(w)) { qzStart(w); return; } toast("這一份已經結束、或還沒開放"); }
    qzRedraw("list");
  }, function (e) { QZ.busy = false; QZ.err = qzErrText(e); qzRedraw("list"); });
}
function qzRedraw(page) {   // 還停在問卷頁（而且是同一個畫面）才重畫：不打斷正在填的人
  if (!MAIN || TAB !== "view" || WV.view !== "qz") return;
  if (page && QZ.page !== page) return;
  drawWeb();
}
function qzGo(page) { QZ.page = page; if (MAIN && TAB === "view" && WV.view === "qz") { drawWeb(); topOfView(); } }
function qzBackBtn() {   // 左上角：作答、結果頁＝回清單（答案留著）；清單＝回首頁（view.js 自己放）
  if (QZ.page !== "form" && QZ.page !== "res") return null;
  return h("button", { class: "pgback", type: "button", onclick: function () { QZ.res = null; qzGo("list"); qzLoad(); } }, ["‹ 問卷清單"]);
}

// 開始一份：問卷＝題目；考試＝後端抽好的題目（答案不會給網頁）
function qzStart(id, el) {
  if (QZ.cur && QZ.cur.z.id === id) { qzGo("form"); return; }
  if (QZ.sending) return;
  QZ.sending = true;
  var old = el ? el.textContent : "";
  if (el) { el.textContent = "準備題目中…"; el.classList.add("busy"); }
  qzCall("start", id).then(function (r) {
    QZ.sending = false;
    if (el) { el.textContent = old; el.classList.remove("busy"); }
    if (r.done) {
      var me = r.mine || {}, exam = r.z && r.z.kind === "x";
      modal({ title: exam ? "這個考試只能考一次" : "你已經填過了", lines: exam ? ["你的分數：" + (me.best === null || me.best === undefined ? "—" : me.best + " 分") + (me.pass ? "（及格）" : "")] : ["謝謝你！一個人填一次就好。"], buttons: [{ label: "好", cls: "sm pri" }] });
      qzLoad(); return;
    }
    if (!r.ok) { toast("⚠ " + (r.err || "開始不了，等一下再試")); qzLoad(); return; }
    QZ.cur = { z: r.z, qs: r.qs || [], times: r.times || 0, at: Date.now() };
    QZ.ans = QZ.cur.qs.map(function () { return null; }); QZ.miss = []; QZ.res = null;
    WV.cid = null; WV.tid = null; WV.view = "qz";
    if (MAIN && TAB !== "view") showTab("view");
    qzGo("form");
  }, function (e) { QZ.sending = false; if (el) { el.textContent = old; el.classList.remove("busy"); } toast("⚠ " + qzErrText(e)); });
}

function qzDraw(col) {
  if (QZ.page === "form" && QZ.cur) return qzDrawForm(col);
  if (QZ.page === "res" && QZ.res) return qzDrawRes(col);
  QZ.page = "list";
  qzDrawList(col);
}

/* ── 清單 ── */
function qzDrawList(col) {
  var L = QZ.list;
  col.appendChild(pgHead("📋 問卷", L && L.length ? "點一份開始；考試交卷後馬上看到分數和詳解" : ""));
  if (QZ.cur) {
    var cz = QZ.cur.z, done = QZ.ans.filter(function (v) { return !qzEmpty(v); }).length;
    col.appendChild(pgCard([h("div", { class: "pc-meta" }, [h("span", { class: "pc-ch qzwip" }, ["✏️ 還沒送出"])]), h("h2", { class: "pc-t" }, [cz.title]),
      h("div", { class: "pc-note" }, ["剛剛答到一半（" + done + "／" + QZ.cur.qs.length + " 題）：按一下接著" + (cz.kind === "x" ? "考" : "填") + "。"]), h("div", { class: "pc-act" }, [h("span", { class: "pbtn dark", "aria-hidden": "true" }, ["繼續作答 ›"])])],
      { cls: "qzdraft", go: function () { qzGo("form"); }, label: "繼續作答「" + cz.title + "」" }));
  }
  if (QZ.err && !L) {
    col.appendChild(pgCard([h("div", { class: "pc-t" }, ["⚠ 拿不到問卷"]), h("div", { class: "pc-note qzlong" }, [QZ.err]), h("div", { class: "pc-act" }, [h("button", { class: "pbtn dark", type: "button", onclick: function () { QZ.err = ""; qzRedraw("list"); qzLoad(); } }, ["🔄 再試一次"])])]));
    return;
  }
  if (!L) { col.appendChild(pgCard([h("div", { class: "pc-t qzload" }, ["載入中…"])])); return; }
  if (!L.length) {
    col.appendChild(pgCard([h("div", { class: "pc-t" }, ["目前沒有開放的問卷"]), h("div", { class: "pc-note qzlong" }, ["有新的會在這裡出現（LINE 也會收到通知）。"])]));
    if (IS_DEV) col.appendChild(h("div", { class: "pgdev" }, [QZ.none ? "（開發者）還沒建立問卷試算表：到「✏️ 編輯」→ 左上的「📋 問卷」→ 按「建立問卷試算表」。" : "（開發者）到「✏️ 編輯」→ 左上的「📋 問卷」新增一份；狀態改成「開放」、按「儲存」，這裡就看得到。"]));
    return;
  }
  L.forEach(function (x) { col.appendChild(qzItemCard(x)); });
}
function qzItemCard(x) {
  var exam = x.kind === "x", me = x.mine, going = !!(QZ.cur && QZ.cur.z.id === x.id), can = going || (exam ? (!me || x.retake) : !me);
  var meta = [h("span", { class: "pc-ch" }, [exam ? "📝 考試" : "📋 問卷"]), h("span", {}, [x.n + " 題"]), exam ? h("span", {}, [x.pass + " 分及格"]) : x.named ? null : h("span", {}, ["不記名"]), x.to ? h("span", { class: "pc-pg" }, [x.to.slice(5).replace("/", "／") + " 截止"]) : null];
  var stx = me ? (exam ? "你考過 " + me.times + " 次，最高 " + (me.best === null || me.best === undefined ? "—" : me.best + " 分") + (me.pass ? "　✅ 及格" : "") + (x.retake ? "" : "（只能考一次）") : "✅ 已經填過了，謝謝") : (exam ? "還沒考" : "還沒填");
  var act = going ? "繼續作答 ›" : !can ? "" : exam ? (me ? "再考一次" : "開始考試") : "開始填寫";
  var b = act ? h("span", { class: "pbtn dark", "aria-hidden": "true" }, [act]) : null;
  return pgCard([h("div", { class: "pc-meta" }, meta), h("h2", { class: "pc-t" }, [x.title]), x.note ? h("div", { class: "pc-note qznote" }, [x.note]) : null,
    h("div", { class: "qzme" + (me ? " done" : "") }, [stx]), b ? h("div", { class: "pc-act" }, [b]) : null],
    can ? { go: function () { qzStart(x.id, b); }, label: act.replace(" ›", "") + "「" + x.title + "」" } : {});
}

/* ── 作答（一頁全部題目）── */
function qzDrawForm(col) {
  var cur = QZ.cur, z = cur.z, exam = z.kind === "x";
  col.appendChild(pgHead((exam ? "📝 " : "📋 ") + z.title));
  col.appendChild(qzFormEl(z, cur.qs, QZ.ans, { px: "qzf", miss: QZ.miss, times: cur.times, onChange: function (i, v) { QZ.ans[i] = v; QZ.miss = QZ.miss.filter(function (k) { return k !== i; }); qzProgPaint(); } }));
  var send = h("button", { class: "pbtn dark qzsend", type: "button", onclick: qzSubmit }, [exam ? "✅ 交卷" : "✅ 送出"]);
  col.appendChild(pgCard([
    h("div", { class: "qzprog", "aria-live": "polite" }, [qzProgText()]),
    h("div", { class: "pc-act qzacts" }, [send, h("button", { class: "pbtn nav", type: "button", onclick: qzQuit }, [exam ? "✖ 先不考了" : "✖ 先不填了"])]),
    h("div", { class: "qzfine" }, [exam ? "交卷以後就不能改答案；馬上看到分數、正確答案和詳解。" : "按「送出」才會存。離開這一頁再回來，剛剛填的還在（登出就不見）。"])
  ], { cls: "qzfoot" }));
}
function qzProgText() {
  var n = QZ.cur ? QZ.cur.qs.length : 0, d = QZ.ans.filter(function (v) { return !qzEmpty(v); }).length;
  return "已經回答 " + d + "／" + n + " 題" + (d < n && QZ.cur && QZ.cur.z.kind === "x" ? "（沒答的算錯）" : "");
}
function qzProgPaint() { $$(".qzprog").forEach(function (e) { e.textContent = qzProgText(); }); }

// 題目（藥師作答、編輯器的預覽都用這一個）。o：{ px（id 的開頭）, miss, times, onChange(i, v), preview }
function qzFormEl(z, qs, ans, o) {
  o = o || {}; ans = ans || [];
  var exam = z.kind === "x", wrap = h("div", { class: "qzform" });
  var intro = exam ? ["共 " + qs.length + " 題", (z.pass === null || z.pass === undefined ? 60 : z.pass) + " 分及格", "沒答的算錯", o.times ? "這是第 " + (o.times + 1) + " 次" : ""] :
    ["共 " + qs.length + " 題", qs.some(function (q) { return q.req; }) ? "標「必填」的一定要答" : "", z.named === false ? "不記名：不會記你是誰" : "會記你的名字和員工代號"];
  wrap.appendChild(pgCard([h("div", { class: "pc-meta" }, [h("span", { class: "pc-ch" }, [exam ? "📝 考試" : "📋 問卷"])].concat(intro.filter(Boolean).map(function (s) { return h("span", {}, [s]); }))),
    z.note ? h("div", { class: "qzintro" }, [z.note]) : null], { cls: "slim qzhead" }));
  qs.forEach(function (q, i) { wrap.appendChild(qzQEl(q, i, qs.length, ans[i], { px: o.px || "qzf", exam: exam, miss: (o.miss || []).indexOf(i) >= 0, onChange: o.onChange || function () { /* 預覽：不存 */ } })); });
  if (!qs.length) wrap.appendChild(pgCard([h("div", { class: "pc-note qzlong" }, [o.preview ? "（還沒有題目）" : "這一份還沒有題目。"])]));
  return wrap;
}
function qzQEl(q, i, n, val, o) {
  var px = o.px, qid = px + "-q" + i;
  var head = h("div", { class: "qzq-h" }, [h("span", { class: "qzq-no" }, ["第 " + (i + 1) + "／" + n + " 題"]), h("span", { class: "qzq-ty" }, [(YZ_QZ_T[q.t] || "") + (q.t === "many" ? "：可以選好幾個" : q.t === "rate" ? "：1～5 分" : "")]),
    o.exam ? null : h("span", { class: q.req ? "qzq-req" : "qzq-opt" }, [q.req ? "必填" : "可以不填"])]);
  var box = h("div", { class: "pcard flat qzq" + (o.miss ? " miss" : ""), id: px + "-" + i, role: "group", "aria-labelledby": qid }, [head, h("div", { class: "qzq-q", id: qid }, [q.q])]);
  var set = function (v) { o.onChange(i, v); box.classList.remove("miss"); };
  if (q.t === "one" || q.t === "tf" || q.t === "many") {
    var many = q.t === "many", list = h("div", { class: "qzopts" + (q.t === "tf" ? " tf" : "") });
    (q.opts || []).forEach(function (op, k) {
      var on = many ? (val || []).indexOf(k) >= 0 : val === k;
      var inp = h("input", { type: many ? "checkbox" : "radio", name: px + "-o" + i, value: String(k), checked: on });
      inp.onchange = function () {
        if (many) { var cur = []; $$("input", list).forEach(function (x, kk) { if (x.checked) cur.push(kk); }); set(cur); } else set(k);
        $$(".qzo", list).forEach(function (l) { l.classList.toggle("on", $("input", l).checked); });
      };
      list.appendChild(h("label", { class: "qzo" + (on ? " on" : "") }, [inp, h("span", { class: "qzo-k", "aria-hidden": "true" }, [q.t === "tf" ? (k === 0 ? "⭕" : "❌") : YZ_QZ_LET.charAt(k)]), h("span", { class: "qzo-t" }, [op])]));
    });
    box.appendChild(list);
  } else if (q.t === "rate") {
    var row = h("div", { class: "qzrate" });
    [1, 2, 3, 4, 5].forEach(function (v) {
      var inp2 = h("input", { type: "radio", name: px + "-o" + i, value: String(v), checked: val === v, "aria-label": v + " 分" + (v === 1 ? "（最低）" : v === 5 ? "（最高）" : "") });
      inp2.onchange = function () { set(v); $$(".qzr", row).forEach(function (l) { l.classList.toggle("on", $("input", l).checked); }); };
      row.appendChild(h("label", { class: "qzr" + (val === v ? " on" : "") }, [inp2, h("b", { "aria-hidden": "true" }, [String(v)]), h("small", { "aria-hidden": "true" }, [v === 1 ? "最低" : v === 5 ? "最高" : ""])]));
    });
    box.appendChild(row);
  } else {
    var cnt = h("div", { class: "qzcnt", "aria-hidden": "true" }, [(val ? String(val).length : 0) + "／1000"]);
    var ta = h("textarea", { class: "qzta", rows: "3", maxlength: "1000", placeholder: "在這裡打字回答", "aria-labelledby": qid });
    ta.value = val || "";
    ta.oninput = function () { set(ta.value.trim() ? ta.value : ""); cnt.textContent = ta.value.length + "／1000"; };
    box.appendChild(ta); box.appendChild(cnt);
  }
  return box;
}
function qzQuit() {
  var cur = QZ.cur; if (!cur) return;
  modal({ title: cur.z.kind === "x" ? "先不考了？" : "先不填了？", lines: ["剛剛的答案不會送出，下次要重新" + (cur.z.kind === "x" ? "開始（題目會重新抽）。" : "填。")], buttons: [{ label: "繼續作答", cls: "sm" }, { label: cur.z.kind === "x" ? "先不考了" : "先不填了", cls: "sm bad", fn: function () { QZ.cur = null; QZ.ans = []; QZ.miss = []; qzGo("list"); } }] });
}
function qzSubmit() {
  var cur = QZ.cur; if (!cur || QZ.sending) return;
  var exam = cur.z.kind === "x";
  var miss = exam ? [] : cur.qs.map(function (q, i) { return q.req && qzEmpty(QZ.ans[i]) ? i : -1; }).filter(function (i) { return i >= 0; });
  if (miss.length) { qzMissShow(miss); return; }
  var left = cur.qs.filter(function (q, i) { return qzEmpty(QZ.ans[i]); }).length;
  if (exam) modal({ title: left ? "還有 " + left + " 題沒答" : "確定交卷？", lines: [left ? "沒答的算錯。確定要交卷嗎？" : "交卷以後就不能改答案了。"], buttons: [{ label: "再看一下", cls: "sm" }, { label: "交卷", cls: "sm pri", fn: qzSend }] });
  else qzSend();
}
function qzMissShow(miss) {
  QZ.miss = miss;
  miss.forEach(function (i) { var el = document.getElementById("qzf-" + i); if (el) el.classList.add("miss"); });
  var f = document.getElementById("qzf-" + miss[0]); if (f) f.scrollIntoView({ block: "center" });
  toast("第 " + miss.map(function (i) { return i + 1; }).join("、") + " 題是必填，還沒回答");
}
function qzSend() {
  var cur = QZ.cur; if (!cur || QZ.sending) return;
  QZ.sending = true;
  var sb = $(".qzsend"), old = sb ? sb.textContent : "";
  if (sb) { sb.disabled = true; sb.textContent = "送出中…"; }
  var ans = QZ.ans.map(function (v) { return typeof v === "string" ? v.trim() : v; });
  qzCall("submit", cur.z.id, JSON.stringify(ans)).then(function (r) {
    QZ.sending = false;
    if (sb && sb.isConnected) { sb.disabled = false; sb.textContent = old; }
    if (!r.ok) {
      if (r.miss && r.miss.length) { qzMissShow(r.miss.map(function (n) { return n - 1; })); return; }
      if (r.again) {
        modal({ title: "這一次的題目過期了", lines: [r.err || "超過 6 小時、或已經交過卷了。", "按「重新開始」會重新抽題。"], buttons: [{ label: "先不要", cls: "sm" }, { label: "重新開始", cls: "sm pri", fn: function () { var id = cur.z.id; QZ.cur = null; QZ.ans = []; qzStart(id); } }] });
        return;
      }
      if (r.done) { QZ.cur = null; QZ.ans = []; modal({ title: "送不出去", lines: [r.err || "已經填過了"], buttons: [{ label: "好", cls: "sm pri" }] }); qzGo("list"); qzLoad(); return; }
      toast("⚠ " + (r.err || "送不出去，等一下再試")); return;
    }
    QZ.res = { r: r, z: cur.z, qs: cur.qs, ans: ans };
    QZ.cur = null; QZ.ans = []; QZ.miss = [];
    QZ.peekAt = 0;
    qzGo("res");
    qzPeek(true);
  }, function (e) { QZ.sending = false; if (sb && sb.isConnected) { sb.disabled = false; sb.textContent = old; } toast("⚠ " + qzErrText(e) + "（答案還在，可以再按一次）"); });
}

/* ── 送出以後 ── */
function qzDrawRes(col) {
  var R = QZ.res, r = R.r, z = R.z;
  var acts = function () {
    return h("div", { class: "pc-act qzacts" }, [
      r.kind === "x" && r.retake ? h("button", { class: "pbtn dark", type: "button", onclick: function () { QZ.res = null; qzStart(z.id); } }, ["再考一次"]) : null,
      h("button", { class: "pbtn nav", type: "button", onclick: function () { QZ.res = null; qzGo("list"); qzLoad(); } }, ["‹ 問卷清單"]),
      h("button", { class: "pbtn nav", type: "button", onclick: function () { QZ.res = null; goHome(); } }, ["🏠 回首頁"])
    ]);
  };
  if (r.kind !== "x") {
    col.appendChild(pgHead("📋 " + z.title));
    col.appendChild(pgCard([h("div", { class: "qzbig ok", "aria-hidden": "true" }, ["✅"]), h("h2", { class: "pc-t qzc" }, ["送出了，謝謝你！"]),
      h("div", { class: "qzfine qzc" }, [z.named === false ? "這一份不記名：沒有記你是誰。" : "已經記下你的回答。"]), acts()], { cls: "qzres" }));
    return;
  }
  var pass = !!r.pass;
  col.appendChild(pgHead("📝 " + z.title, "考完了"));
  col.appendChild(pgCard([
    h("div", { class: "qzscore" + (pass ? " ok" : " no") }, [h("b", {}, [String(r.score)]), h("span", {}, ["分"])]),
    h("div", { class: "qzpass" + (pass ? " ok" : " no") }, [pass ? "✅ 及格（" + r.need + " 分及格）" : "還沒及格（" + r.need + " 分及格）"]),
    h("div", { class: "qzfine qzc" }, ["答對 " + r.right + "／" + r.n + " 題　第 " + r.times + " 次" + (r.retake ? "" : "（只能考一次）")]),
    acts()
  ], { cls: "qzres" }));
  (r.review || []).forEach(function (x, i) { col.appendChild(qzRevEl(x, i)); });
  if ((r.review || []).length > 2) col.appendChild(h("div", { class: "pgnav c" }, [h("button", { class: "pbtn nav", type: "button", onclick: function () { QZ.res = null; qzGo("list"); qzLoad(); } }, ["‹ 問卷清單"])]));
}
function qzRevEl(x, i) {
  var opts = h("div", { class: "qzopts rev" + (x.t === "tf" ? " tf" : "") }), mine = x.mine || [], ans = x.ans || [];
  (x.opts || []).forEach(function (op, k) {
    var right = ans.indexOf(k) >= 0, me = mine.indexOf(k) >= 0;
    opts.appendChild(h("div", { class: "qzo" + (right ? " ok" : "") + (me && !right ? " bad" : "") }, [
      h("span", { class: "qzo-k", "aria-hidden": "true" }, [x.t === "tf" ? (k === 0 ? "⭕" : "❌") : YZ_QZ_LET.charAt(k)]),
      h("span", { class: "qzo-t" }, [op]),
      right || me ? h("span", { class: "qzo-tag" }, [right && me ? "✅ 你選的（正確）" : right ? "正確答案" : "✖ 你選的"]) : null
    ]));
  });
  return pgCard([
    h("div", { class: "qzq-h" }, [h("span", { class: "qzq-no" }, ["第 " + (i + 1) + " 題"]), h("span", { class: x.ok ? "qzok" : "qzno" }, [x.ok ? "✅ 答對" : "❌ 答錯"])]),
    h("div", { class: "qzq-q" }, [x.q]), opts,
    mine.length ? null : h("div", { class: "qzfine" }, ["（這一題沒有回答）"]),
    x.ex ? h("div", { class: "qzex" }, [h("b", {}, ["詳解"]), h("div", {}, [x.ex])]) : null
  ], { cls: "qzq" + (x.ok ? "" : " wrong") });
}

/* ════════ rte.js ════════ */
/* rte.js — 文字編輯器（網頁編輯用）。像 Notion 那樣「看到什麼就是什麼」，格式用最上面那一排按鍵（沒有「/」選單）。
 * 內容存成「格式文字」（rt.js 的標記）；這裡只管畫面和操作：選字 → 按鍵、按 Enter 換行、Backspace 合併、貼上、復原。
 * 做法：打字交給瀏覽器（中文輸入法不會被打斷）；按格式鍵、Enter、Backspace、貼上這些，才改「資料」再重畫。
 * 資料的單位是「一行」：{k:種類, lv:縮排, tone:標註顏色, go:連結的標題, img:圖的代號, runs:[{t:字, b,i,u,s,c,z}]}。
 * 第 28 批：一行也可以是一張圖（[img=代號]）：文字和圖片放在同一塊；圖的網址、圖說放在這一塊的 pics（o.pics() 拿得到），上傳交給編輯器（o.imgUp）。
 * 第 29 批：一行也可以是一張表格（[tbl=代號]，表格「併到上一塊」來的）：內容放在這一塊的 tbls（o.tbls()），按「✏️ 編輯表格」交給編輯器（o.tblEdit）。 */
var RTE = { cur: null, pop: null, bar: null, lastColor: "red", lastMark: "yellow", clip: null, lastUl: "•", lastOl: "1.", lastFrame: "solid" };   // 第 41 批：lastFrame＝上一次選的文字框樣子   // 第 39 批：lastUl／lastOl＝上一次選的項目符號、編號樣式（按「• 項目符號」「1. 編號」就用這個）
(function () { try { var u = localStorage.getItem("yz_rte_ul"), o = localStorage.getItem("yz_rte_ol"); if (u && YZ_RT_UL_MARKS.indexOf(u) >= 0) RTE.lastUl = u; if (o && YZ_RT_OL_STYLES.some(function (x) { return x[0] === o; })) RTE.lastOl = o; } catch (e) { /* 記不住就用預設 */ } })();
function rteKeepList(type, m) { if (type === "ul") RTE.lastUl = m; else RTE.lastOl = m; try { localStorage.setItem(type === "ul" ? "yz_rte_ul" : "yz_rte_ol", m); } catch (e) { /* 記不住就算了 */ } }
// 第 39 批：編號屬於哪一種樣式（I.、V.、X. 可能是字母也可能是羅馬數字：兩種都算）
var RTE_OL_FAM = [["1.", /^\d{1,2}\.$/], ["1、", /^\d{1,2}、$/], ["1)", /^\d{1,2}[)）]$/], ["(1)", /^\(\d{1,2}\)$/], ["（1）", /^（\d{1,2}）$/], ["①", /^[①-⑳]$/],
  ["一、", /^[一二三四五六七八九十]{1,3}、$/], ["（一）", /^[（(][一二三四五六七八九十]{1,3}[）)]$/], ["壹、", /^[壹貳參肆伍陸柒捌玖拾]{1,3}、$/],
  ["甲、", /^[甲乙丙丁戊己庚辛壬癸]、$/], ["（甲）", /^[（(][甲乙丙丁戊己庚辛壬癸][）)]$/],
  ["A.", /^[A-Z]\.$/], ["（A）", /^[（(][A-Z][）)]$/], ["a.", /^[a-z]\.$/], ["（a）", /^[（(][a-z][）)]$/],
  ["I.", /^(?=[IVX])X{0,3}(?:IX|IV|V?I{0,3})\.$/], ["i.", /^(?=[ivx])x{0,3}(?:ix|iv|v?i{0,3})\.$/]];
function rteOlFams(m) { m = String(m || ""); return RTE_OL_FAM.filter(function (f) { return f[1].test(m); }).map(function (f) { return f[0]; }); }   // clip：格式列「📋 複製」的字（第 32 批；只放記憶體，登出就丟掉）   // lastMark：上一次用的螢光筆顏色（第 30 批）
// ── 第 40 批：編號自動重排（像 Word：插入、刪除、搬動、縮排一個項目，後面的號碼自己跟著改）──
// 規則：① 同一種樣式、同一層縮排的編號一直往下數：中間夾著一般的字、空行、圖、標註框、項目符號都不會斷。
//   ② 標題、分隔線＝這一段結束（下面的編號從頭數）；比它淺的清單項目（編號、項目符號）＝深一層的從頭數（像 Word）。
//   ③ 本來就寫著「第一號」（1. 1、 (1) ① 一、 （一） 壹、 甲、 A. a. I. i.…）的＝從這裡重新開始；按「1. 編號」開新的一串也是。
//   ④ 每一串的第一個照它自己的號碼（例：從 4. 開始的照樣 4. 5. 6.）；第一個被刪掉、或在最前面插一個新的＝照原本的開頭號碼排。
//   ⑤ 只改「改動的地方」以下的號碼（上面的不動）。打字改號碼：離開那一行才排（打到一半不會跳來跳去）。
var RTE_OL_NUM = {   // 種類 → [記號 → 第幾號, (第幾號, 原本的記號) → 新的記號（太大、沒有這個號碼＝""）]
  ar: [function (m) { return +(/\d+/.exec(m) || [0])[0]; }, function (n, t) { return n >= 1 && n <= 99 ? t.replace(/\d+/, String(n)) : ""; }],
  ci: [function (m) { return m.charCodeAt(0) - 0x245F; }, function (n) { return n >= 1 && n <= 20 ? String.fromCharCode(0x245F + n) : ""; }],
  cd: [function (m) { return _yzCnToNum_(m.replace(/[^一二三四五六七八九十]/g, ""), YZ_CN_D, "十"); }, function (n, t) { var c = _yzNumToCn_(n, YZ_CN_D, "十"); return c ? t.replace(/[一二三四五六七八九十]+/, c) : ""; }],
  cu: [function (m) { return _yzCnToNum_(m.replace(/[^壹貳參肆伍陸柒捌玖拾]/g, ""), YZ_CN_U, "拾"); }, function (n, t) { var c = _yzNumToCn_(n, YZ_CN_U, "拾"); return c ? t.replace(/[壹貳參肆伍陸柒捌玖拾]+/, c) : ""; }],
  gn: [function (m) { return YZ_GAN.indexOf(m.replace(/[^甲乙丙丁戊己庚辛壬癸]/g, "")) + 1; }, function (n, t) { return n >= 1 && n <= 10 ? t.replace(/[甲乙丙丁戊己庚辛壬癸]/, YZ_GAN.charAt(n - 1)) : ""; }],
  up: [function (m) { return m.replace(/[^A-Z]/g, "").charCodeAt(0) - 64; }, function (n, t) { return n >= 1 && n <= 26 ? t.replace(/[A-Z]/, String.fromCharCode(64 + n)) : ""; }],
  lo: [function (m) { return m.replace(/[^a-z]/g, "").charCodeAt(0) - 96; }, function (n, t) { return n >= 1 && n <= 26 ? t.replace(/[a-z]/, String.fromCharCode(96 + n)) : ""; }],
  ru: [function (m) { return _yzRomanToNum_(m.replace(/[^IVX]/g, "")); }, function (n, t) { var r = _yzNumToRoman_(n); return r ? t.replace(/[IVX]+/, r) : ""; }],
  rl: [function (m) { return _yzRomanToNum_(m.replace(/[^ivx]/g, "")); }, function (n, t) { var r = _yzNumToRoman_(n).toLowerCase(); return r ? t.replace(/[ivx]+/, r) : ""; }]
};
var RTE_OL_KIND = { "1.": "ar", "1、": "ar", "1)": "ar", "(1)": "ar", "（1）": "ar", "①": "ci", "一、": "cd", "（一）": "cd", "壹、": "cu", "甲、": "gn", "（甲）": "gn", "A.": "up", "（A）": "up", "a.": "lo", "（a）": "lo", "I.": "ru", "i.": "rl" };
function rteOlVal(fam, mark) { var f = RTE_OL_NUM[RTE_OL_KIND[fam]]; var n = f ? f[0](mark) : 0; return n >= 1 ? n : 0; }
function rteOlMake(fam, n, tmpl) { var f = RTE_OL_NUM[RTE_OL_KIND[fam]]; return f ? f[1](n, tmpl) : ""; }
function rteLineSig(L) { return L ? L.k + "|" + (L.lv || 0) + "|" + (L.k === "hr" || L.k === "go" || L.k === "img" || L.k === "tbl" ? "#" : _yzRtRunsText_(L.runs || [])) : "-"; }
// 看一遍：每一行是不是編號、屬於哪一串。restart(L, i)：寫著「第一號」的這一行要不要重新開始（沒給＝要）
function rteOlScan(ls, restart) {
  var info = [], seqs = [], open = {}, i, d;
  for (i = 0; i < ls.length; i++) {
    var L = ls[i]; info.push(null);
    if (!L) continue;
    var lv = L.lv || 0;
    if (/^h[1-4]$/.test(L.k) || L.k === "hr") { for (d in open) if (+d >= lv) delete open[d]; continue; }   // 標題、分隔線：這一段結束
    if (L.k !== "p") continue;
    var it = _yzRtItem_(_yzRtRunsText_(L.runs || [])); if (!it) continue;
    for (d in open) if (+d > lv) delete open[d];   // 淺一層的清單項目：深一層的從頭數
    if (_yzRtMarkKind_(it.mark) !== "ol") continue;
    var fams = rteOlFams(it.mark), op = open[lv] || (open[lv] = {}), fam = null, k;
    if (!fams.length) continue;
    for (k = 0; k < fams.length; k++) if (op[fams[k]] !== undefined) { fam = fams[k]; break; }   // 已經在數的那一種（H. 後面的 I.＝字母）
    if (!fam) fam = rteOlPick(fams, ls, i, lv);
    var n = rteOlVal(fam, it.mark); if (!n) continue;
    var si = op[fam], rs = false;
    if (si !== undefined && n === 1 && (!restart || restart(L, i, fam, lv))) { si = undefined; rs = true; }   // rs：打斷了上面還在數的那一串（真的「重新開始」）
    if (si === undefined) { si = seqs.length; seqs.push({ fam: fam, lv: lv, items: [] }); op[fam] = si; }
    seqs[si].items.push(i);
    info[i] = { fam: fam, n: n, mark: it.mark, seq: si, head: seqs[si].items.length === 1, rs: rs };
  }
  return { info: info, seqs: seqs };
}
// 同一層、同一種樣式的下一個編號在第幾行（中間遇到標題、分隔線、淺一層的清單項目＝沒有）：-1＝沒有
function rteOlNext(ls, i, fam, lv) {
  for (var j = i + 1; j < ls.length; j++) {
    var L = ls[j]; if (!L) continue;
    var l2 = L.lv || 0;
    if ((/^h[1-4]$/.test(L.k) || L.k === "hr") && l2 <= lv) return -1;
    if (L.k !== "p") continue;
    var it = _yzRtItem_(_yzRtRunsText_(L.runs || [])); if (!it) continue;
    if (l2 < lv) return -1;
    if (l2 > lv || _yzRtMarkKind_(it.mark) !== "ol") continue;
    return rteOlFams(it.mark).indexOf(fam) >= 0 ? j : -1;
  }
  return -1;
}
// I.、V.、X.（i. v. x.）可能是字母也可能是羅馬數字：看同一層下一個編號是哪一種；看不出來＝羅馬數字
function rteOlPick(fams, ls, i, lv) {
  if (fams.length < 2) return fams[0];
  for (var j = i + 1; j < ls.length && j < i + 60; j++) {
    var L = ls[j]; if (!L || L.k !== "p") continue;
    var it = _yzRtItem_(_yzRtRunsText_(L.runs || [])); if (!it) continue;
    if ((L.lv || 0) < lv) break;
    if ((L.lv || 0) > lv || _yzRtMarkKind_(it.mark) !== "ol") continue;
    var nf = rteOlFams(it.mark).filter(function (f) { return fams.indexOf(f) >= 0; });
    if (nf.length === 1) return nf[0];
    break;
  }
  return fams.filter(function (f) { return f === "I." || f === "i."; })[0] || fams[0];
}
// 改之前的樣子：每一個編號行 → { head：是不是一串的第一個, start：那一串從幾號開始, sig }
function rteOlPrior(ls) {
  var sc = rteOlScan(ls), m = new Map();
  sc.seqs.forEach(function (S) { var st = sc.info[S.items[0]].n; S.items.forEach(function (i, k) { m.set(ls[i], { head: k === 0, rs: !!sc.info[i].rs, start: st, sig: rteLineSig(ls[i]) }); }); });
  ls.forEach(function (L) { if (L && !m.has(L)) m.set(L, { none: 1, sig: rteLineSig(L) }); });
  return m;
}
// 改了以後：從第 from 行起重排。prior＝改之前的樣子（rteOlPrior；打字改的＝null）。sel＝游標（記號變長變短時跟著移）。回：有沒有改到
function rteRenumber(ls, from, sel, prior) {
  var src = function (L) { return L && L.__from ? L.__from : L; };
  var old = function (L) { var p = prior ? prior.get(src(L)) : null; return p && !p.none ? p : null; };
  var keepRs = function (L) { var p = prior ? prior.get(L) : null; return !!p && !!p.rs && p.sig === rteLineSig(L); };   // 本來就是「重新開始」、這一次沒動到
  // 寫著「第一號」：本來就是重新開始的（沒動到）、按「1. 編號」開新的一串、或是打字打的（prior＝null）＝重新開始；被搬過來、貼上的、本來是一串開頭的＝接著數
  // 新放進來的「第一號」剛好在另一串的開頭（也寫著第一號）前面：換它當開頭，原本那個接著數（貼上、打字都一樣）
  var skip = {}, first1 = function (j, fam) { var it = j >= 0 ? _yzRtItem_(_yzRtRunsText_(ls[j].runs || [])) : null; return !!it && rteOlVal(fam, it.mark) === 1; };
  var sc = rteOlScan(ls, function (L, i, fam, lv) {
    if (skip[i]) return false;
    var j;
    if (!prior) { if (i === from) { j = rteOlNext(ls, i, fam, lv); if (first1(j, fam)) skip[j] = true; } return true; }
    if (L.__ol1 || keepRs(L)) return true;
    j = rteOlNext(ls, i, fam, lv);
    if (j >= 0 && keepRs(ls[j])) { skip[j] = true; return true; }
    return false;
  }), changed = false;
  sc.seqs.forEach(function (S) {
    var it = S.items, k, v;
    if (it[it.length - 1] < from) return;   // 整串都在改動的地方上面：不動
    if (it[0] < from) {   // 開頭在上面（不動）：從改動的地方接著數
      for (k = 0; k < it.length && it[k] < from; k++) { /* 跳過上面的 */ }
      v = sc.info[it[k - 1]].n;
      for (; k < it.length; k++) put(it[k], ++v);
      return;
    }
    var H = ls[it[0]], hi = sc.info[it[0]], p = old(H), st = hi.n;
    if (prior && hi.n !== 1 && !H.__ol1) {
      if (p) st = p.head ? hi.n : p.start;   // 第一個被刪掉、搬走：照原本的開頭號碼
      else for (k = 1; k < it.length; k++) { var q = old(ls[it[k]]); if (q) { st = q.start; break; } }   // 最前面插一個新的：照原本的開頭號碼
    }
    for (k = 0; k < it.length; k++) put(it[k], st + k);
  });
  function put(i, n) {
    var inf = sc.info[i], mk = rteOlMake(inf.fam, n, inf.mark);
    if (!mk || mk === inf.mark) return;
    var L = ls[i], ol = inf.mark.length, dl = mk.length - ol, hd = _yzRtSlice_(L.runs || [], 0, ol), a = hd.length ? _yzRtCopy_(hd[0]) : {};
    a.t = mk; L.runs = _yzRtMerge_([a].concat(_yzRtCut_(L.runs || [], ol)));
    inf.n = n; inf.mark = mk; changed = true;
    if (sel) ["a", "b"].forEach(function (e) { var q = sel[e]; if (q && q.li === i) q.o = q.o >= ol ? q.o + dl : Math.min(q.o, mk.length); });
  }
  return changed;
}
// ── 第 40 批：字型大小像 Word（點數；內文 12）──
var RTE_PT_STEP = [6, 7].concat(YZ_RT_PT, [80, 90]);   // 「放大字型」「縮小字型」一級一級（跟 Word 一樣：8 以下一次 1 點、72 以上一次 10 點）
function rtePtOf(z) { var s = _yzRtSz_(z); return s ? s.pt : 12; }   // 現在幾點（沒寫＝12）
function rtePtTxt(pt) { return String(Math.round(pt * 2) / 2); }
// op：數字＝設成這個點數；"+"／"-"＝大一級／小一級；"+1"／"-1"＝大 1 點／小 1 點。回新的 z（""＝內文 12 點）；不合理的＝null
function rteSzStep(z, op) {
  var pt = rtePtOf(z), np;
  if (op === "+") np = RTE_PT_STEP.filter(function (x) { return x > pt; })[0] || pt;
  else if (op === "-") np = RTE_PT_STEP.filter(function (x) { return x < pt; }).pop() || pt;
  else if (op === "+1" || op === "-1") np = op === "+1" ? Math.floor(pt) + 1 : Math.ceil(pt) - 1;
  else np = +op;
  if (!(np >= YZ_RT_PT_MIN && np <= YZ_RT_PT_MAX)) return op === "+" || op === "-" || op === "+1" || op === "-1" ? (pt === 12 ? "" : String(z || "")) : null;
  np = Math.round(np * 2) / 2;
  if (np === 12) return "";
  var key = rtePtTxt(np);
  if (typeof drBackOk === "function" && !drBackOk()) key = np <= 11 ? "sm" : np < 14 ? "" : np < 18 ? "lg" : "xl";   // 後端還是舊的（02 還沒換）：只用舊的三種（舊的看得懂）
  return key;
}
// 改之前、改之後：從第幾行開始不一樣（一樣＝行數）
function rteDiffFrom(old, ls) {
  var n = Math.min(old.length, ls.length), i;
  for (i = 0; i < n; i++) if (old[i].L !== ls[i] || old[i].sig !== rteLineSig(ls[i])) return i;
  return n;
}
var RTE_EMOJI = ["⚠️", "❗", "❓", "✅", "❌", "➡️", "⬆️", "⬇️", "📌", "📖", "📞", "⏰", "🔒", "💊", "💉", "🌡️", "❄️", "🔥", "⭐", "🔴", "🟡", "🟢", "🔵", "👍"];

function rteTxt(runs) { return _yzRtRunsText_(runs); }
function rteLen(L) { return L && L.runs ? rteTxt(L.runs).length : 0; }
// 「連結」可以選的：[{ id, label, grp }]（有 grp 的照 grp 分組）→ <option>／<optgroup>
function rteGoOpts(opts) {
  var out = [], gs = {};
  (opts || []).forEach(function (x) {
    var op = h("option", { value: x.id }, [x.label]);
    if (!x.grp) { out.push(op); return; }
    if (!gs[x.grp]) { gs[x.grp] = h("optgroup", { label: x.grp }); out.push(gs[x.grp]); }
    gs[x.grp].appendChild(op);
  });
  return out;
}
function rteIsBlock(L) { return !!L && (L.k === "hr" || L.k === "go" || L.k === "img" || L.k === "tbl"); }        // 沒有字的行（分隔線、連結到標題、圖、表格）
function rteNewPicId(pics) { var id; do { id = Math.random().toString(36).slice(2, 10); } while (!/^[a-z0-9]{8}$/.test(id) || (pics && pics[id])); return id; }   // 圖的代號（這一塊裡不重複）
function rtePickFile(cb) {   // 選一張圖（電腦、手機的檔案選擇）
  var f = h("input", { type: "file", accept: "image/*", style: "display:none" });
  f.onchange = function () { var x = f.files && f.files[0]; f.remove(); if (x) cb(x); };
  document.body.appendChild(f); f.click();
}
function rteMarkClass(m) { return _yzRtMarkKind_(m); }   // 第 39 批：項目符號 14 種（ul）、核對清單（todo）、其他＝編號（ol）
function rteNewLine() { return { k: "p", lv: 0, runs: [] }; }
function rteCopyLines(ls) {
  return ls.map(function (L) {
    var o = { k: L.k, lv: L.lv || 0, runs: (L.runs || []).map(_yzRtCopy_) };
    if (L.tone) o.tone = L.tone;
    if (L.go !== undefined) o.go = L.go;
    if (L.img !== undefined) o.img = L.img;
    if (L.tbl !== undefined) o.tbl = L.tbl;
    return o;
  });
}

function rteCreate(o) {
  o = o || {};
  var inst = {};
  var body = h("div", { class: "rtbody", contenteditable: "true", spellcheck: "false", autocapitalize: "off", autocorrect: "off", role: "textbox", "aria-multiline": "true", "aria-label": "文字內容（選取文字後，按最上面第二排的按鍵）" });
  var rawTa = h("textarea", { class: "ta rtraw", spellcheck: "false", "aria-label": "原始標記" });
  var rawNote = h("div", { class: "hint rtrawnote" }, ["標記模式：這就是「LINE 裡改字」時看到的樣子。[b]…[/b] 粗體、[c=red]…[/c] 紅字、[m=yellow]…[/m] 黃色螢光筆、[fx]1/6[/fx] 公式、[cp]…[/cp] 反灰可複製、[x=solid]…[/x] 文字框、[h2] 標題。改完再按一次「</> 標記」回到一般模式。"]);
  rawTa.hidden = true; rawNote.hidden = true;
  var el = h("div", { class: "rte" }, [body, rawNote, rawTa]);
  var lines = _yzRtParse_(o.value || "");
  var lastSel = null, rawMode = false, composing = false, typedLi = -1;   // typedLi：剛剛打字改過的那一行（第 40 批：離開那一行時才排編號）
  var Hs = { st: [], i: -1, t: null };

  // ───────── 資料 → 畫面 ─────────
  function runNode(r) {
    if (!(r.b || r.i || r.u || r.s || r.c || r.z || r.m || r.fx || r.cp)) return document.createTextNode(r.t);
    var sp = h("span", { class: "rt" + (r.b ? " rt-b" : "") + (r.i ? " rt-i" : "") + (r.u ? " rt-u" : "") + (r.s ? " rt-s" : "") + (r.z ? " rt-z" + r.z : "") + (r.m && YZ_RT_MARKS[r.m] ? " rt-m" : "") + (r.fx ? " rt-fx" : "") + (r.cp ? " rt-cp" : "") });
    if (r.fx) {   // 第 31 批：公式＝一整塊（裡面不能打字；點一下打開「∑ 公式」改）。data-fx＝公式原本的寫法（1/6）
      sp.setAttribute("contenteditable", "false"); sp.setAttribute("data-fx", r.t); sp.setAttribute("title", "公式（點一下修改）：" + r.t);
      sp.appendChild(fxEl(r.t));
    } else if (r.cp) {   // 第 32 批：反灰可複製＝一整塊（灰底；點一下改字或拿掉）。data-cp＝那段字
      sp.setAttribute("contenteditable", "false"); sp.setAttribute("data-cp", r.t); sp.setAttribute("title", "反灰可複製（藥師按旁邊的「📋 複製」就複製好）：" + r.t + "\n點一下可以改字或拿掉");
      sp.appendChild(h("span", { class: "rt-cpt" }, [r.t])); sp.appendChild(h("span", { class: "rt-cpb", "aria-hidden": "true" }, ["📋"]));
    } else sp.textContent = r.t;
    if (r.b) sp.setAttribute("data-b", "1");
    if (r.i) sp.setAttribute("data-i", "1");
    if (r.u) sp.setAttribute("data-u", "1");
    if (r.s) sp.setAttribute("data-s", "1");
    if (r.c && YZ_RT_COLORS[r.c]) { sp.setAttribute("data-c", r.c); sp.style.color = YZ_RT_COLORS[r.c]; }
    var zz = _yzRtSz_(r.z); if (zz) { sp.setAttribute("data-z", r.z); if (!YZ_RT_SIZES[r.z]) sp.style.fontSize = zz.em + "em"; }   // 第 40 批：點數（12 點＝1 倍）
    if (r.m && YZ_RT_MARKS[r.m]) { sp.setAttribute("data-m", r.m); sp.style.backgroundColor = YZ_RT_MARKS[r.m].bg; }   // 第 30 批：螢光筆
    return sp;
  }
  function removeLine(d) {
    run(function (ls) {
      var li = Array.prototype.indexOf.call(body.childNodes, d);
      if (li >= 0) ls.splice(li, 1);
      if (!ls.length) ls.push(rteNewLine());
      var at = Math.min(Math.max(li, 0), ls.length - 1);
      return caret(at, 0);
    });
  }
  function lineEl(L) {
    var d = h("div", { class: "rl rl-" + L.k + (L.lv ? " rl-lv" + L.lv : ""), "data-k": L.k });
    if (L.lv) d.setAttribute("data-lv", String(L.lv));
    if (L.k === "hr") {
      d.setAttribute("contenteditable", "false");
      d.appendChild(h("hr"));
      d.appendChild(h("button", { class: "rl-x", type: "button", title: "刪除這條分隔線", "aria-label": "刪除這條分隔線", onclick: function () { removeLine(d); } }, ["✕"]));
      return d;
    }
    if (L.k === "go") {
      d.setAttribute("contenteditable", "false"); d.setAttribute("data-go", L.go || "");
      var opts = o.titles ? o.titles() : [];
      var sel = h("select", { class: "in rl-gosel", "aria-label": "要連結到哪一章、哪個標題" }, [h("option", { value: "" }, ["（選一個標題或整章）"])].concat(rteGoOpts(opts)));
      sel.value = L.go || "";
      var gh = h("span", { class: "muted rl-gohint" });
      var paintGo = function () {
        var ok = !!sel.value, gone = !ok && !!d.getAttribute("data-go");
        d.classList.toggle("warn", !ok);
        gh.textContent = ok ? "LINE 上是一個可以點的按鈕列；對方那一頁最下面也會自動出現「從這裡連過來」（互相連結）。改名會自動跟著變" : gone ? "⚠ 原本連結的標題（或章）找不到了（可能被刪掉），請重新選一個" : "⚠ 還沒選：沒選的話，LINE 和網頁上都不會顯示這一行";
      };
      sel.onchange = function () { d.setAttribute("data-go", sel.value); paintGo(); lines = readLines(); emit(); histPush(); syncBar(); };
      paintGo();
      d.appendChild(h("span", { class: "rl-goic" }, ["🔗 連結到"]));
      d.appendChild(sel);
      d.appendChild(gh);
      d.appendChild(h("button", { class: "rl-x", type: "button", title: "刪除這個連結", "aria-label": "刪除這個連結", onclick: function () { removeLine(d); } }, ["✕"]));
      return d;
    }
    if (L.k === "img") {   // 一張圖：縮圖＋圖說＋圖片裡的字的狀態＋換一張、刪除（整行不能打字）
      d.setAttribute("contenteditable", "false"); d.setAttribute("data-img", L.img || "");
      var P = o.pics ? (o.pics() || {})[L.img] : null;
      if (!P || !P.url) {
        d.classList.add("warn");
        d.appendChild(h("span", { class: "rl-imgmiss" }, ["⚠ 這張圖找不到了（可能被刪掉）：LINE 和網頁上都不會顯示這一行"]));
      } else {
        var cap = h("input", { class: "in rl-imgcap", value: P.cap || "", placeholder: "圖說（可以不填）", "aria-label": "圖說" });
        ["keydown", "keyup", "keypress", "beforeinput", "input", "paste", "copy", "cut", "compositionstart", "compositionend"].forEach(function (ev) { cap.addEventListener(ev, function (e) { e.stopPropagation(); }); });   // 圖說的字不是這一段文字：不要讓文字編輯器處理
        cap.addEventListener("input", function () { P.cap = cap.value; if (o.onPics) o.onPics(); });
        var side = h("div", { class: "rl-imgside" }, [cap]);
        var info = o.picInfo ? o.picInfo(P) : null; if (info) side.appendChild(info);
        side.appendChild(h("div", { class: "rl-imgbtns" }, [h("button", { class: "btn sm", type: "button", onclick: function () { rtePickFile(function (f) { replaceImg(L.img, f); }); } }, ["換一張…"])]));
        d.appendChild(h("img", { class: "rl-imgsrc", src: P.url, alt: "" }));
        d.appendChild(side);
      }
      d.appendChild(h("button", { class: "rl-x", type: "button", title: "刪除這張圖", "aria-label": "刪除這張圖", onclick: function () { removeLine(d); } }, ["✕"]));
      return d;
    }
    if (L.k === "tbl") {   // 第 29 批：一張表格（整行不能打字）：表格的樣子＋「✏️ 編輯表格」＋刪除
      d.setAttribute("contenteditable", "false"); d.setAttribute("data-tbl", L.tbl || "");
      var TB = o.tbls ? (o.tbls() || {})[L.tbl] : null;
      if (!TB) {
        d.classList.add("warn");
        d.appendChild(h("span", { class: "rl-imgmiss" }, ["⚠ 這張表格找不到了：LINE 和網頁上都不會顯示這一行"]));
      } else {
        var nr = (TB.rows || []).length, nc = 0; (TB.rows || []).forEach(function (r) { nc = Math.max(nc, (r || []).length); });
        d.appendChild(h("div", { class: "rl-tblpv" }, [typeof webTable === "function" ? webTable(TB, null) : h("span", {}, ["表格"])]));
        var eb = h("button", { class: "btn sm pri rl-tbled", type: "button", onclick: function () { if (o.tblEdit) o.tblEdit(L.tbl, function () { lines = readLines(); render(); }); } }, ["✏️ 編輯表格"]);
        d.appendChild(h("div", { class: "rl-tblbar" }, [h("span", { class: "muted" }, ["▦ 表格　" + nc + " 欄 × " + nr + " 列（在這一塊文字裡）"]), eb]));
      }
      d.appendChild(h("button", { class: "rl-x", type: "button", title: "刪除這張表格", "aria-label": "刪除這張表格", onclick: function () { removeLine(d); } }, ["✕"]));
      return d;
    }
    if (L.k === "box") {
      var T = _yzRtTone_(L.tone);   // 第 39 批：顏色＋符號（不要符號＝data-ic 空的）
      d.setAttribute("data-tone", T.key); d.setAttribute("data-ic", T.icon);
      d.style.background = T.bg; d.style.borderColor = T.bd; d.style.color = T.ink;
    } else if (/^h[1-4]$/.test(L.k)) { var H = YZ_RT_HEAD[L.k]; d.style.fontSize = H.em + "em"; d.style.color = H.color; }
    if (!(L.runs || []).length) d.appendChild(h("br"));
    else _yzRtBoxGroups_(L.runs).forEach(function (g) {   // 第 41 批：文字框：連在一起、框一樣的那幾段包成一個框（裡面的字各有各的格式）
      var css = g.x ? _yzRtBoxCss_(g.x, g.runs) : "";
      if (!css) { g.runs.forEach(function (r) { d.appendChild(runNode(r)); }); return; }
      var w = h("span", { class: "rt rt-x", "data-x": g.x, style: css });
      g.runs.forEach(function (r) { w.appendChild(runNode(r)); });
      d.appendChild(w);
    });
    return d;
  }
  function render() {
    if (!lines.length) lines.push(rteNewLine());
    if (rteIsBlock(lines[lines.length - 1])) lines.push(rteNewLine());       // 最後一行一定要能打字
    body.innerHTML = "";
    lines.forEach(function (L, i) {
      var d = lineEl(L), pv = lines[i - 1], nx = lines[i + 1];
      if (L.k === "box") {   // 連續、同一種的標註，LINE 和網頁會合成一個框；這裡也畫成一個框
        if (pv && pv.k === "box" && pv.tone === L.tone && (pv.lv || 0) === (L.lv || 0)) d.setAttribute("data-cont", "1");   // 縮排不一樣的：分開成兩個框（跟網頁、LINE 一樣）
        if (nx && nx.k === "box" && nx.tone === L.tone && (nx.lv || 0) === (L.lv || 0)) d.setAttribute("data-more", "1");
      }
      body.appendChild(d);
    });
  }

  // ───────── 畫面 → 資料 ─────────
  function isFx(n) { return !!n && n.nodeType === 1 && n.hasAttribute("data-fx"); }
  function isCp(n) { return !!n && n.nodeType === 1 && n.hasAttribute("data-cp"); }   // 第 32 批：反灰可複製
  function isAtom(n) { return isFx(n) || isCp(n); }   // 一整塊的（公式、反灰可複製）：游標只能在它前面或後面
  function atomOf(n) { while (n && n !== body) { if (isAtom(n)) return n; n = n.parentNode; } return null; }
  function fxOf(n) { while (n && n !== body) { if (isFx(n)) return n; n = n.parentNode; } return null; }   // 在哪個公式裡面（沒有＝null）
  function cpOf(n) { while (n && n !== body) { if (isCp(n)) return n; n = n.parentNode; } return null; }
  function textLen(n) {
    if (n.nodeType === 3) return n.nodeValue.length;
    if (isFx(n)) return n.getAttribute("data-fx").length;   // 第 31 批：公式＝原本寫法的字數（跟存起來的一樣）
    if (isCp(n)) return n.getAttribute("data-cp").length;   // 第 32 批：反灰可複製＝那段字的字數
    if (n.nodeName === "BR" || (n.nodeType === 1 && n.getAttribute("contenteditable") === "false")) return 0;
    var s = 0; for (var c = n.firstChild; c; c = c.nextSibling) s += textLen(c);
    return s;
  }
  function runsOf(root) {
    var runs = [];
    (function walk(n, at) {
      if (n.nodeType === 3) { var t = n.nodeValue.replace(/ /g, " ").replace(/[​﻿]/g, ""); if (t) { var r = { t: t }; for (var k in at) r[k] = at[k]; runs.push(r); } return; }
      if (n.nodeType !== 1 || n.nodeName === "BR") return;
      var a = {}; for (var k2 in at) a[k2] = at[k2];
      var nn = n.nodeName;
      if (n.hasAttribute("data-b") || nn === "B" || nn === "STRONG") a.b = 1;
      if (n.hasAttribute("data-i") || nn === "I" || nn === "EM") a.i = 1;
      if (n.hasAttribute("data-u") || nn === "U") a.u = 1;
      if (n.hasAttribute("data-s") || nn === "S" || nn === "STRIKE" || nn === "DEL") a.s = 1;
      if (n.hasAttribute("data-c") && YZ_RT_COLORS[n.getAttribute("data-c")]) a.c = n.getAttribute("data-c");
      if (n.hasAttribute("data-z") && _yzRtSz_(n.getAttribute("data-z"))) a.z = n.getAttribute("data-z");
      if (n.hasAttribute("data-m") && YZ_RT_MARKS[n.getAttribute("data-m")]) a.m = n.getAttribute("data-m");
      if (n.hasAttribute("data-x") && _yzRtBox_(n.getAttribute("data-x"))) a.x = n.getAttribute("data-x");   // 第 41 批：文字框
      if (isFx(n)) { var fr = { t: _yzFxClean_(n.getAttribute("data-fx")), fx: 1 }; for (var k3 in a) fr[k3] = a[k3]; if (fr.t) runs.push(fr); return; }   // 第 31 批：公式（裡面畫出來的分數不算字）
      if (isCp(n)) { var cr = { t: _yzCpClean_(n.getAttribute("data-cp")), cp: 1 }; for (var k4 in a) cr[k4] = a[k4]; if (cr.t) runs.push(cr); return; }   // 第 32 批：反灰可複製（裡面的 📋 不算字）
      for (var c = n.firstChild; c; c = c.nextSibling) walk(c, a);
    })(root, {});
    return _yzRtMerge_(runs);
  }
  function readLines() {
    var out = [];
    Array.prototype.forEach.call(body.childNodes, function (n) {
      if (n.nodeType === 3) { var t = n.nodeValue.replace(/ /g, " "); if (t.trim()) out.push({ k: "p", lv: 0, runs: [{ t: t }] }); return; }
      if (n.nodeType !== 1) return;
      var k = n.getAttribute("data-k") || "p";
      if (!/^(p|h[1-4]|hr|q|box|go|img|tbl)$/.test(k)) k = "p";
      var L = { k: k, lv: Math.min(YZ_RT_MAXLV, +(n.getAttribute("data-lv") || 0) || 0), runs: [] };
      if (k === "hr") { out.push(L); return; }
      if (k === "go") { L.go = n.getAttribute("data-go") || ""; out.push(L); return; }
      if (k === "img") { L.img = n.getAttribute("data-img") || ""; out.push(L); return; }
      if (k === "tbl") { L.tbl = n.getAttribute("data-tbl") || ""; out.push(L); return; }
      if (k === "box") L.tone = _yzRtToneOk_(n.getAttribute("data-tone")) ? _yzRtTone_(n.getAttribute("data-tone")).key : "info";   // 第 39 批：顏色-符號
      L.runs = runsOf(n);
      out.push(L);
    });
    if (!out.length) out.push(rteNewLine());
    return out;
  }
  // 瀏覽器自己亂改了畫面（跨行刪除、拖拉…）留下奇怪的標籤：重畫一次，變回乾淨的樣子
  function dirtyDom() {
    var kids = body.childNodes, i, j, n;
    for (i = 0; i < kids.length; i++) { n = kids[i]; if (n.nodeType !== 1 || n.nodeName !== "DIV" || !n.hasAttribute("data-k")) return true; }
    var lns = body.querySelectorAll(".rl");
    for (i = 0; i < lns.length; i++) {
      var k = lns[i].getAttribute("data-k"); if (k === "hr" || k === "go" || k === "img" || k === "tbl") continue;
      var all = lns[i].getElementsByTagName("*");
      for (j = 0; j < all.length; j++) {
        var e = all[j]; if (e.nodeName === "BR") continue;
        if (atomOf(e.parentNode)) continue;   // 第 31 批：公式裡面（畫分數用的標籤）不算；第 32 批：反灰可複製裡面也是
        if (e.nodeName === "SPAN" && e.classList.contains("rt")) continue;
        return true;
      }
    }
    return false;
  }
  function normalize() {
    var s = getSel() || lastSel;
    lines = readLines(); render();
    if (s) { try { setSel(s.a, s.b); } catch (e) { /* 位置對不上就算了 */ } }
    lastSel = getSel() || s;
  }

  // ───────── 游標位置（第幾行、第幾個字） ─────────
  function lineIndexOf(node) { var n = node; while (n && n.parentNode !== body) n = n.parentNode; return n ? Array.prototype.indexOf.call(body.childNodes, n) : -1; }
  function domPos(node, off, end) {
    var fo = atomOf(node);
    if (fo) { node = fo.parentNode; off = Array.prototype.indexOf.call(node.childNodes, fo) + (end ? 1 : 0); }   // 第 31 批：在公式裡面＝公式前面／後面（公式是一整塊）；第 32 批：反灰可複製也是
    if (node === body) { var last = body.childNodes.length - 1, li0 = Math.max(0, Math.min(off, last)); return { li: li0, o: off > last ? textLen(body.childNodes[li0]) : 0 }; }
    var li = lineIndexOf(node); if (li < 0) return null;
    var lineNode = body.childNodes[li], count = 0, found = false;
    (function walk(n) {
      if (found) return;
      if (n === node) {
        if (n.nodeType === 3) count += off; else for (var i = 0; i < off && i < n.childNodes.length; i++) count += textLen(n.childNodes[i]);
        found = true; return;
      }
      if (n.nodeType === 3) { count += n.nodeValue.length; return; }
      if (isAtom(n)) { count += textLen(n); return; }
      if (n.nodeName === "BR" || (n.nodeType === 1 && n.getAttribute("contenteditable") === "false")) return;
      for (var c = n.firstChild; c; c = c.nextSibling) { walk(c); if (found) return; }
    })(lineNode);
    return { li: li, o: count };
  }
  function domFromPos(li, off) {
    var lineNode = body.childNodes[li]; if (!lineNode) return null;
    if (lineNode.getAttribute("contenteditable") === "false") return { node: body, offset: li };
    var rest = off, lastP = null, res = null;
    (function walk(n) {
      if (res) return;
      if (n.nodeType === 3) { if (rest <= n.nodeValue.length) { res = { node: n, offset: rest }; return; } rest -= n.nodeValue.length; lastP = { node: n, offset: n.nodeValue.length }; return; }
      if (n.nodeName === "BR") return;
      if (isAtom(n)) {   // 第 31 批：公式是一整塊：游標只能在它前面或後面（第 32 批：反灰可複製也是）
        var fl = textLen(n), pi = Array.prototype.indexOf.call(n.parentNode.childNodes, n);
        if (rest <= 0) { res = { node: n.parentNode, offset: pi }; return; }
        if (rest < fl) { res = { node: n.parentNode, offset: pi + 1 }; return; }
        rest -= fl; lastP = { node: n.parentNode, offset: pi + 1 }; return;
      }
      for (var c = n.firstChild; c; c = c.nextSibling) { walk(c); if (res) return; }
    })(lineNode);
    if (res) return res;
    if (lastP) return lastP;
    return { node: lineNode, offset: 0 };
  }
  function getSel() {
    var s = window.getSelection(); if (!s || !s.rangeCount) return null;
    var r = s.getRangeAt(0);
    if (!body.contains(r.startContainer) || !body.contains(r.endContainer)) return null;
    var a = domPos(r.startContainer, r.startOffset), b = domPos(r.endContainer, r.endOffset, true);
    return a && b ? { a: a, b: b } : null;
  }
  function setSel(a, b) {
    b = b || a;
    var s = domFromPos(a.li, a.o), e = domFromPos(b.li, b.o); if (!s || !e) return;
    var r = document.createRange(); r.setStart(s.node, s.offset); r.setEnd(e.node, e.offset);
    var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
  }
  function caret(li, o) { return { a: { li: li, o: o }, b: { li: li, o: o } }; }
  function isCollapsed(s) { return s.a.li === s.b.li && s.a.o === s.b.o; }
  function lineSpan(s) {   // 要改「整行」的指令用：連點三下選一行時，選取的尾巴會落在下一行的開頭，那一行不算
    var to = s.b.li; if (to > s.a.li && s.b.o === 0) to--;
    return { from: s.a.li, to: to };
  }

  // ───────── 復原／重做 ─────────
  function snap() { return { v: _yzRtSerialize_(readLines()), sel: getSel() || lastSel }; }
  function histInit() { Hs.st = [snap()]; Hs.i = 0; }
  function histPush() {
    var s = snap(), top = Hs.st[Hs.i];
    if (top && top.v === s.v) { top.sel = s.sel; return; }
    Hs.st = Hs.st.slice(0, Hs.i + 1); Hs.st.push(s);
    if (Hs.st.length > 200) Hs.st.shift();
    Hs.i = Hs.st.length - 1;
  }
  function histFlush() { if (Hs.t) { clearTimeout(Hs.t); Hs.t = null; histPush(); } }
  function histLater() { if (Hs.t) clearTimeout(Hs.t); Hs.t = setTimeout(function () { Hs.t = null; histPush(); }, 500); }
  function restore(sn) {
    typedLi = -1;
    lines = _yzRtParse_(sn.v); render();
    if (sn.sel) { try { setSel(sn.sel.a, sn.sel.b); } catch (e) { /* 位置對不上就算了 */ } }
    lastSel = getSel() || sn.sel;
    emit(); syncBar();
  }
  function undo() { histFlush(); if (Hs.i > 0) { Hs.i--; restore(Hs.st[Hs.i]); } }
  function redo() { histFlush(); if (Hs.i < Hs.st.length - 1) { Hs.i++; restore(Hs.st[Hs.i]); } }

  // ───────── 通知外面 ─────────
  function value() { return _yzRtSerialize_(lines).replace(/\n+$/, ""); }
  function emit() { if (o.onChange) o.onChange(value()); }
  function syncBar() { if (typeof rteBarSync === "function") rteBarSync(); }
  function focusBody() {
    // 第 40 批：焦點在別的地方（例如格式列的「字型大小」框）：先記住剛剛選的字，focus 的時候瀏覽器會把游標放到最前面（不能讓它蓋掉）
    if (!body.contains(document.activeElement)) { var keep = lastSel; body.focus({ preventScroll: true }); if (keep) { lastSel = keep; try { setSel(keep.a, keep.b); } catch (e) { /* ignore */ } } }
  }
  // 改資料的統一入口：fn(行們, 選取) → 新的選取
  function run(fn) {
    if (rawMode) return;
    focusBody();
    var s = getSel() || lastSel || caret(Math.max(0, lines.length - 1), 0);
    lines = readLines(); histFlush();
    if (s.a.li >= lines.length || s.b.li >= lines.length) s = caret(lines.length - 1, 0);
    var old = lines.map(function (L) { return { L: L, sig: rteLineSig(L) }; }), prior = rteOlPrior(lines), tl = typedLi;   // 第 40 批：編號自動重排用（改之前的樣子）
    typedLi = -1;
    var ns = fn(lines, s) || s;
    if (!lines.length) lines.push(rteNewLine());
    var from = rteDiffFrom(old, lines);
    if (tl >= 0 && tl < from) from = tl;   // 剛剛打字改過、還沒排的那一行也算
    try { rteRenumber(lines, from, ns, prior); } catch (e) { /* 排不了就照原樣 */ }
    lines.forEach(function (L) { delete L.__from; delete L.__ol1; });
    render();
    try { setSel(ns.a, ns.b); } catch (e) { /* ignore */ }
    lastSel = getSel() || ns;
    histPush(); emit(); syncBar();
  }

  // ───────── 改資料的小動作 ─────────
  function deleteSel(ls, s) {   // 刪掉選到的字（可能跨好幾行），回傳游標位置
    if (isCollapsed(s)) return { li: s.a.li, o: s.a.o };
    var A = ls[s.a.li], B = ls[s.b.li];
    var head = rteIsBlock(A) ? null : _yzRtSlice_(A.runs || [], 0, s.a.o);
    var tail = rteIsBlock(B) ? null : _yzRtSlice_(B.runs || [], s.b.o, 1e9);
    if (head === null && tail === null) { ls.splice(s.a.li, s.b.li - s.a.li + 1, rteNewLine()); return { li: s.a.li, o: 0 }; }
    if (head === null) { ls.splice(s.a.li, s.b.li - s.a.li); B.runs = tail; return { li: s.a.li, o: 0 }; }   // 從分隔線／連結開始選：它們整個刪掉
    if (tail === null) { ls.splice(s.a.li + 1, s.b.li - s.a.li); A.runs = head; return { li: s.a.li, o: s.a.o }; }
    if (s.a.o === 0 && s.b.o === 0 && s.b.li > s.a.li) { ls.splice(s.a.li, s.b.li - s.a.li); return { li: s.a.li, o: 0 }; }   // 整行整行選（連點三下）：後面那一行原封不動留著
    A.runs = _yzRtMerge_(head.concat(tail));
    ls.splice(s.a.li + 1, s.b.li - s.a.li);
    return { li: s.a.li, o: s.a.o };
  }
  function pasteLines(ls, pos, P) {   // 把「一行一行」的 P 放進游標處：第一行接在游標前面的字後面，最後一行接在游標後面的字前面
    var L = ls[pos.li];
    if (rteIsBlock(L)) { ls.splice(pos.li + 1, 0, rteNewLine()); pos = { li: pos.li + 1, o: 0 }; L = ls[pos.li]; }
    var len = rteLen(L), head = _yzRtSlice_(L.runs || [], 0, pos.o), tail = _yzRtSlice_(L.runs || [], pos.o, len);
    var empty = !head.length && !tail.length, out = [], i, f;
    P = rteCopyLines(P);
    if (!P.length) P = [rteNewLine()];
    f = P[0];
    if (!rteIsBlock(f)) {
      var ln = { k: empty ? f.k : L.k, lv: empty ? (f.lv || 0) : (L.lv || 0), runs: _yzRtMerge_(head.concat(f.runs)) };
      if (ln.k === "box") ln.tone = empty ? f.tone : L.tone;
      if (!empty && head.length) ln.__from = L;   // 第 40 批：還是原本那一行（編號自動重排認得它）
      out.push(ln);
      for (i = 1; i < P.length; i++) out.push(P[i]);
    } else {
      if (head.length) { var hl = { k: L.k, lv: L.lv || 0, runs: head }; if (L.tone) hl.tone = L.tone; out.push(hl); }
      for (i = 0; i < P.length; i++) out.push(P[i]);
    }
    var last = out[out.length - 1], cl, co;
    if (rteIsBlock(last)) { out.push({ k: "p", lv: 0, runs: tail }); cl = out.length - 1; co = 0; }
    else { cl = out.length - 1; co = rteLen(last); last.runs = _yzRtMerge_(last.runs.concat(tail)); }
    Array.prototype.splice.apply(ls, [pos.li, 1].concat(out));
    return caret(pos.li + cl, co);
  }
  function splitAt(ls, li, off) {   // Enter：在游標處切成兩行；清單會接下一個記號；標註／引用在空行按 Enter 就跳出來
    var L = ls[li], plain = rteTxt(L.runs || []), len = plain.length;
    var head = _yzRtSlice_(L.runs || [], 0, off), tail = _yzRtSlice_(L.runs || [], off, len);
    if (L.k === "p") {
      var it = _yzRtItem_(plain);
      if (it && !it.rest.trim()) { L.runs = []; return caret(li, 0); }            // 空的清單項目再按 Enter ＝ 跳出清單
      if (it && off >= it.len) {
        var pvL = li > 0 ? ls[li - 1] : null, pvIt = pvL && pvL.k === "p" && !rteIsBlock(pvL) ? _yzRtItem_(rteTxt(pvL.runs || [])) : null;
        var mk = _yzRtNextMark_(it.mark, pvIt ? pvIt.mark : null) + " ";   // 第 39 批：上一行的記號（H. 後面的 I. 是字母）
        ls.splice(li + 1, 0, { k: "p", lv: L.lv || 0, runs: _yzRtMerge_([{ t: mk }].concat(tail)) });
        L.runs = head;
        return caret(li + 1, mk.length);
      }
    }
    if ((L.k === "box" || L.k === "q") && !plain.trim()) { L.k = "p"; delete L.tone; return caret(li, 0); }
    var nk = /^h[1-4]$/.test(L.k) && !tail.length ? "p" : L.k, nl = { k: nk, lv: L.lv || 0, runs: tail };   // 標題結尾按 Enter ＝ 下一行是一般文字
    if (nk === "box") nl.tone = L.tone;
    if (L.k === "p" && _yzRtItem_(rteTxt(tail))) nl.__from = L;   // 第 40 批：在編號前面按 Enter：編號那一行往下移，還是原本那一個（編號自動重排認得它）
    L.runs = head;
    ls.splice(li + 1, 0, nl);
    return caret(li + 1, 0);
  }

  function cmdInline(key, val) {
    run(function (ls, s) {
      if (isCollapsed(s)) { toast("請先用滑鼠選取要改的字，再按這個鈕"); return s; }
      var cov = [], li;
      for (li = s.a.li; li <= s.b.li; li++) {
        var L = ls[li]; if (!L || rteIsBlock(L)) continue;
        var len = rteLen(L), a = li === s.a.li ? s.a.o : 0, b = li === s.b.li ? s.b.o : len;
        if (b > a) cov.push({ L: L, a: a, b: b });
      }
      if (!cov.length) return s;
      var on;
      if (key === "c" || key === "z" || key === "m" || key === "x") on = val || 0;
      else on = cov.every(function (c) { return _yzRtSlice_(c.L.runs, c.a, c.b).every(function (r) { return !!r[key]; }); }) ? 0 : 1;
      cov.forEach(function (c) {
        var len2 = rteLen(c.L);
        var mid = _yzRtSlice_(c.L.runs, c.a, c.b).map(function (r) { if (on) r[key] = on; else delete r[key]; return r; });
        c.L.runs = _yzRtMerge_(_yzRtSlice_(c.L.runs, 0, c.a).concat(mid, _yzRtSlice_(c.L.runs, c.b, len2)));
      });
      return s;
    });
  }
  function cmdFrame(v) {   // 第 41 批：文字框（像 Word 的「字元框線」）：v 沒給＝有框就拿掉、沒有就用上一次的樣子；""＝拿掉；"dash-red"＝改成這個樣子
    if (v !== "" && typeof bk41Ok === "function" && !bk41Ok()) { bk41Warn("文字框"); return; }
    var st0 = state();
    if (v === undefined || v === null) { if (st0.x) cmdInline("x", null); else cmdInline("x", _yzRtBox_(RTE.lastFrame) ? RTE.lastFrame : "solid"); }
    else if (!v) cmdInline("x", null);
    else if (_yzRtBox_(v)) { RTE.lastFrame = v; cmdInline("x", v); }
    rteBarSync();
  }
  function cmdMark(color) {   // 螢光筆：color 沒給＝用上一次的顏色；選到的字整段已經是這個顏色＝拿掉（再按一次取消）
    var c = color || RTE.lastMark || "yellow", st0 = state();
    if (!color && st0.m === c) cmdInline("m", null); else cmdInline("m", c);
    if (color) RTE.lastMark = color;
    rteBarSync();
  }
  // 第 40 批：字型大小（像 Word）：每一段各自算（選到大小不一樣的字，按「放大字型」每一段各大一級）
  function cmdSize(op) {
    run(function (ls, s) {
      if (isCollapsed(s)) { toast("請先用滑鼠選取要改大小的字，再選大小"); return s; }
      for (var li = s.a.li; li <= s.b.li; li++) {
        var L = ls[li]; if (!L || rteIsBlock(L)) continue;
        var len = rteLen(L), a = li === s.a.li ? s.a.o : 0, b = li === s.b.li ? s.b.o : len;
        if (b <= a) continue;
        var mid = _yzRtSlice_(L.runs, a, b).map(function (r) { var z = rteSzStep(r.z, op); if (z === null) return r; if (z) r.z = z; else delete r.z; return r; });
        L.runs = _yzRtMerge_(_yzRtSlice_(L.runs, 0, a).concat(mid, _yzRtSlice_(L.runs, b, len)));
      }
      return s;
    });
  }
  function cmdClear() {
    run(function (ls, s) {
      if (isCollapsed(s)) { toast("請先用滑鼠選取要清除格式的字"); return s; }
      for (var li = s.a.li; li <= s.b.li; li++) {
        var L = ls[li]; if (!L || rteIsBlock(L)) continue;
        var len = rteLen(L), a = li === s.a.li ? s.a.o : 0, b = li === s.b.li ? s.b.o : len;
        if (b <= a) continue;
        var mid = _yzRtSlice_(L.runs, a, b).map(function (r) { return { t: r.t }; });
        L.runs = _yzRtMerge_(_yzRtSlice_(L.runs, 0, a).concat(mid, _yzRtSlice_(L.runs, b, len)));
      }
      return s;
    });
  }
  function cmdKind(kind, tone) {   // 整行變成：文字／標題／引用／標註（再按一次同一個鈕＝變回文字）
    run(function (ls, s) {
      var r = lineSpan(s), first = ls[r.from], same = first && first.k === kind && (kind !== "box" || first.tone === tone);
      for (var li = r.from; li <= r.to; li++) {
        var L = ls[li]; if (!L || rteIsBlock(L)) continue;
        if (same || kind === "p") { L.k = "p"; delete L.tone; } else { L.k = kind; if (kind === "box") L.tone = tone; else delete L.tone; }
      }
      return s;
    });
  }
  function cmdList(type, pick) {   // 項目符號／編號／核對清單：切換行首的記號（記號就是普通的字，LINE 和網頁看到記號就會自動排整齊）
    // 第 39 批：pick＝從「▾」選單選的記號（項目符號）或編號樣式的第一個（例：一、）：一定套上（不會變成取消）；沒給＝用上一次選的，第一行已經是同一類就取消
    run(function (ls, s) {
      var r = lineSpan(s), first = ls[r.from], it0 = first && first.k === "p" && !rteIsBlock(first) ? _yzRtItem_(rteTxt(first.runs)) : null;
      var want = pick || (type === "ul" ? RTE.lastUl : type === "ol" ? RTE.lastOl : "☐");
      var off = !pick && !!(it0 && rteMarkClass(it0.mark) === type), prevMark = null, prev2 = null, ns = { a: { li: s.a.li, o: s.a.o }, b: { li: s.b.li, o: s.b.o } };
      if (type === "ol" && r.from > 0) {   // 上一行是同一種編號：接下去
        var pv = ls[r.from - 1], pit = pv && pv.k === "p" && !rteIsBlock(pv) ? _yzRtItem_(rteTxt(pv.runs)) : null;
        if (pit && rteMarkClass(pit.mark) === "ol" && rteOlFams(pit.mark).indexOf(rteOlFams(want)[0]) >= 0) {
          prevMark = pit.mark; var pv2 = r.from > 1 ? ls[r.from - 2] : null, pit2 = pv2 && pv2.k === "p" && !rteIsBlock(pv2) ? _yzRtItem_(rteTxt(pv2.runs)) : null; prev2 = pit2 ? pit2.mark : null;
        }
      }
      for (var li = r.from; li <= r.to; li++) {
        var L = ls[li]; if (!L || rteIsBlock(L)) continue;
        var wasP = L.k === "p"; L.k = "p"; delete L.tone;
        var it = wasP ? _yzRtItem_(rteTxt(L.runs)) : null, oldLen = it ? it.len : 0, rest = it ? _yzRtCut_(L.runs, it.len) : L.runs, mark = "";
        if (!off) {
          if (type === "ol") { if (!prevMark) L.__ol1 = true; mark = prevMark ? _yzRtNextMark_(prevMark, prev2) : want; prev2 = prevMark; prevMark = mark; }   // 第 40 批：__ol1＝開新的一串（從第一號開始，不接上面的）
          else mark = type === "todo" ? "☐" : want;
          L.runs = _yzRtMerge_([{ t: mark + " " }].concat(rest));
        } else L.runs = rest;
        var delta = (mark ? mark.length + 1 : 0) - oldLen;
        if (li === ns.a.li) ns.a.o = Math.max(0, s.a.o + delta);
        if (li === ns.b.li) ns.b.o = Math.max(0, s.b.o + delta);
      }
      if (ns.a.li === ns.b.li && ns.b.o < ns.a.o) ns.b.o = ns.a.o;
      return ns;
    });
  }
  // 第 39 批：標註框（顏色＋符號）。c＝顏色（null＝不換）、ic＝符號（null＝不換；換顏色時沒選過符號＝用那個顏色預設的）。
  //   游標沒有選一段：改游標所在的整個框（連在一起、同一種的那幾行）；不是框的行：變成框
  function cmdBox(c, ic) {
    run(function (ls, s) {
      var r = lineSpan(s), from = r.from, to = r.to, L0 = ls[from];
      if (s.a.li === s.b.li && s.a.o === s.b.o && L0 && L0.k === "box") {
        var t0 = L0.tone, lv0 = L0.lv || 0;
        while (from > 0 && ls[from - 1] && ls[from - 1].k === "box" && ls[from - 1].tone === t0 && (ls[from - 1].lv || 0) === lv0) from--;
        while (ls[to + 1] && ls[to + 1].k === "box" && ls[to + 1].tone === t0 && (ls[to + 1].lv || 0) === lv0) to++;
      }
      for (var li = from; li <= to; li++) {
        var L = ls[li]; if (!L || rteIsBlock(L)) continue;
        var T = L.k === "box" ? _yzRtTone_(L.tone) : null, nc = c || (T ? T.c : "info"), nic = ic || (T && T.ic !== YZ_RT_TONES[T.c].ic ? T.ic : null);
        L.k = "box"; L.tone = _yzRtToneKey_(nc, nic);
      }
      return s;
    });
  }
  function cmdInsertLine(kind, arg) {   // 分隔線、連結到標題、圖：整行；游標在空行就直接變成它，不然插在這一行後面；後面一定留一行可以打字
    run(function (ls, s) {
      var li = s.b.li, L = ls[li], empty = L && L.k === "p" && !rteTxt(L.runs || []).trim();
      var nl = kind === "hr" ? { k: "hr", lv: 0, runs: [] } : kind === "img" ? { k: "img", lv: L ? (L.lv || 0) : 0, img: arg || "", runs: [] } : { k: "go", lv: 0, go: "", runs: [] }, at;   // 圖：縮排跟這一行一樣（跟上面的字對齊）
      if (empty) { ls[li] = nl; at = li; } else { ls.splice(li + 1, 0, nl); at = li + 1; }
      if (!ls[at + 1] || rteIsBlock(ls[at + 1])) ls.splice(at + 1, 0, rteNewLine());
      return caret(at + 1, 0);
    });
  }
  function cmdIndent(d) {
    run(function (ls, s) {
      var r = lineSpan(s);
      for (var li = r.from; li <= r.to; li++) if (ls[li]) ls[li].lv = Math.max(0, Math.min(YZ_RT_MAXLV, (ls[li].lv || 0) + d));
      return s;
    });
  }
  // ── 圖（第 28 批）：選檔／拖進來／貼上 → 編輯器上傳（縮小、檔名亂碼）→ 放在游標那一行後面 ──
  function insertImgFile(file) {
    if (!o.imgUp || !o.pics) { toast("這裡不能放圖"); return; }
    var keep = getSel() || lastSel;
    o.imgUp(file, function (p) {
      if (!p) return;
      var pics = o.pics(), id = rteNewPicId(pics);
      pics[id] = p;
      if (keep) lastSel = keep;
      cmdInsertLine("img", id);
      if (o.onPics) o.onPics(p, id);
    });
  }
  function replaceImg(id, file) {
    if (!o.imgUp || !o.pics) return;
    o.imgUp(file, function (p) {   // 第 3 個參數 true＝換一張（不是多一張）
      if (!p) return;
      var pics = o.pics(), P = pics[id] || (pics[id] = {});
      ["url", "fid", "fname", "ar", "info"].forEach(function (k) { if (p[k] !== undefined) P[k] = p[k]; else delete P[k]; });
      delete P.ocr;   // 換了圖：圖裡的字要重新辨識
      lines = readLines(); render(); emit();
      if (o.onPics) o.onPics(P, id);
    }, true);
  }
  function cmdImg() { if (rawMode) return; lastSel = getSel() || lastSel; rtePickFile(insertImgFile); }
  // ── 第 31 批：公式 ──
  // 放一個公式（at＝null：放在游標處，選了一行裡的字＝換掉那些字）；改一個舊的（at＝{li, o, n, src}）；src 空的＝拿掉那個公式
  function fxPut(src, at, sel) {
    src = _yzFxClean_(src);
    if (sel) { focusBody(); try { setSel(sel.a, sel.b); } catch (e) { /* 位置對不上就算了 */ } lastSel = sel; }   // 小視窗關掉後：游標回到原本的地方（不要跑到最前面）
    var lost = false;
    run(function (ls, s) {
      if (at) {
        var L = ls[at.li], len = L && !rteIsBlock(L) ? rteLen(L) : 0, old = len ? _yzRtSlice_(L.runs, at.o, at.o + at.n) : [];
        if (old.length !== 1 || !old[0].fx || old[0].t !== at.src) { lost = true; return s; }   // 畫面重畫過、位置對不上：不要改錯地方
        var nr = _yzRtCopy_(old[0]); nr.t = src;
        L.runs = _yzRtMerge_(_yzRtSlice_(L.runs, 0, at.o).concat(src ? [nr] : [], _yzRtSlice_(L.runs, at.o + at.n, len)));
        return caret(at.li, at.o + src.length);
      }
      if (!src) return s;
      if (s.a.li !== s.b.li) s = { a: s.b, b: s.b };   // 選了好幾行：不換掉，放在選取的最後面
      var pos = deleteSel(ls, s), L2 = ls[pos.li];
      if (rteIsBlock(L2)) { ls.splice(pos.li + 1, 0, rteNewLine()); pos = { li: pos.li + 1, o: 0 }; L2 = ls[pos.li]; }
      var len2 = rteLen(L2), pv = pos.o > 0 ? _yzRtSlice_(L2.runs, pos.o - 1, pos.o)[0] : null, r = pv ? _yzRtCopy_(pv) : {};   // 格式跟前一個字一樣（像打字一樣）
      r.t = src; r.fx = 1;
      L2.runs = _yzRtMerge_(_yzRtSlice_(L2.runs, 0, pos.o).concat([r], _yzRtSlice_(L2.runs, pos.o, len2)));
      return caret(pos.li, pos.o + src.length);
    });
    if (lost) toast("畫面剛剛更新過，請再點一次那個公式");
  }
  // 「∑ 公式」：chip＝點到的那個公式（改它）；沒有＝放一個新的（選了一行裡的字：那些字直接拿來當公式）
  function cmdFx(chip) {
    if (rawMode) return;
    var at = null, init = "", s = null, ls = readLines();
    if (chip && body.contains(chip)) {
      var cp = domPos(chip.parentNode, Array.prototype.indexOf.call(chip.parentNode.childNodes, chip));
      if (!cp) return;
      init = chip.getAttribute("data-fx") || "";
      at = { li: cp.li, o: cp.o, n: init.length, src: init };
    } else {
      s = getSel() || lastSel;
      if (s && !isCollapsed(s) && s.a.li === s.b.li && ls[s.a.li] && !rteIsBlock(ls[s.a.li])) {
        var pc = _yzRtSlice_(ls[s.a.li].runs, s.a.o, s.b.o);
        if (pc.length === 1 && pc[0].fx) { init = pc[0].t; at = { li: s.a.li, o: s.a.o, n: init.length, src: init }; }   // 選到的剛好是一個公式：改它
        else init = rteTxt(pc).replace(/\s+/g, " ").trim().slice(0, YZ_FX_MAX);
      }
    }
    rteFxDialog(init, !!at, function (src) { fxPut(src, at, s); }, at ? function () { fxPut("", at, s); } : null);
  }
  // ── 第 32 批：反灰可複製 ──
  // 選了一行裡的字 → 直接變成灰底的一條（不用再打）；改一個舊的（at＝{li, o, n, src}）：text 空的＝拿掉（字留著，變回一般的字）
  function cpPut(text, at, sel) {
    text = _yzCpClean_(text);
    if (sel) { focusBody(); try { setSel(sel.a, sel.b); } catch (e) { /* 位置對不上就算了 */ } lastSel = sel; }
    var lost = false;
    run(function (ls, s) {
      if (at) {
        var L = ls[at.li], len = L && !rteIsBlock(L) ? rteLen(L) : 0, old = len ? _yzRtSlice_(L.runs, at.o, at.o + at.n) : [];
        if (old.length !== 1 || !old[0].cp || old[0].t !== at.src) { lost = true; return s; }   // 畫面重畫過、位置對不上：不要改錯地方
        var nr = _yzRtCopy_(old[0]);
        if (text) nr.t = text; else { delete nr.cp; nr.t = at.src; }   // 拿掉：字留著，變回一般的字
        L.runs = _yzRtMerge_(_yzRtSlice_(L.runs, 0, at.o).concat([nr], _yzRtSlice_(L.runs, at.o + at.n, len)));
        return caret(at.li, at.o + nr.t.length);
      }
      if (!text) return s;
      if (s.a.li !== s.b.li) s = { a: s.b, b: s.b };   // 選了好幾行：不換掉，放在選取的最後面
      var pos = deleteSel(ls, s), L2 = ls[pos.li];
      if (rteIsBlock(L2)) { ls.splice(pos.li + 1, 0, rteNewLine()); pos = { li: pos.li + 1, o: 0 }; L2 = ls[pos.li]; }
      var len2 = rteLen(L2), pv = pos.o > 0 ? _yzRtSlice_(L2.runs, pos.o - 1, pos.o)[0] : null, r = pv ? _yzRtCopy_(pv) : {};
      delete r.fx; r.t = text; r.cp = 1;
      L2.runs = _yzRtMerge_(_yzRtSlice_(L2.runs, 0, pos.o).concat([r], _yzRtSlice_(L2.runs, pos.o, len2)));
      return caret(pos.li, pos.o + text.length);
    });
    if (lost) toast("畫面剛剛更新過，請再點一次那一條");
    return !lost;
  }
  // 「⧉ 反灰可複製」：chip＝點到的那一條（改它）；選了字＝直接變成反灰可複製；沒選＝打開小視窗打字
  function cmdCp(chip) {
    if (rawMode) return;
    var at = null, init = "", s = null, ls = readLines();
    if (chip && body.contains(chip)) {
      var cp0 = domPos(chip.parentNode, Array.prototype.indexOf.call(chip.parentNode.childNodes, chip));
      if (!cp0) return;
      init = chip.getAttribute("data-cp") || "";
      at = { li: cp0.li, o: cp0.o, n: init.length, src: init };
    } else {
      s = getSel() || lastSel;
      if (s && !isCollapsed(s) && s.a.li === s.b.li && ls[s.a.li] && !rteIsBlock(ls[s.a.li])) {
        var pc = _yzRtSlice_(ls[s.a.li].runs, s.a.o, s.b.o);
        if (pc.length === 1 && pc[0].cp) { init = pc[0].t; at = { li: s.a.li, o: s.a.o, n: init.length, src: init }; }   // 選到的剛好是一條：改它
        else {
          var txt = _yzCpClean_(rteTxt(pc).replace(/\s+/g, " "));
          if (txt && !pc.some(function (r) { return r.fx; })) { if (cpPut(txt, null, s)) toast("⧉ 好了：藥師按旁邊的「📋 複製」就複製好（點一下這一條可以改字或拿掉）"); return; }
          init = txt;
        }
      } else if (s && !isCollapsed(s) && s.a.li !== s.b.li) { toast("一次一行：請只選一行裡的字"); return; }
    }
    rteCpDialog(init, !!at, function (v) { cpPut(v, at, s); }, at ? function () { cpPut("", at, s); } : null);
  }
  function cmdText(str, mode) {   // 在游標處放字（表情符號、貼上）。mode："markup"＝當成格式文字讀（從 LINE 或這個編輯器複製來的）；其他＝一般字，一行一行放
    str = String(str === null || str === undefined ? "" : str).replace(/\r\n?/g, "\n").replace(/ /g, " ");
    var P = mode === "markup" ? _yzRtParse_(str) : str.split("\n").map(function (x) { return { k: "p", lv: 0, runs: x ? [{ t: x }] : [] }; });
    run(function (ls, s) { return pasteLines(ls, deleteSel(ls, s), P); });
  }
  function doEnter() {
    run(function (ls, s) {
      var pos = deleteSel(ls, s), L = ls[pos.li];
      if (rteIsBlock(L)) { ls.splice(pos.li + 1, 0, rteNewLine()); return caret(pos.li + 1, 0); }
      return splitAt(ls, pos.li, pos.o);
    });
  }
  function doBackspaceStart() {   // 在一行的最前面按 Backspace：標題／標註／引用 → 變回文字；有縮排 → 少一層；否則跟上一行合併
    run(function (ls, s) {
      var li = s.a.li, L = ls[li];
      if (rteIsBlock(L)) { ls.splice(li, 1); return caret(Math.max(0, li - 1), 0); }
      if (L.k !== "p") { L.k = "p"; delete L.tone; return caret(li, 0); }
      if ((L.lv || 0) > 0) { L.lv--; return caret(li, 0); }
      if (li === 0) return s;
      var P = ls[li - 1];
      if (rteIsBlock(P)) { ls.splice(li - 1, 1); return caret(li - 1, 0); }
      var plen = rteLen(P); P.runs = _yzRtMerge_((P.runs || []).concat(L.runs || [])); ls.splice(li, 1);
      return caret(li - 1, plen);
    });
  }
  function doDeleteEnd() {   // 在一行的最後面按 Delete：把下一行接上來
    run(function (ls, s) {
      var li = s.a.li, N = ls[li + 1];
      if (!N) return s;
      if (rteIsBlock(N)) { ls.splice(li + 1, 1); return s; }
      var L = ls[li], plen = rteLen(L); L.runs = _yzRtMerge_((L.runs || []).concat(N.runs || [])); ls.splice(li + 1, 1);
      return caret(li, plen);
    });
  }

  // ───────── 現在的狀態（給格式列用） ─────────
  function state() {
    var ls = readLines(), s = getSel() || lastSel, st = { ok: !!s, kind: null, tone: null, list: null, b: 0, i: 0, u: 0, s: 0, c: null, z: null, m: null, cp: 0, x: null };
    if (!s) return st;
    var first = ls[Math.min(s.a.li, ls.length - 1)];
    if (first) { st.kind = first.k; st.tone = first.tone || null; var it = rteIsBlock(first) || first.k !== "p" ? null : _yzRtItem_(rteTxt(first.runs)); st.list = it ? rteMarkClass(it.mark) : null; }
    var pieces = [], li;
    if (isCollapsed(s)) {
      var Lc = ls[Math.min(s.a.li, ls.length - 1)];
      if (Lc && !rteIsBlock(Lc)) pieces = s.a.o > 0 ? _yzRtSlice_(Lc.runs, s.a.o - 1, s.a.o) : _yzRtSlice_(Lc.runs, 0, 1);
    } else for (li = s.a.li; li <= s.b.li; li++) {
      var L = ls[li]; if (!L || rteIsBlock(L)) continue;
      var len = rteLen(L), a = li === s.a.li ? s.a.o : 0, b = li === s.b.li ? s.b.o : len;
      if (b > a) pieces = pieces.concat(_yzRtSlice_(L.runs, a, b));
    }
    if (pieces.length) {
      ["b", "i", "u", "s"].forEach(function (k) { st[k] = pieces.every(function (r) { return !!r[k]; }) ? 1 : 0; });
      var c0 = pieces[0].c || null, z0 = pieces[0].z || null;
      st.c = pieces.every(function (r) { return (r.c || null) === c0; }) ? (c0 || "") : null;
      st.z = pieces.every(function (r) { return (r.z || null) === z0; }) ? (z0 || "") : null;
      var m0 = pieces[0].m || null;
      st.m = pieces.every(function (r) { return (r.m || null) === m0; }) ? (m0 || "") : null;
      var x0 = pieces[0].x || null;   // 第 41 批：文字框
      st.x = pieces.every(function (r) { return (r.x || null) === x0; }) ? (x0 || "") : null;
      st.cp = !isCollapsed(s) && pieces.length === 1 && pieces[0].cp ? 1 : 0;   // 第 32 批：選到的剛好是一段反灰可複製
    }
    return st;
  }

  // 在游標那一行切開：給「＋表格／＋圖片…」用——游標那一行（含）以前的留在這個文字塊，後面的搬到新的文字塊。
  // 游標在一行空白行上：那一行就是「要放東西的位置」，兩邊都不帶它。
  function splitAtCaret() {
    lines = readLines(); histFlush();
    var s = getSel() || lastSel, li = s ? Math.min(s.b.li, lines.length - 1) : lines.length - 1, cl = lines[li];
    var blank = !!cl && cl.k === "p" && !rteTxt(cl.runs || []).trim();
    var before = _yzRtSerialize_(lines.slice(0, blank ? li : li + 1)).replace(/\n+$/, "");
    var after = _yzRtSerialize_(lines.slice(li + 1)).replace(/^\n+|\n+$/g, "");
    return { before: before, after: after };
  }

  // ───────── 事件 ─────────
  var FORMAT_MAP = { formatBold: "b", formatItalic: "i", formatUnderline: "u", formatStrikeThrough: "s" };
  body.addEventListener("beforeinput", function (e) {
    if (e.isComposing) return;
    var t = e.inputType;
    if (t === "insertParagraph" || t === "insertLineBreak") { e.preventDefault(); doEnter(); return; }
    if (t === "historyUndo") { e.preventDefault(); undo(); return; }
    if (t === "historyRedo") { e.preventDefault(); redo(); return; }
    if (t === "insertFromDrop" || t === "insertFromYank") { e.preventDefault(); return; }
    if (/^format/.test(t)) { e.preventDefault(); if (FORMAT_MAP[t]) cmdInline(FORMAT_MAP[t]); return; }
    var s = getSel(); if (!s) return;
    if (!isCollapsed(s) && s.a.li !== s.b.li) {   // 選取跨好幾行：自己處理，不讓瀏覽器把好幾行亂併在一起
      if (t === "insertText") { e.preventDefault(); cmdText(e.data || "", "plain"); return; }
      if (/^delete/.test(t)) { e.preventDefault(); run(function (ls, s2) { var p = deleteSel(ls, s2); return caret(p.li, p.o); }); return; }
    }
    if (isCollapsed(s) && (t === "deleteContentBackward" || t === "deleteContentForward")) {
      var ls = readLines(), L = ls[s.a.li];
      if (t === "deleteContentBackward" && s.a.o === 0) { e.preventDefault(); doBackspaceStart(); return; }
      if (t === "deleteContentForward" && L && s.a.o >= rteLen(L) && ls[s.a.li + 1]) { e.preventDefault(); doDeleteEnd(); }
    }
  });
  body.addEventListener("compositionstart", function () { composing = true; });   // 輸入法選字中：不要動畫面
  body.addEventListener("compositionend", function () {
    composing = false;
    setTimeout(function () { if (dirtyDom()) normalize(); lines = readLines(); lastSel = getSel() || lastSel; emit(); histLater(); syncBar(); }, 0);
  });
  body.addEventListener("input", function () {
    // 瀏覽器自己改了畫面（打字、剪下）：把畫面讀回資料
    if (!composing && dirtyDom()) normalize();
    lines = readLines(); lastSel = getSel() || lastSel; emit(); histLater(); syncBar();
    var ts = getSel(); if (ts && ts.a.li === ts.b.li) { if (typedLi >= 0 && typedLi !== ts.a.li) settle(true); typedLi = ts.a.li; }   // 第 40 批：記住打字的那一行
  });
  // 第 40 批：打字改了編號（例如第一個從 1. 改成 4.）：游標離開那一行（點別的地方、上下鍵、離開這個框）才把後面的號碼排好
  function settle(keep) {
    if (typedLi < 0 || rawMode || composing) return;
    var s = getSel();
    if (keep && s && s.a.li === typedLi && s.b.li === typedLi && document.activeElement === body) return;   // 還在那一行
    var li = typedLi; typedLi = -1;
    var ls = readLines(); if (li >= ls.length) return;
    var ch = false;
    try { ch = rteRenumber(ls, li, s, null); } catch (e) { ch = false; }
    if (!ch) return;
    histFlush();   // 打的字先記一步（Ctrl+Z 先回到「打了、還沒排號碼」）
    lines = ls; render();
    if (keep && s) { try { setSel(s.a, s.b); } catch (e) { /* 位置對不上就算了 */ } }
    lastSel = getSel() || s || lastSel;
    histPush(); emit(); syncBar();
  }
  function packSel() {   // 選起來的那一段：{ text（一般字）, own（格式標記）, pics（文字裡的圖）, tbls（文字裡的表格）}；沒選＝null
    var s = getSel(); if (!s || isCollapsed(s)) return null;
    var ls = readLines(), to = lineSpan(s).to, part = [], li;
    for (li = s.a.li; li <= to; li++) {
      var L = ls[li]; if (!L) continue;
      var c = { k: L.k, lv: L.lv || 0, runs: [] };
      if (L.tone) c.tone = L.tone;
      if (L.go !== undefined) c.go = L.go;
      if (L.img !== undefined) c.img = L.img;
      if (L.tbl !== undefined) c.tbl = L.tbl;
      if (!rteIsBlock(L)) {
        var len = rteLen(L), a = li === s.a.li ? s.a.o : 0, b = li === to && to === s.b.li ? s.b.o : len;
        c.runs = _yzRtSlice_(L.runs, a, b);
        if (s.a.li === to) { c.k = "p"; c.lv = 0; delete c.tone; }   // 只選了半行：只帶字的格式，不帶「這一行是標題」
      }
      part.push(c);
    }
    var pp = {}, pics = o.pics ? o.pics() || {} : {};   // 複製到的圖：圖的資料也帶著（貼到別的文字塊也看得到）
    part.forEach(function (L) { if (L.k === "img" && pics[L.img]) pp[L.img] = pics[L.img]; });
    var tt = {}, tbls = o.tbls ? o.tbls() || {} : {};   // 第 29 批：複製到的表格：表格的內容也帶著
    part.forEach(function (L) { if (L.k === "tbl" && tbls[L.tbl]) tt[L.tbl] = tbls[L.tbl]; });
    return { text: part.map(function (L) { return rteIsBlock(L) ? "" : _yzRtRunsLin_(L.runs); }).join("\n"), own: _yzRtSerialize_(part), pics: JSON.parse(JSON.stringify(pp)), tbls: JSON.parse(JSON.stringify(tt)) };   // 公式：一行的寫法（¹⁄₆）
  }
  function copySel(e, cut) {
    if (!e.clipboardData) return;
    var pk = packSel(); if (!pk) return;   // 沒選字：交給瀏覽器
    e.clipboardData.setData("text/plain", pk.text);
    e.clipboardData.setData("application/x-yz-rt", pk.own);
    if (Object.keys(pk.pics).length) e.clipboardData.setData("application/x-yz-pics", JSON.stringify(pk.pics));
    if (Object.keys(pk.tbls).length) e.clipboardData.setData("application/x-yz-tbls", JSON.stringify(pk.tbls));
    RTE.clip = pk; rteBarSync();   // 第 32 批：Ctrl+C 複製的，格式列的「📌 貼上」也貼得出來
    e.preventDefault();
    if (cut) run(function (ls2, s2) { var p = deleteSel(ls2, s2); return caret(p.li, p.o); });
  }
  function pasteOwn(own, pj, tj) {   // 貼上自己的格式（Ctrl+V、格式列的「📌 貼上」都走這裡）：圖、表格的資料也放進這一塊
    try { var pics = o.pics ? o.pics() : null; if (pj && pics) Object.keys(pj).forEach(function (k) { if (!pics[k] && pj[k] && pj[k].url) pics[k] = JSON.parse(JSON.stringify(pj[k])); }); } catch (x) { /* 沒有圖 */ }
    try {   // 表格：每貼一次都是一張新的表（代號換新的，不會兩行改同一張）
      var tbs = o.tbls ? o.tbls() : null;
      if (tj && tbs) Object.keys(tj).forEach(function (k) { if (!tj[k] || !Array.isArray(tj[k].rows)) return; var nid = tbs[k] ? rteNewPicId(tbs) : k; tbs[nid] = JSON.parse(JSON.stringify(tj[k])); if (nid !== k) own = own.split("[tbl=" + k + "]").join("[tbl=" + nid + "]"); });
      else if (!tbs) own = own.split("\n").filter(function (ln) { return !/^[ 　\t]*\[tbl=/.test(ln); }).join("\n");   // 這裡不能放表格：表格那幾行不要
    } catch (x) { /* 沒有表格 */ }
    cmdText(own, "markup");
  }
  function cmdCopy() {   // 第 32 批：格式列的「📋 複製」：選起來的字（格式、圖、表格都帶著）
    if (rawMode) return;
    var pk = packSel();
    if (!pk) { toast("先選取要複製的字（按住滑鼠拖過去），再按「📋 複製」"); return; }
    RTE.clip = pk; rteBarSync();
    try { document.execCommand("copy"); } catch (x) { /* 系統的剪貼簿用不了也沒關係：「📌 貼上」照樣貼得出來 */ }
    toast("📋 複製好了：到要放的地方點一下，按「📌 貼上」（Ctrl+V 也可以）");
  }
  function cmdPaste() {
    if (rawMode) return;
    var pk = RTE.clip;
    if (!pk) { toast("還沒有複製的字：先選字、按「📋 複製」"); return; }
    pasteOwn(pk.own, pk.pics, pk.tbls);
    toast("📌 貼上了");
  }
  body.addEventListener("copy", function (e) { copySel(e, false); });
  body.addEventListener("cut", function (e) { copySel(e, true); });
  body.addEventListener("paste", function (e) {
    e.preventDefault();
    var cd = e.clipboardData || window.clipboardData, own = cd && cd.getData ? cd.getData("application/x-yz-rt") : "", tx = cd && cd.getData ? cd.getData("text/plain") : "";
    if (!own && !tx && cd && cd.items) {   // 剪貼簿裡只有圖（截圖、複製圖片）：放一張圖
      for (var pi = 0; pi < cd.items.length; pi++) if (cd.items[pi].kind === "file" && /^image\//.test(cd.items[pi].type || "")) { var pf = cd.items[pi].getAsFile(); if (pf) { insertImgFile(pf); return; } }
    }
    if (own) {
      var pj = null, tj = null;
      try { pj = JSON.parse(cd.getData("application/x-yz-pics") || "null"); } catch (x) { pj = null; }
      try { tj = JSON.parse(cd.getData("application/x-yz-tbls") || "null"); } catch (x) { tj = null; }
      pasteOwn(own, pj, tj);
    }
    else if (tx) cmdText(tx, _yzRtHas_(tx) ? "markup" : "plain");   // 貼上的字：長得像標記的（從 LINE 裡改字複製來的）就還原格式；其他一律當一般字，外面的格式不會跟進來
    else toast("剪貼簿裡沒有文字");
  });
  var fxDown = null;   // 第 31 批：按下去的時候在哪個公式上（放開前畫面如果動了一下，放開時就不在公式上，瀏覽器不會把「點一下」送給公式）
  body.addEventListener("pointerdown", function (e) { var fo = atomOf(e.target); fxDown = fo ? { el: fo, x: e.clientX, y: e.clientY } : null; });
  body.addEventListener("click", function (e) {   // 點一下公式＝打開「∑ 公式」改它；第 32 批：點一下反灰可複製＝改字或拿掉
    var fo = atomOf(e.target), d = fxDown; fxDown = null;
    if (!fo && d && d.el.isConnected && Math.abs(e.clientX - d.x) < 8 && Math.abs(e.clientY - d.y) < 8) fo = d.el;   // 滑鼠沒動：就是點那一塊
    if (fo && !rawMode) { e.preventDefault(); RTE.cur = inst; if (isCp(fo)) cmdCp(fo); else cmdFx(fo); }
  });
  body.addEventListener("dragstart", function (e) { e.preventDefault(); });
  body.addEventListener("drop", function (e) {   // 把圖拖進來：放一張圖（其他東西不收）
    e.preventDefault();
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f && /^image\//.test(f.type || "")) insertImgFile(f);
  });
  body.addEventListener("dragover", function (e) { if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], "Files") >= 0) e.preventDefault(); });
  body.addEventListener("keydown", function (e) {
    if (e.isComposing || e.keyCode === 229) return;
    var mod = e.ctrlKey || e.metaKey, k = (e.key || "").toLowerCase();
    if (mod && !e.altKey) {
      if (k === "b") { e.preventDefault(); cmdInline("b"); return; }
      if (k === "i") { e.preventDefault(); cmdInline("i"); return; }
      if (k === "u") { e.preventDefault(); cmdInline("u"); return; }
      if (k === "x" && e.shiftKey) { e.preventDefault(); cmdInline("s"); return; }
      if (k === "h" && e.shiftKey) { e.preventDefault(); cmdMark(); return; }   // 第 30 批：螢光筆（上一次的顏色；整段都是這個顏色＝拿掉）
      if (k === ">" || (e.shiftKey && (k === "." || e.code === "Period"))) { e.preventDefault(); cmdSize("+"); return; }   // 第 40 批：放大字型（像 Word）
      if (k === "<" || (e.shiftKey && (k === "," || e.code === "Comma"))) { e.preventDefault(); cmdSize("-"); return; }   // 縮小字型
      if (k === "]" && !e.shiftKey) { e.preventDefault(); cmdSize("+1"); return; }   // 大 1 點
      if (k === "[" && !e.shiftKey) { e.preventDefault(); cmdSize("-1"); return; }   // 小 1 點
      if (k === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
      if (k === "y") { e.preventDefault(); redo(); return; }
      return;
    }
    if (k === "tab" && !e.altKey) {   // Tab＝縮排（只在「選了字、在一行最前面、或這一行是清單」時）；其他情形照常跳到下一個欄位，鍵盤才不會被卡住
      var s = getSel(); if (!s) return;
      var ls = readLines(), r = lineSpan(s), want = false, li;
      if (e.shiftKey) { for (li = r.from; li <= r.to; li++) if (ls[li] && (ls[li].lv || 0) > 0) want = true; }
      else {
        var L0 = ls[s.a.li], it = L0 && !rteIsBlock(L0) && L0.k === "p" ? _yzRtItem_(rteTxt(L0.runs)) : null;
        want = !isCollapsed(s) || s.a.o === 0 || !!it;
      }
      if (want) { e.preventDefault(); cmdIndent(e.shiftKey ? -1 : 1); }
    }
  });
  body.addEventListener("focus", function () { RTE.cur = inst; lastSel = getSel() || lastSel; syncBar(); });
  function maybeLeave() {   // 游標離開這個文字框（連「標記模式」的框也不在）：格式列熄掉
    setTimeout(function () { if (RTE.cur === inst && !el.contains(document.activeElement) && !(RTE.bar && RTE.bar.el.contains(document.activeElement))) { RTE.cur = null; syncBar(); } }, 140);   // 第 40 批：在格式列的「字型大小」框裡打數字＝還在改這一段
  }
  body.addEventListener("blur", function () { lastSel = getSel() || lastSel; settle(false); maybeLeave(); });
  body.addEventListener("mouseup", function () { lastSel = getSel() || lastSel; settle(true); syncBar(); });
  body.addEventListener("keyup", function (e) { lastSel = getSel() || lastSel; if (e && /^(Arrow|Page|Home|End|Enter|Tab|Escape)/.test(e.key || "")) settle(true); syncBar(); });

  // ───────── 標記模式（看／改原始標記；萬一畫面編輯器不好用的備案） ─────────
  function fitRaw() { rawTa.style.height = "auto"; rawTa.style.height = Math.max(120, rawTa.scrollHeight + 4) + "px"; }
  function setRaw(on) {
    if (on === rawMode) return;
    if (on) { lines = readLines(); histFlush(); rawTa.value = value(); rawMode = true; body.hidden = true; rawTa.hidden = false; rawNote.hidden = false; fitRaw(); rawTa.focus(); }
    else { lines = _yzRtParse_(rawTa.value); rawMode = false; rawTa.hidden = true; rawNote.hidden = true; body.hidden = false; render(); histPush(); emit(); body.focus({ preventScroll: true }); }
    syncBar();
  }
  rawTa.addEventListener("input", function () { fitRaw(); if (o.onChange) o.onChange(rawTa.value.replace(/\n+$/, "")); });
  rawTa.addEventListener("focus", function () { RTE.cur = inst; syncBar(); });
  rawTa.addEventListener("blur", maybeLeave);

  render(); histInit();
  inst.el = el; inst.body = body;
  inst.lite = !!o.lite;   // 第 40 批：流程圖框裡的字（不能放圖、連結、反灰可複製）
  inst.owns = function (n) { return !!n && el.contains(n); };
  inst.cmd = { inline: cmdInline, frame: cmdFrame, size: cmdSize, clear: cmdClear, kind: cmdKind, list: cmdList, box: cmdBox, line: cmdInsertLine, indent: cmdIndent, text: cmdText, undo: undo, redo: redo, raw: function () { setRaw(!rawMode); }, img: cmdImg, mark: cmdMark, fx: function () { cmdFx(null); }, cp: function () { cmdCp(null); }, copy: cmdCopy, paste: cmdPaste };
  inst.refresh = function () { lines = readLines(); render(); };   // 圖片裡的字辨識好了之類（畫面重畫，內容不變）
  inst.state = state; inst.value = function () { return rawMode ? rawTa.value.replace(/\n+$/, "") : value(); }; inst.isRaw = function () { return rawMode; };
  inst.splitAtCaret = function () { if (rawMode) setRaw(false); return splitAtCaret(); };
  inst.focus = function () {
    body.focus({ preventScroll: true });
    var last = lines.length - 1;
    try { setSel({ li: last, o: rteIsBlock(lines[last]) ? 0 : rteLen(lines[last]) }); } catch (e) { /* ignore */ }
  };
  inst.hasHist = function () { return { undo: Hs.i > 0, redo: Hs.i < Hs.st.length - 1 }; };
  return inst;
}

/* ───────── 第 31 批：「∑ 公式」小視窗（打公式、馬上看到樣子、LINE 上的樣子） ───────── */
// 快速鍵：t＝沒選字時放的樣子；w＝選了字時（$＝選到的字）；|＝游標停的地方
var RTE_FX_KEYS = [
  { h: "▭⁄▭ 分數", t: "(|)/()", w: "($)/(|)", tip: "分數（上下排）：分子、分母各放在括號裡；也可以直接打 1/6" },
  { h: "x² 次方", t: "^(|)", w: "($)^(|)", tip: "次方（上標）：例如 m^2" },
  { h: "x₁ 下標", t: "_(|)", w: "($)_(|)", tip: "下標：例如 C_max" },
  { h: "√ 根號", t: "√(|)", w: "√($)|", tip: "根號：例如 √(身高×體重/3600)" },
  { h: "( ) 括號", t: "(|)", w: "($)|", tip: "括號：把一整段包起來（當分子、分母、次方時，外面那層括號不會顯示）" }
];
var RTE_FX_SYM = ["×", "÷", "±", "≤", "≥", "≈", "≠", "→", "·", "°", "µ", "Δ"];
var RTE_FX_EX = [["分數", "1/6"], ["每平方公尺", "mg/m^2"], ["下標", "C_max"], ["CrCl", "((140-年齡)×體重)/(72×Scr)"], ["BSA", "√((身高×體重)/3600)"]];
// 第 32 批：「⧉ 反灰可複製」的小視窗：打字（或改字）→ 下面看到藥師看到的樣子；改一條舊的：可以「拿掉」（字留著，變回一般的字）
function rteCpDialog(init, editing, onDone, onRemove) {
  var bx = h("div", { class: "modal", role: "dialog", "aria-modal": "true", "aria-label": "反灰可複製" }), shut = false;
  var close = function () { if (shut) return; shut = true; bx.remove(); };
  var inp = h("input", { class: "in cpin", type: "text", maxlength: String(YZ_CP_MAX), placeholder: "例如：檔案放在哪裡的路徑、要給藥師貼上的字", "aria-label": "要給藥師複製的字", autocomplete: "off", autocapitalize: "off", spellcheck: "false" });
  inp.value = init || "";
  var pv = h("div", { class: "cppv", "aria-live": "polite" });
  var okB = btn(editing ? "改好了" : "放進去", function () {
    var v = _yzCpClean_(inp.value);
    if (!v) { toast("先打要給藥師複製的字"); inp.focus(); return; }
    close(); onDone(v);
  }, "sm pri cpok");
  function paint() {
    var v = _yzCpClean_(inp.value);
    pv.innerHTML = ""; okB.disabled = !v;
    if (!v) { pv.appendChild(h("span", { class: "muted" }, ["在上面打字，這裡就是藥師在網頁上看到的樣子"])); return; }
    pv.appendChild(cpEl(v));
  }
  var btns = [];
  if (onRemove) btns.push(btn("拿掉（變回一般的字）", function () { close(); onRemove(); }, "sm bad cpdel"));
  btns.push(h("span", { class: "fxsp" }), btn("取消", close, "sm"), okB);
  bx.appendChild(h("div", { class: "dlg cpdlg" }, [
    h("h3", {}, [editing ? "⧉ 改反灰可複製" : "⧉ 反灰可複製"]),
    h("p", { class: "dlg-p" }, ["藥師看到一條灰底的字，旁邊有「📋 複製」：按一下就複製好，直接去貼上（網頁、LINE 都一樣）。適合放檔案的路徑、範本的位置、常常要打的字。"]),
    inp, pv,
    h("div", { class: "hint" }, ["一條最多 " + YZ_CP_MAX + " 個字，只放一般的字（不放粗體、顏色）。LINE 太舊（或電腦版）按了沒反應的話：請藥師改用網頁（一樣按「📋 複製」）。"]),
    h("div", { class: "dlg-b" }, btns)
  ]));
  inp.addEventListener("input", paint);
  inp.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); okB.click(); } });
  bx.onkeydown = function (e) { if (e.key === "Escape") close(); };
  bx.addEventListener("mousedown", function (e) { if (e.target === bx) close(); });   // 點外面＝取消
  document.body.appendChild(bx);
  paint();
  try { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e) { /* 沒關係 */ }
  return close;
}
function rteFxDialog(init, editing, onDone, onRemove) {
  var bx = h("div", { class: "modal", role: "dialog", "aria-modal": "true", "aria-label": "數學公式" }), shut = false;
  var close = function () { if (shut) return; shut = true; bx.remove(); };
  var inp = h("input", { class: "in fxin", type: "text", maxlength: String(YZ_FX_MAX), placeholder: "例如 1/6、m^2、C_max、√(x)", "aria-label": "公式", autocomplete: "off", autocapitalize: "off", spellcheck: "false" });
  inp.value = init || "";
  var pv = h("div", { class: "fxpv", "aria-live": "polite" }), lin = h("div", { class: "hint fxlin" });
  var okB = btn(editing ? "改好了" : "放進去", function () {
    var v = _yzFxClean_(inp.value);
    if (!v) { toast("先打公式"); inp.focus(); return; }
    close(); onDone(v);
  }, "sm pri fxok");
  function paint() {
    var v = _yzFxClean_(inp.value);
    pv.innerHTML = "";
    okB.disabled = !v;
    if (!v) { pv.appendChild(h("span", { class: "muted fxph" }, ["在上面打公式，這裡就是網頁、編輯器上的樣子"])); lin.textContent = ""; return; }
    pv.appendChild(fxEl(v));
    var l = _yzFxLinear_(v), st = !!_yzFxFlex_(v, {});
    lin.textContent = "LINE 上：一行只放這個公式＝" + (st ? "跟上面一樣上下排" : l) + "；夾在句子裡＝" + l;
  }
  function put(tpl, wrap) {
    var v = inp.value, a = typeof inp.selectionStart === "number" ? inp.selectionStart : v.length, b = typeof inp.selectionEnd === "number" ? inp.selectionEnd : a, sel = v.slice(a, b);
    var parts = (sel && wrap ? wrap : tpl).split("|"), pre = parts[0].split("$").join(sel), post = (parts[1] || "").split("$").join(sel);
    inp.value = (v.slice(0, a) + pre + post + v.slice(b)).slice(0, YZ_FX_MAX);
    try { inp.focus(); inp.setSelectionRange(a + pre.length, a + pre.length); } catch (e) { /* 沒關係 */ }
    paint();
  }
  var keep = function (e) { e.preventDefault(); };   // 按快速鍵：輸入框不會失去焦點（游標、選的字才不會不見）
  var keys = h("div", { class: "fxkeys", role: "group", "aria-label": "快速鍵" });
  RTE_FX_KEYS.forEach(function (k) { keys.appendChild(h("button", { type: "button", class: "btn sm fxk", title: k.tip, onmousedown: keep, onclick: function () { put(k.t, k.w); } }, [k.h])); });
  RTE_FX_SYM.forEach(function (c) { keys.appendChild(h("button", { type: "button", class: "btn sm fxk fxsym", title: "放一個「" + c + "」", onmousedown: keep, onclick: function () { put(c + "|", c + "$|"); } }, [c])); });
  var exs = h("div", { class: "fxexs" }, [h("span", { class: "muted" }, ["例子（點一下換成這個）："])]);
  RTE_FX_EX.forEach(function (x) { exs.appendChild(h("button", { type: "button", class: "btn sm fxex", title: x[1], onmousedown: keep, onclick: function () { inp.value = x[1]; paint(); try { inp.focus(); } catch (e) { /* 沒關係 */ } } }, [h("small", {}, [x[0]]), fxEl(x[1])])); });
  var help = h("div", { class: "hint fxhelp" }, [
    h("div", {}, ["打法跟 Word 一樣：", h("b", {}, ["1/6"]), " → 上下排的分數；", h("b", {}, ["m^2"]), " → m²；", h("b", {}, ["C_max"]), " → 下標；", h("b", {}, ["√(…)"]), " 或 ", h("b", {}, ["sqrt(…)"]), " → 根號；", h("b", {}, ["*"]), " → ×；", h("b", {}, ["<="]), " → ≤。"]),
    h("div", {}, ["一整段當分子、分母或次方：用括號包起來（外面那層括號不會顯示）。要一條真的斜線、不要變分數：打兩條 ", h("b", {}, ["//"]), "。"])
  ]);
  var btns = [];
  if (onRemove) btns.push(btn("🗑 拿掉這個公式", function () { close(); onRemove(); }, "sm bad fxdel"));
  btns.push(h("span", { class: "fxsp" }), btn("取消", close, "sm"), okB);
  bx.appendChild(h("div", { class: "dlg fxdlg" }, [h("h3", {}, [editing ? "∑ 改公式" : "∑ 放一個公式"]), inp, pv, lin, keys, help, exs, h("div", { class: "dlg-b" }, btns)]));
  inp.addEventListener("input", paint);
  inp.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); okB.click(); } });
  bx.onkeydown = function (e) { if (e.key === "Escape") close(); };
  bx.addEventListener("mousedown", function (e) { if (e.target === bx) close(); });   // 點外面＝取消
  document.body.appendChild(bx);
  paint();
  try { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e) { /* 沒關係 */ }
  return close;
}

/* ───────── 最上面的「格式列」（所有文字塊共用，作用在你正在改的那一個） ───────── */
var RTE_BAR = [
  { g: "字", items: [
    { id: "b", h: "<b>B</b>", tip: "粗體（Ctrl+B）：先選取要改的字", a: ["inline", "b"] },
    { id: "i", h: "<i>I</i>", tip: "斜體（Ctrl+I）：先選取要改的字", a: ["inline", "i"] },
    { id: "u", h: "<u>U</u>", tip: "底線（Ctrl+U）：先選取要改的字", a: ["inline", "u"] },
    { id: "s", h: "<s>S</s>", tip: "刪除線（Ctrl+Shift+X）：先選取要改的字", a: ["inline", "s"] },
    { id: "color", h: '<span class="fbA">A</span><i class="fbcbar"></i><span class="fbcar">▾</span>', tip: "文字顏色：先選取要改的字", pop: "color" },
    { id: "mark", h: '<span class="fbM">🖍</span><i class="fbmbar"></i><span class="fbcar">▾</span>', tip: "螢光筆（黃、綠、藍、粉、橘、紫）：先選取要畫的字。Ctrl+Shift+H＝用上一次的顏色畫／再按一次拿掉", pop: "mark" },
    { id: "frame", h: '<span class="fbX">字</span>', tip: "文字框（像 Word 的「字元框線」）：先選取要框起來的字，按一下＝加框，再按一次＝拿掉。旁邊 ▾ 選樣子（實線、虛線、點線、雙線、粗線、圓角）和顏色", a: ["frame"] },   // 第 41 批
    { id: "frame-pick", h: "▾", tip: "文字框的樣子：實線、虛線、點線、雙線、粗線、圓角（像按鍵）；框的顏色", pop: "frame" },
    { id: "size", fsz: 1, tip: "字型大小（像 Word；內文 12）：先選取要改的字，再選大小，或在框裡打數字按 Enter" },   // 第 40 批：[ 12 ▾ ] A▲ A▼
    { id: "fx", h: "∑ 公式", tip: "數學公式（像 Word 一樣打）：1/6＝上下排的分數、m^2＝次方、C_max＝下標、√(…)＝根號。放好的公式點一下可以修改", a: ["fx"] },
    { id: "cp", h: "⧉ 反灰可複製", tip: "反灰可複製：選起來的字（例如檔案的路徑）變成灰底的一條，旁邊有「📋 複製」，藥師按一下就複製好、直接去貼上（網頁、LINE 都有）。放好的點一下可以改字或拿掉", a: ["cp"] },
    { id: "clear", h: "清除格式", tip: "把選到的字的粗體、顏色、大小…全部拿掉", a: ["clear"] }
  ] },
  { g: "整行", items: [
    { id: "p", h: "文字", tip: "一般文字", a: ["kind", "p"] },
    { id: "h1", h: "標題1", tip: "標題 1（最大）。再按一次＝變回文字", a: ["kind", "h1"] },
    { id: "h2", h: "標題2", tip: "標題 2。再按一次＝變回文字", a: ["kind", "h2"] },
    { id: "h3", h: "標題3", tip: "標題 3。再按一次＝變回文字", a: ["kind", "h3"] },
    { id: "h4", h: "標題4", tip: "標題 4（最小）。再按一次＝變回文字", a: ["kind", "h4"] },
    { id: "ul", h: "• 項目符號", tip: "項目符號（Enter 會自動接下一個；用上一次在 ▾ 選的符號）。再按一次＝取消", a: ["list", "ul"] },
    { id: "ul-pick", h: "▾", tip: "選項目符號的樣子：• ◦ ▪ ◆ ➤ ✓ ★ ※ 🔹 🔸 📌 ❗ ✅ 👉（第 39 批）", pop: "ul" },
    { id: "ol", h: "1. 編號", tip: "編號（Enter 會自動接下一個號碼；用上一次在 ▾ 選的樣式）。再按一次＝取消", a: ["list", "ol"] },
    { id: "ol-pick", h: "▾", tip: "選編號的樣式：1.　1、　（1）　①　一、　（一）　壹、　甲、　（甲）　A.　（A）　a.　（a）　I.　i.（第 39 批）", pop: "ol" },
    { id: "todo", h: "☐ 核對清單", tip: "核對清單：☐ 沒做、☑ 做了（讀的人在 LINE 上不能勾，只是看）。再按一次＝取消", a: ["list", "todo"] },
    { id: "q", h: "❝ 引用", tip: "引用（左邊一條線）。再按一次＝變回文字", a: ["kind", "q"] },
    { id: "box-info", h: "💡", tip: "標註：提示（藍）。連續好幾行會合成一個框，一行一列、中間一條線（LINE、網頁一樣）。再按一次＝變回文字", a: ["kind", "box", "info"] },
    { id: "box-warn", h: "⚠️", tip: "標註：注意（黃）。連續好幾行會合成一個框，一行一列、中間一條線（LINE、網頁一樣）。再按一次＝變回文字", a: ["kind", "box", "warn"] },
    { id: "box-bad", h: "⛔", tip: "標註：警告（紅）。連續好幾行會合成一個框，一行一列、中間一條線（LINE、網頁一樣）。再按一次＝變回文字", a: ["kind", "box", "bad"] },
    { id: "box-ok", h: "✅", tip: "標註：完成（綠）。連續好幾行會合成一個框，一行一列、中間一條線（LINE、網頁一樣）。再按一次＝變回文字", a: ["kind", "box", "ok"] },
    { id: "box-pick", h: "🎨▾", tip: "標註框：選顏色（藍、黃、紅、綠、紫、灰）和符號（也可以不要符號）。游標在框裡＝改整個框（第 39 批）", pop: "box" },
    { id: "hr", h: "— 分隔線", tip: "在這一行後面放一條分隔線", a: ["line", "hr"] },
    { id: "go", h: "🔗 連結（標題／整章）", tip: "在這一行後面放一個連結，連到手冊裡另一個標題或整章（LINE 上是一個可以點的按鈕列；對方那一頁也會自動連回來）", a: ["line", "go"] },
    { id: "img", h: "🖼 圖片", tip: "在這一行後面放一張圖（跟文字放在同一塊；縮排跟這一行一樣，⇤ ⇥ 可以調）。也可以把圖拖進來，或複製後按 Ctrl+V 貼上", a: ["img"] },
    { id: "indent", h: "⇥", tip: "縮排（Tab）", a: ["indent", 1] },
    { id: "outdent", h: "⇤", tip: "取消縮排（Shift+Tab）", a: ["indent", -1] }
  ] },
  { g: "其他", items: [
    { id: "copy", h: "📋 複製", tip: "複製選起來的字（格式、文字裡的圖、表格都帶著）：到別的地方（別的標題也可以）點一下，按「📌 貼上」", a: ["copy"] },
    { id: "paste", h: "📌 貼上", tip: "把「📋 複製」的字貼在游標的位置（格式、圖、表格都帶著）", a: ["paste"] },
    { id: "emoji", h: "☺ 表情 ▾", tip: "放一個表情符號", pop: "emoji" },
    { id: "undo", h: "↶", tip: "復原（Ctrl+Z）", a: ["undo"] },
    { id: "redo", h: "↷", tip: "重做（Ctrl+Y）", a: ["redo"] },
    { id: "raw", h: "&lt;/&gt; 標記", tip: "看／改原始標記（LINE 裡改字看到的就是這個）", a: ["raw"] }
  ] }
];
function rteClosePop() { if (RTE.pop) { RTE.pop.el.remove(); RTE.pop = null; } }
function rteReopenBox(anchor) { rteClosePop(); setTimeout(function () { rteOpenPop(anchor, "box"); }, 0); }
function rteReopenPop(anchor, kind) { rteClosePop(); setTimeout(function () { rteOpenPop(anchor, kind); }, 0); }   // 第 41 批：選了樣子：選單重畫（亮起現在選的），不關   // 第 39 批：選了顏色／符號：選單重畫（亮起現在選的），不關
function rteDo(a, arg2, arg3) {
  var c = RTE.cur; if (!c) { toast("先點一下要改的那一段文字"); return; }
  var f = c.cmd[a];
  if (f) f(arg2, arg3);
}
function rteExec(a) {
  var name = a[0];
  if (name === "inline" || name === "kind" || name === "list" || name === "line" || name === "indent") rteDo(name, a[1], a[2]);
  else rteDo(name);
}
function rteOpenPop(anchor, kind) {
  var same = RTE.pop && RTE.pop.anchor === anchor; rteClosePop(); if (same) return;
  if (!RTE.cur) { toast("先點一下要改的那一段文字"); return; }
  var pop = h("div", { class: "rtpop rtpop-" + kind });
  pop.addEventListener("mousedown", function (e) { e.preventDefault(); });   // 點彈出的選單，文字框不會失去焦點（選的字才不會不見）
  if (kind === "color") {
    pop.appendChild(h("div", { class: "rtpop-t" }, ["文字顏色（先選取要改的字）"]));
    var grid = h("div", { class: "rtsw" });
    YZ_RT_COLOR_ORDER.forEach(function (c) {
      grid.appendChild(h("button", { type: "button", class: "rtsw-b", title: YZ_RT_COLOR_LABEL[c], "data-c": c, onclick: function () { RTE.lastColor = c; rteDo("inline", "c", c); rteClosePop(); } }, [h("span", { style: "color:" + YZ_RT_COLORS[c] }, ["A"]), h("small", {}, [YZ_RT_COLOR_LABEL[c]])]));
    });
    grid.appendChild(h("button", { type: "button", class: "rtsw-b", title: "拿掉顏色，變回預設的黑色", "data-c": "", onclick: function () { rteDo("inline", "c", null); rteClosePop(); } }, [h("span", {}, ["A"]), h("small", {}, ["預設"])]));
    pop.appendChild(grid);
    pop.appendChild(h("div", { class: "hint", style: "max-width:270px" }, ["顏色固定 9 種，白底上都看得清楚；LINE 和網頁顯示一樣。"]));
  } else if (kind === "mark") {   // 第 30 批：螢光筆
    pop.appendChild(h("div", { class: "rtpop-t" }, ["螢光筆（先選取要畫的字）"]));
    var mg = h("div", { class: "rtsw rtmk" });
    YZ_RT_MARK_ORDER.forEach(function (c) {
      mg.appendChild(h("button", { type: "button", class: "rtsw-b", title: YZ_RT_MARKS[c].label + "色螢光", "data-m": c, onclick: function () { rteDo("mark", c); rteClosePop(); } }, [h("span", { class: "rtmk-s", style: "background:" + YZ_RT_MARKS[c].bg }, ["字"]), h("small", {}, [YZ_RT_MARKS[c].label])]));
    });
    mg.appendChild(h("button", { type: "button", class: "rtsw-b", title: "拿掉螢光筆", "data-m": "", onclick: function () { rteDo("inline", "m", null); rteClosePop(); } }, [h("span", { class: "rtmk-s" }, ["字"]), h("small", {}, ["拿掉"])]));
    pop.appendChild(mg);
    pop.appendChild(h("div", { class: "hint", style: "max-width:290px" }, ["網頁、編輯器：螢光底色。LINE 不能幫一段字加底色：整行都畫同一色＝那一行有底色；只畫一部分＝同色系的粗體字。快捷鍵 Ctrl+Shift+H（Mac：⌘+Shift+H）。"]));
  } else if (kind === "frame") {   // 第 41 批：文字框（像 Word 的字元框線）：樣子＋顏色
    var stf = RTE.cur && RTE.cur.state ? RTE.cur.state() : null, nowX = stf && stf.x ? _yzRtBox_(stf.x) : null, lastX = _yzRtBox_(RTE.lastFrame) || _yzRtBox_("solid");
    var useSt = nowX ? nowX.st : lastX.st, useC = nowX ? nowX.c : lastX.c;
    var frApply = function (st, c) { rteDo("frame", st + (c ? "-" + c : "")); rteReopenPop(anchor, "frame"); };
    pop.appendChild(h("div", { class: "rtpop-t" }, ["文字框的樣子（先選取要框起來的字）"]));
    var fg = h("div", { class: "rtfr" });
    YZ_RT_BOX_ORDER.forEach(function (k) {
      var on = !!nowX && nowX.st === k;
      fg.appendChild(h("button", { type: "button", class: "rtfr-b" + (on ? " on" : ""), "data-x": k, title: "文字框：" + YZ_RT_BOX[k].label, "aria-pressed": on ? "true" : "false", onclick: function () { frApply(k, useC); } }, [h("span", { class: "rtfr-s", style: _yzRtBoxCss_(k) }, ["確認"]), h("small", {}, [YZ_RT_BOX[k].label])]));
    });
    pop.appendChild(fg);
    pop.appendChild(h("div", { class: "rtpop-t" }, ["框的顏色"]));
    var fc = h("div", { class: "rtsw rtfrc" });
    [""].concat(YZ_RT_COLOR_ORDER).forEach(function (c) {
      var on = !!nowX && nowX.c === c, nm = c ? YZ_RT_COLOR_LABEL[c] : "跟字一樣";
      fc.appendChild(h("button", { type: "button", class: "rtsw-b" + (on ? " on" : ""), "data-fc": c, title: "框的顏色：" + nm, onclick: function () { frApply(useSt, c); } }, [h("span", { class: "rtfr-sw", style: c ? "border-color:" + YZ_RT_COLORS[c] : "" }, [""]), h("small", {}, [nm])]));
    });
    pop.appendChild(fc);
    pop.appendChild(h("div", { class: "rtfr-row" }, [h("button", { type: "button", class: "btn sm rtfr-off", onclick: function () { rteDo("frame", ""); rteClosePop(); } }, ["拿掉文字框"])]));
    pop.appendChild(h("div", { class: "hint", style: "max-width:310px" }, ["像 Word 的「字元框線」：框裡的字照樣可以粗體、變色、改大小。LINE 不能畫框：前後會加［］（雙線、粗線用【】）。Word 匯出＝Word 的字元框線。"]));
  } else if (kind === "size") {   // 第 40 批：像 Word 的字型大小清單（點；內文 12）
    var st1 = RTE.cur && RTE.cur.state ? RTE.cur.state() : null, now1 = st1 && st1.z !== null ? rtePtTxt(rtePtOf(st1.z)) : "";
    pop.appendChild(h("div", { class: "rtpop-t" }, ["字型大小（點）"]));
    var sl = h("div", { class: "rtszl", role: "listbox", "aria-label": "字型大小" });
    YZ_RT_PT.forEach(function (pt) {
      var t = rtePtTxt(pt);
      sl.appendChild(h("button", { type: "button", role: "option", class: "rtszl-b" + (t === now1 ? " on" : "") + (pt === 12 ? " base" : ""), "data-pt": t, "aria-selected": t === now1 ? "true" : "false", onclick: function () { rteDo("size", pt); rteClosePop(); rteBarSync(true); } }, [t, pt === 12 ? h("small", {}, ["內文"]) : null]));
    });
    pop.appendChild(sl);
    pop.appendChild(h("div", { class: "hint", style: "max-width:230px" }, ["也可以在框裡打數字（6～96，可以有 .5）按 Enter。A▲ A▼＝大一級、小一級（Ctrl+Shift+> ／ <）。LINE、網頁、Word 匯出都照這個大小。"]));
    setTimeout(function () { var on = sl.querySelector(".on"); if (on) on.scrollIntoView({ block: "center" }); }, 0);
  } else if (kind === "ul") {   // 第 39 批：項目符號的樣子
    pop.appendChild(h("div", { class: "rtpop-t" }, ["項目符號的樣子（套到選到的那幾行）"]));
    var ug = h("div", { class: "rtem rtul" });
    YZ_RT_UL_MARKS.forEach(function (m) { ug.appendChild(h("button", { type: "button", class: "rtem-b" + (m === RTE.lastUl ? " on" : ""), title: "項目符號：" + m, "data-ul": m, onclick: function () { rteKeepList("ul", m); rteDo("list", "ul", m); rteClosePop(); } }, [m])); });
    pop.appendChild(ug);
    pop.appendChild(h("div", { class: "hint", style: "max-width:300px" }, ["選了以後，按「• 項目符號」就用這一個。彩色的符號在不同手機上長得會有一點不一樣。"]));
  } else if (kind === "ol") {   // 第 39 批：編號的樣式
    pop.appendChild(h("div", { class: "rtpop-t" }, ["編號的樣式（套到選到的那幾行；上一行是同一種就接下去）"]));
    var og = h("div", { class: "rtol" });
    YZ_RT_OL_STYLES.forEach(function (x) { og.appendChild(h("button", { type: "button", class: "rtol-b" + (x[0] === RTE.lastOl ? " on" : ""), title: "編號：" + x[1], "data-ol": x[0], onclick: function () { rteKeepList("ol", x[0]); rteDo("list", "ol", x[0]); rteClosePop(); } }, [x[1]])); });
    pop.appendChild(og);
    pop.appendChild(h("div", { class: "hint", style: "max-width:320px" }, ["公文常用的順序：一、→（一）→ 1. →（1）→ 甲、→（甲）→ A. →（A）→ a. →（a）。按 Enter 會自動接下一個號碼。"]));
  } else if (kind === "box") {   // 第 39 批：標註框（顏色＋符號；選單不關，可以接著選）
    var cur0 = RTE.cur && RTE.cur.state ? RTE.cur.state() : null, T0 = cur0 && cur0.kind === "box" ? _yzRtTone_(cur0.tone) : null;
    pop.appendChild(h("div", { class: "rtpop-t" }, ["標註框：先選顏色，再選符號" + (T0 ? "（改游標所在的整個框）" : "")]));
    var bc = h("div", { class: "rtbox-c" });
    YZ_RT_TONE_ORDER.forEach(function (c) {
      var T = YZ_RT_TONES[c];
      bc.appendChild(h("button", { type: "button", class: "rtbox-cb" + (T0 && T0.c === c ? " on" : ""), "data-bc": c, title: T.color + "色框（" + T.label + "）", style: "background:" + T.bg + ";border-color:" + T.bd + ";color:" + T.ink, onclick: function () { rteDo("box", c, null); rteReopenBox(anchor); } }, [T.color]));
    });
    pop.appendChild(bc);
    var bi = h("div", { class: "rtem rtbox-i" });
    YZ_RT_ICON_ORDER.forEach(function (k) {
      bi.appendChild(h("button", { type: "button", class: "rtem-b" + (T0 && T0.ic === k ? " on" : ""), "data-bi": k, title: k === "none" ? "不要符號" : "符號：" + YZ_RT_ICONS[k], onclick: function () { rteDo("box", null, k); rteReopenBox(anchor); } }, [k === "none" ? h("small", {}, ["不要"]) : YZ_RT_ICONS[k]]));
    });
    pop.appendChild(bi);
    pop.appendChild(h("div", { class: "hint", style: "max-width:320px" }, ["LINE、網頁、匯出的 Word 都照這個顏色和符號。點選單外面就關掉。"]));
  } else if (kind === "emoji") {
    pop.appendChild(h("div", { class: "rtpop-t" }, ["表情符號（放在游標的位置）"]));
    var eg = h("div", { class: "rtem" });
    RTE_EMOJI.forEach(function (em) { eg.appendChild(h("button", { type: "button", class: "rtem-b", onclick: function () { rteDo("text", em); rteClosePop(); } }, [em])); });
    pop.appendChild(eg);
  }
  document.body.appendChild(pop);
  var r = anchor.getBoundingClientRect();
  pop.style.top = (r.bottom + 4) + "px";
  pop.style.left = Math.max(8, Math.min(r.left, innerWidth - pop.offsetWidth - 8)) + "px";
  RTE.pop = { el: pop, anchor: anchor };
}
function rteBuildBar() {
  var bar = h("div", { class: "fmtbar", role: "toolbar", "aria-label": "文字格式" }), btns = {};
  RTE_BAR.forEach(function (g, gi) {
    var grp = h("div", { class: "fg" }, [h("span", { class: "tblabel" }, [g.g])]);
    g.items.forEach(function (it) {
      if (it.fsz) { rteSizeCombo(grp, btns); return; }
      var b = h("button", { type: "button", class: "fb fb-" + it.id, title: it.tip, "data-id": it.id, "aria-label": it.tip.replace(/[（(：。].*$/, "") || it.id });
      b.innerHTML = it.h;
      b.addEventListener("mousedown", function (e) { e.preventDefault(); });   // 按按鍵不會讓文字框失去焦點（選的字才不會不見）
      b.addEventListener("click", function () { if (it.pop) rteOpenPop(b, it.pop); else { rteClosePop(); rteExec(it.a); } });
      btns[it.id] = b; grp.appendChild(b);
    });
    bar.appendChild(grp);
    if (gi < RTE_BAR.length - 1) bar.appendChild(h("span", { class: "vsep" }));
  });
  bar.appendChild(h("span", { class: "fbstat muted", id: "fbstat" }));
  RTE.bar = { el: bar, btns: btns };
  rteBarSync();
  return bar;
}
// 第 40 批：字型大小（像 Word）：[ 12 ▾ ] 可以選、也可以打數字按 Enter；A▲ A▼＝大一級、小一級
function rteSizeCombo(grp, btns) {
  var keep = function (b) { b.addEventListener("mousedown", function (e) { e.preventDefault(); }); return b; };   // 按了文字框不會失去焦點（選的字才不會不見）
  var inp = h("input", { class: "fsz-in", type: "text", inputmode: "decimal", maxlength: "4", autocomplete: "off", spellcheck: "false", "aria-label": "字型大小（點）", title: "字型大小（點；內文 12）：選取字以後，打一個數字按 Enter（6～96，可以有 .5）" });
  var dd = keep(h("button", { type: "button", class: "fb fb-szdd", title: "選字型大小（8～72，跟 Word 一樣）", "aria-label": "選字型大小", "data-id": "size" }, ["▾"]));
  var up = keep(h("button", { type: "button", class: "fb fb-szup", title: "放大字型（Ctrl+Shift+>）：選到的字大一級", "aria-label": "放大字型", "data-id": "szup" }));
  var dn = keep(h("button", { type: "button", class: "fb fb-szdn", title: "縮小字型（Ctrl+Shift+<）：選到的字小一級", "aria-label": "縮小字型", "data-id": "szdn" }));
  up.innerHTML = 'A<sup>▲</sup>'; dn.innerHTML = '<span>A</span><sup>▼</sup>';
  var apply = function () {
    var v = String(inp.value || "").replace(/[^\d.]/g, ""), pt = parseFloat(v);
    if (!(pt >= YZ_RT_PT_MIN && pt <= YZ_RT_PT_MAX)) { toast("字型大小請打 " + YZ_RT_PT_MIN + "～" + YZ_RT_PT_MAX + " 的數字（可以有 .5，例如 10.5）"); rteBarSync(true); return; }
    rteDo("size", Math.round(pt * 2) / 2); rteBarSync(true);
  };
  inp.addEventListener("keydown", function (e) {
    if (e.isComposing || e.keyCode === 229) return;
    if (e.key === "Enter") { e.preventDefault(); apply(); }
    else if (e.key === "Escape") { e.preventDefault(); rteBarSync(true); if (RTE.cur && RTE.cur.focus) RTE.cur.focus(); }
    else if (e.key === "ArrowDown" && e.altKey) { e.preventDefault(); rteOpenPop(dd, "size"); }
  });
  inp.addEventListener("focus", function () { try { inp.select(); } catch (x) { /* 沒關係 */ } });
  inp.addEventListener("blur", function () {   // 離開這個框（沒有回到文字框、格式列）：格式列熄掉
    setTimeout(function () { var a = document.activeElement; if (RTE.cur && !(RTE.cur.owns && RTE.cur.owns(a)) && !(RTE.bar && RTE.bar.el.contains(a)) && !(RTE.pop && RTE.pop.el.contains(a))) { RTE.cur = null; rteBarSync(); } else rteBarSync(); }, 160);
  });
  dd.addEventListener("click", function () { rteOpenPop(dd, "size"); });
  up.addEventListener("click", function () { rteClosePop(); rteDo("size", "+"); });
  dn.addEventListener("click", function () { rteClosePop(); rteDo("size", "-"); });
  grp.appendChild(h("span", { class: "fsz", title: "字型大小（像 Word；內文 12）" }, [inp, dd]));
  grp.appendChild(up); grp.appendChild(dn);
  btns.size = dd; btns.szup = up; btns.szdn = dn; RTE.szIn = inp;
}
function rteBarSync() {
  if (!RTE.bar) return;
  var c = RTE.cur, st = c ? c.state() : null, raw = !!c && c.isRaw(), B = RTE.bar.btns;
  Object.keys(B).forEach(function (id) {
    var on = false, dis = !c;
    if (c && raw) dis = id !== "raw";
    if (st && !raw) {
      if (id === "b" || id === "i" || id === "u" || id === "s") on = !!st[id];
      else if (/^h[1-4]$/.test(id) || id === "q") on = st.kind === id;
      else if (id === "box-pick") on = st.kind === "box" && YZ_RT_TONE_ORDER.indexOf(st.tone) < 0;   // 第 39 批：框是自己選的顏色／符號
      else if (id === "ul-pick" || id === "ol-pick") on = false;
      else if (id.indexOf("box-") === 0) on = st.kind === "box" && st.tone === id.slice(4);
      else if (id === "ul" || id === "ol" || id === "todo") on = st.list === id;
      else if (id === "p") on = st.kind === "p" && !st.list;
      else if (id === "mark") on = !!st.m;   // 第 30 批：選到的字整段都是同一色螢光＝亮
      else if (id === "frame") on = !!st.x;   // 第 41 批：選到的字整段都在同一個文字框裡＝亮
      else if (id === "cp") on = !!st.cp;   // 第 32 批：選到的剛好是一條反灰可複製
    }
    if (c && c.lite && (id === "img" || id === "go" || id === "cp")) { dis = true; on = false; }   // 第 40 批：流程圖框裡的字：不能放圖、連結、反灰可複製
    if (id === "raw") { dis = !c; on = raw; }
    if (id === "undo" || id === "redo") { var hh = c ? c.hasHist() : { undo: false, redo: false }; dis = !c || raw || !hh[id]; }
    if (id === "paste") dis = !c || raw || !RTE.clip;   // 第 32 批：還沒複製東西：「📌 貼上」是灰的
    B[id].disabled = dis; B[id].classList.toggle("on", !!on && !dis); B[id].setAttribute("aria-pressed", on && !dis ? "true" : "false");
  });
  var si = RTE.szIn;   // 第 40 批：字型大小的框
  if (si) {
    si.disabled = !c || raw;
    if (document.activeElement !== si || arguments[0] === true) si.value = !c || raw || !st ? "" : st.z === null ? "" : rtePtTxt(rtePtOf(st.z));
  }
  var cb = B.color && B.color.querySelector(".fbcbar"); if (cb) cb.style.background = YZ_RT_COLORS[(st && st.c) || RTE.lastColor] || "#999";
  var mb = B.mark && B.mark.querySelector(".fbmbar"); if (mb) mb.style.background = (YZ_RT_MARKS[(st && st.m) || RTE.lastMark] || YZ_RT_MARKS.yellow).bg;   // 第 30 批：下面那條＝現在／上一次的螢光色
  var stat = document.getElementById("fbstat");
  if (stat) stat.textContent = c ? (raw ? "標記模式" : "小提示：選字再按上面的鍵｜點一下公式、反灰可複製可以修改｜Ctrl+Z 復原") : "← 先點一下要改的那一段文字，格式鍵才會亮";   // 第 31 批：這一行一直都在（以前點進文字框，這行字不見，下面整個往上跳一下，點的位置就偏了）
}
document.addEventListener("mousedown", function (e) { if (RTE.pop && !RTE.pop.el.contains(e.target) && !RTE.pop.anchor.contains(e.target)) rteClosePop(); });
document.addEventListener("keydown", function (e) { if (e.key === "Escape") rteClosePop(); });
document.addEventListener("selectionchange", function () { if (RTE.cur) rteBarSync(); });

/* ════════ shapelib.js ════════ */
/* ═══════════════ shapelib.js：圖一（目錄圖）的物品圖庫 ═══════════════
 * 第 34 批追加：換成新的圖一（v4）。舊的三張圖（v1～v3）的物品外框刪掉了，只留它們的預設按鍵位置（old）：
 *   換成新圖時，還在舊圖預設位置（沒動過）的按鍵，搬到新圖的位置；動過的不動。
 * 用比較準的方法（SAM，物品分割的模型）在開發的電腦上先把圖一裡每個按鍵該亮的物品切好，這裡只存外框的點（整張圖的 %）。
 * 編輯器按「儲存」時：目錄圖是這一張（比對 fp＝圖的指紋：縮成 17×8 格、左右比亮暗的 128 個 0/1，看不出圖的內容）→ 直接用這裡的物品；
 * 換了別張圖 → 照舊在框裡自動找（shFind）。ids＝預設的地點（p1…p11）優先用哪一個物品。
 * bx＝這張圖的預設按鍵位置（x、y、w、h、標籤在哪一邊）；add＝這張圖多的按鍵（還沒有就自動加，例如問卷）。不用手動改這個檔。 */
var SH_LIB = [{"fp":"4eac698112dbf0523288936e536270f2","ar":2.9766,"bx":{"p1":[74,17,25,26,"t"],"p2":[32,22,7,17,"t"],"p3":[42,27,8,14,"t"],"p4":[62,26,8,16,"t"],"p5":[48,40,16,24,"t"],"p6":[1,9,11,43,"t"],"p7":[31,56,12,12,"t"],"p8":[14,64,13,14,"t"],"p9":[42,65,8,16,"t"],"p10":[51,66,12,25,"t"],"p11":[23,79,12,21,"t"]},"objs":[{"id":"cabinet","nm":"文件資料櫃＋辦公桌（行政事宜）","r":[[73.6,17.5,73.5,34.5,77.9,34.7,78.4,38.7,83.5,41.4,85.7,33.7,87.5,39.1,91.3,41.5,91.1,47.2,92.1,48.3,92.4,53.5,85.1,49.2,86.0,53.4,85.6,60.9,87.8,63.1,88.1,66.0,91.2,67.1,91.1,60.5,97.1,62.9,98.2,67.3,99.0,64.5,98.9,79.0,89.8,76.6,88.5,74.0,89.7,70.2,87.7,70.6,87.5,68.0,84.0,64.0,81.7,51.3,77.2,51.0,76.5,52.7,76.5,70.7,77.9,75.9,79.9,75.8,79.7,57.2,81.8,58.6,83.5,68.6,87.2,76.2,87.3,99.9,100.0,99.9,100.0,70.3,99.3,69.7,100.0,58.0,97.2,58.3,93.4,53.4,93.7,43.2,95.3,35.8,100.0,43.7,98.8,41.4,98.7,16.6],[77.2,40.2,77.2,41.3,77.1,41.4,77.1,42.6,77.0,42.8,77.0,43.7,77.0,43.9,76.9,45.3,76.9,45.4,76.9,46.5,77.0,46.8,77.2,47.0,77.4,47.0,77.5,47.3,78.2,47.7,78.4,48.4,78.5,50.1,78.7,50.3,78.9,49.9,79.3,49.0,79.5,49.0,79.7,49.5,79.7,49.8,79.8,49.9,79.9,49.8,80.1,48.4,80.1,47.0,80.2,46.9,80.2,44.4,80.2,44.3,80.2,43.7,80.3,43.6,80.3,43.1,80.3,42.9,80.3,42.1,80.3,42.0,80.3,41.7,80.1,41.3,79.9,41.3,79.8,41.1,79.7,41.1,79.4,40.9,79.3,40.9,79.1,40.6,78.6,40.6,78.2,40.2,77.8,40.0,77.7,39.9,77.3,39.9],[71.6,35.8,71.6,36.2,71.5,36.3,71.5,38.0,71.5,38.1,71.5,41.3,71.6,41.5,72.2,41.4,72.3,41.7,72.5,41.7,72.7,41.3,72.8,41.3,73.2,40.6,73.4,40.4,73.5,40.0,73.5,39.8,73.6,39.6,73.5,37.1,73.6,37.0,73.6,36.0,73.6,35.9,73.6,35.6,73.5,35.5,73.1,35.5,73.1,35.6,72.1,35.6,72.1,35.5,71.7,35.5],[69.9,42.9,69.9,43.9,70.1,44.6,70.0,45.9,70.1,46.1,70.1,46.5,70.1,46.6,70.2,46.5,70.3,45.9,70.5,45.5,70.9,45.7,71.0,45.8,71.3,45.9,71.4,46.1,71.8,46.1,72.0,45.5,72.0,44.6,72.0,44.4,72.0,44.0,71.9,43.9,71.6,43.7,71.1,42.9,70.3,42.6,70.1,42.4]],"ids":["p1"],"c":8},{"id":"consult","nm":"藥師和病人（左邊窗口）","r":[[37.0,23.0,36.8,22.7,36.6,22.7,36.0,23.8,36.0,24.8,36.0,27.9,36.2,28.3,36.2,29.3,36.1,29.6,36.0,29.3,35.9,28.5,35.7,28.5,35.6,29.3,35.6,30.5,35.5,30.8,35.2,30.1,34.8,27.9,34.4,27.1,34.4,26.3,34.8,24.9,34.8,23.4,34.2,22.3,34.1,22.3,33.7,22.8,33.5,24.2,33.2,25.0,32.9,26.5,32.9,27.6,32.6,28.6,32.6,30.3,32.8,32.6,32.8,34.3,32.6,35.6,32.6,37.0,32.8,38.0,33.7,38.7,35.0,38.2,35.0,36.5,34.8,34.7,34.8,33.4,35.0,32.9,35.4,32.7,35.5,31.9,35.7,31.5,36.0,31.2,36.5,32.3,37.8,32.5,38.1,31.9,38.1,30.8,37.8,29.2,37.7,28.5,37.5,27.6,37.2,23.7]],"ids":["p2"],"c":2},{"id":"dispense","nm":"藥師和病人（中間窗口）","r":[[44.0,27.2,43.2,28.7,43.0,29.6,43.0,30.0,42.9,30.7,42.9,32.6,43.0,32.7,43.0,33.0,43.3,33.7,43.3,34.3,43.3,35.6,43.2,36.7,43.2,37.1,43.1,37.6,43.0,38.2,42.9,38.7,42.9,39.9,43.1,40.2,43.6,40.2,43.6,40.3,44.1,40.3,44.2,40.4,45.0,40.4,45.1,40.6,45.4,40.6,45.4,40.7,45.5,40.7,45.8,40.3,45.8,39.6,45.7,39.5,45.7,38.7,45.5,37.3,45.4,36.2,45.3,35.5,45.3,34.1,45.5,33.8,46.0,34.0,46.3,33.4,46.3,32.9,45.8,31.4,45.7,30.3,45.4,29.0,44.9,28.3,44.6,27.6,44.5,27.4],[47.7,27.1,47.5,28.1,47.4,28.6,47.4,30.8,47.5,31.5,47.5,32.9,47.7,33.1,47.9,33.1,47.9,33.3,48.3,33.3,48.6,33.0,48.9,33.0,49.0,32.9,49.0,32.6,49.1,32.5,49.1,30.8,49.0,30.7,49.0,30.3,48.8,28.1,48.6,27.5,48.2,27.0,47.8,27.0]],"ids":["p3"],"c":2},{"id":"er","nm":"藥師和病人（右邊窗口）","r":[[66.4,28.6,66.3,28.5,66.2,28.6,66.2,29.3,65.9,29.6,65.2,28.6,65.0,28.1,64.7,28.3,64.7,30.0,64.7,30.4,64.4,31.5,64.4,31.9,64.2,32.3,64.0,32.0,63.8,31.6,63.7,31.1,63.7,29.7,63.7,29.4,63.4,29.3,63.0,29.7,62.8,31.5,62.8,32.2,63.0,33.1,63.0,34.4,63.1,34.9,63.4,35.9,63.5,36.3,63.5,37.6,63.1,39.9,63.1,40.7,63.4,41.5,63.7,42.0,64.0,42.0,64.1,41.8,64.4,41.8,64.5,42.0,64.7,42.0,64.7,41.8,66.2,42.0,66.4,41.5,66.4,40.9,66.0,37.6,65.8,36.7,65.8,36.2,66.0,35.6,66.7,35.6,66.9,35.4,67.1,34.8,67.2,33.8,67.1,33.0,66.9,32.6,66.7,32.5,66.2,30.7,66.2,30.4,66.3,30.1,66.4,29.6],[67.0,27.6,66.7,28.7,66.7,29.6,66.8,29.8,67.1,29.8,67.2,29.6,67.4,29.6,67.5,29.8,67.7,30.7,67.7,31.8,67.8,32.2,68.0,32.5,68.1,33.0,68.1,34.4,68.3,34.7,69.0,34.7,69.2,34.4,69.3,34.1,69.3,31.2,69.2,31.1,69.2,30.1,69.0,28.5,68.9,28.1,68.3,27.4,68.1,26.8,67.8,27.0,67.4,27.6,67.1,27.6,67.1,27.5]],"ids":["p4"],"c":2},{"id":"review","nm":"電腦＋條碼掃描器＋兩盒處方（覆核）","r":[[48.5,51.4,48.5,52.8,48.9,54.1,49.0,56.1,49.4,56.1,49.5,56.9,49.4,57.8,48.8,58.9,48.8,60.0,49.0,60.7,50.4,61.1,51.2,60.0,51.2,58.2,50.9,57.1,50.6,56.8,50.4,53.0,50.6,52.4,51.1,53.2,52.3,53.6,52.6,54.3,52.5,55.7,51.7,55.8,51.6,56.4,52.9,57.1,53.7,54.7,54.2,54.6,53.9,56.1,53.3,56.5,53.2,59.1,52.7,61.1,52.7,65.3,53.0,66.0,53.9,65.6,56.1,66.4,56.7,66.2,60.4,68.4,63.6,62.2,63.6,55.7,63.4,55.0,62.5,55.2,61.4,52.8,60.0,52.3,58.0,52.7,56.4,51.9,56.9,43.5,56.7,41.7,50.6,40.0,50.4,41.8,50.1,49.1]],"ids":["p5"],"c":4},{"id":"liquid","nm":"藥品櫃＋冰箱（水藥）","r":[[0.0,8.1,0.0,53.0,0.5,52.8,1.2,52.0,1.8,52.0,2.2,51.7,2.5,51.7,2.9,50.9,3.2,51.3,3.4,51.3,3.7,50.9,3.9,50.2,4.5,49.4,4.9,49.4,5.1,49.1,5.5,49.2,7.3,49.1,8.4,48.4,8.7,48.4,9.1,47.9,9.3,47.3,9.5,45.3,9.4,43.7,9.5,41.0,9.4,37.6,9.3,36.7,9.4,32.9,9.3,32.2,9.3,30.7,9.4,29.8,9.3,28.3,9.3,23.1,9.2,23.0,9.3,21.2,9.3,18.7,9.2,18.3,9.2,16.6,9.1,16.2,8.7,16.0,8.6,15.5,8.5,11.1,8.4,10.9,7.7,10.7,7.3,10.3,6.3,10.0,6.1,10.3,5.9,10.2,4.8,10.3,4.5,9.9,3.4,9.4,2.2,9.6,1.9,9.4,1.0,9.1,0.5,8.3],[10.9,21.2,10.7,21.5,10.7,22.3,10.7,22.4,10.7,22.7,10.7,22.8,10.7,25.2,10.7,25.3,10.7,26.4,10.7,26.5,10.7,28.1,10.7,28.2,10.7,29.6,10.7,29.7,10.7,36.5,10.7,36.6,10.7,37.6,10.8,37.7,10.8,38.1,10.7,38.2,10.7,40.2,10.6,40.7,10.6,41.5,10.6,41.7,10.6,43.9,10.8,44.6,11.1,44.8,11.2,44.7,11.3,44.7,11.6,44.4,12.3,44.3,12.6,44.0,12.7,43.6,12.7,38.5,12.6,38.4,12.6,32.7,12.7,32.6,12.7,31.6,12.6,31.5,12.6,22.4,12.5,21.9,12.3,21.6,12.2,21.6,12.1,21.5,11.9,21.5,11.9,21.3]],"ids":["p6"],"c":2},{"id":"tray","nm":"藥盤","r":[[31.2,63.0,31.4,63.7,33.2,64.2,33.8,64.9,35.6,65.6,36.2,66.3,37.2,66.4,37.7,67.0,38.5,67.1,39.0,67.5,39.4,67.5,40.6,65.7,41.5,64.2,41.7,64.0,41.9,63.3,42.5,62.0,42.5,61.2,42.7,60.7,43.0,60.8,43.1,60.7,43.0,59.6,42.8,58.7,42.5,58.5,42.1,57.6,40.9,57.6,40.5,57.2,39.8,56.9,39.3,56.4,38.4,56.3,37.9,56.0,36.6,56.1,35.1,55.8,34.6,56.4,33.7,56.4,33.1,57.6,32.6,58.5,32.1,58.5,31.6,59.4,31.3,59.6,31.1,60.1]],"ids":["p7"],"c":1},{"id":"book","nm":"法規書（整本）","r":[[14.5,72.2,14.5,73.7,14.9,75.4,15.7,76.5,17.3,79.6,17.7,80.1,18.3,81.3,18.7,81.8,18.9,82.5,19.2,82.8,20.3,85.0,20.7,85.4,21.9,84.5,22.3,83.8,23.0,83.1,24.2,81.3,24.8,80.9,25.1,80.2,25.5,80.1,26.2,78.8,26.7,78.5,27.4,77.4,27.4,76.8,27.3,75.8,27.3,74.7,27.3,73.7,27.5,73.0,27.5,72.4,27.4,72.1,27.1,71.8,26.5,70.8,26.2,70.6,25.6,69.6,25.1,69.3,24.6,68.5,24.1,68.1,23.7,67.4,22.9,66.6,22.4,65.6,21.6,64.9,21.3,64.4,19.5,64.8,18.9,65.6,18.4,65.6,17.7,66.6,17.4,66.7,17.0,67.5,16.5,67.5,16.1,68.4,15.9,68.5,15.0,69.5,14.6,70.7]],"ids":["p8"],"c":1},{"id":"clip","nm":"「？」夾板（疑義處方）","r":[[42.4,74.8,42.4,75.1,42.7,75.5,43.1,75.7,43.6,76.2,44.4,76.6,44.9,77.3,45.2,77.4,45.4,77.7,45.9,77.9,46.5,78.5,47.3,79.0,47.7,79.5,48.3,79.9,48.6,80.3,49.0,80.5,49.3,80.1,49.4,79.0,50.2,75.4,50.4,74.4,50.6,73.5,50.8,72.1,51.1,71.1,51.3,69.6,51.6,68.4,51.6,67.7,51.3,67.3,51.1,67.3,51.0,67.1,50.3,66.9,50.2,66.7,49.8,66.7,49.7,66.4,49.3,66.3,48.8,65.7,47.9,65.7,47.4,65.3,46.8,65.3,46.7,65.5,46.4,65.2,45.8,65.1,45.6,65.6,45.4,66.7,45.0,68.1,44.8,68.4,44.7,68.9,44.5,69.5,44.0,70.2,43.8,71.0,43.5,71.3,43.3,71.9,43.2,72.1,42.5,74.0]],"ids":["p9"],"c":1},{"id":"binder","nm":"規則本（整本）","r":[[51.0,77.7,50.9,80.3,51.0,81.7,51.1,82.1,51.8,82.9,52.5,83.5,53.3,83.8,55.7,86.0,56.0,86.0,56.7,86.4,57.2,87.1,59.8,88.6,60.4,89.3,61.4,90.0,62.1,90.8,62.6,90.8,62.8,90.2,62.8,86.1,62.9,84.7,62.9,82.7,62.6,73.9,62.6,71.3,62.6,70.3,62.3,69.6,60.9,69.2,60.7,68.9,60.3,68.9,59.3,68.2,58.8,68.1,58.3,67.5,57.6,67.5,56.4,66.7,55.8,66.7,54.7,66.0,53.7,65.9,53.5,66.2,53.2,67.1,53.0,68.8,52.5,70.6,51.8,73.9,51.6,74.7,51.3,76.5]],"ids":["p10"],"c":1},{"id":"quiz","nm":"問卷夾板","r":[[22.9,92.6,22.9,93.7,24.4,95.2,24.9,95.3,26.0,96.6,26.6,96.8,28.7,99.0,29.4,99.3,29.7,99.9,31.1,99.9,31.7,97.4,31.8,96.4,32.1,95.5,32.2,95.3,32.3,95.5,32.3,95.9,32.6,96.7,33.0,96.1,33.2,95.0,33.5,94.1,34.9,89.0,35.2,87.6,35.3,86.4,35.1,85.8,34.9,85.8,34.7,86.1,34.0,88.2,33.9,89.4,33.6,90.0,33.5,89.7,33.5,89.4,33.6,88.3,33.6,87.9,33.8,87.2,33.9,86.4,34.3,85.0,34.6,83.4,34.6,82.8,34.4,82.1,33.9,81.4,33.0,81.3,32.6,80.5,32.1,80.5,31.6,80.2,31.1,79.5,30.3,79.5,29.4,79.0,29.0,79.1,28.7,78.5,27.9,78.1,27.5,78.7]],"ids":["p11"],"c":2},{"id":"shelves","nm":"藥品櫃（左邊兩座）","r":[[0.0,8.1,0.0,53.0,0.5,52.8,1.2,52.0,1.8,52.0,2.2,51.7,2.5,51.7,2.9,50.9,3.2,51.3,3.4,51.3,3.7,50.9,3.9,50.2,4.5,49.4,4.9,49.4,5.1,49.1,5.5,49.2,7.3,49.1,8.4,48.4,8.7,48.4,9.1,47.9,9.3,47.3,9.5,45.3,9.4,43.7,9.5,41.0,9.4,37.6,9.3,36.7,9.4,32.9,9.3,32.2,9.3,30.7,9.4,29.8,9.3,28.3,9.3,23.1,9.2,23.0,9.3,21.2,9.3,18.7,9.2,18.3,9.2,16.6,9.1,16.2,8.7,16.0,8.6,15.5,8.5,11.1,8.4,10.9,7.7,10.7,7.3,10.3,6.3,10.0,6.1,10.3,5.9,10.2,4.8,10.3,4.5,9.9,3.4,9.4,2.2,9.6,1.9,9.4,1.0,9.1,0.5,8.3]],"c":1},{"id":"fridge","nm":"冰箱","r":[[10.9,21.2,10.7,21.5,10.7,22.3,10.7,22.4,10.7,22.7,10.7,22.8,10.7,25.2,10.7,25.3,10.7,26.4,10.7,26.5,10.7,28.1,10.7,28.2,10.7,29.6,10.7,29.7,10.7,36.5,10.7,36.6,10.7,37.6,10.8,37.7,10.8,38.1,10.7,38.2,10.7,40.2,10.6,40.7,10.6,41.5,10.6,41.7,10.6,43.9,10.8,44.6,11.1,44.8,11.2,44.7,11.3,44.7,11.6,44.4,12.3,44.3,12.6,44.0,12.7,43.6,12.7,38.5,12.6,38.4,12.6,32.7,12.7,32.6,12.7,31.6,12.6,31.5,12.6,22.4,12.5,21.9,12.3,21.6,12.2,21.6,12.1,21.5,11.9,21.5,11.9,21.3]],"c":1},{"id":"bottles","nm":"藥水瓶（水槽上）","r":[[17.1,55.3,16.8,54.6,16.5,54.6,16.2,55.0,15.7,54.9,15.5,55.2,15.2,56.1,14.9,55.4,14.6,55.2,14.2,56.1,14.1,56.7,14.0,56.9,13.5,56.4,13.1,56.4,12.9,56.9,12.8,57.6,12.8,58.7,12.7,59.6,12.7,60.4,12.6,60.7,12.4,60.5,11.9,60.5,11.7,61.1,11.6,61.6,11.6,64.8,11.6,65.2,11.8,65.6,12.2,65.6,12.5,65.3,12.6,65.1,12.7,64.5,12.8,64.2,13.1,64.8,13.7,64.6,13.9,64.4,14.0,64.0,14.1,63.5,14.2,63.3,14.6,63.7,14.9,63.7,15.2,63.4,15.4,62.7,15.7,63.0,16.0,62.9,16.4,62.2,16.9,62.3,17.2,62.0,17.3,61.8,17.3,59.8,17.3,59.7,17.3,57.1],[21.2,57.1,21.0,56.8,20.8,56.8,20.7,56.7,20.4,56.7,20.2,56.9,20.1,57.4,20.1,57.6,20.0,57.9,19.7,57.5,19.6,57.5,19.5,57.8,19.4,57.8,19.2,58.0,19.1,58.5,19.0,58.7,19.0,59.4,19.0,59.6,19.0,60.1,19.0,60.2,19.0,62.4,19.1,63.0,19.1,63.5,19.2,64.0,19.3,64.1,19.8,64.1,20.0,63.8,20.1,63.5,20.1,62.0,20.1,61.9,20.1,61.3,20.1,61.1,20.3,60.8,20.6,61.5,20.7,62.0,20.6,63.5,20.8,64.0,21.2,64.0,21.3,63.5,21.3,60.9,21.3,60.8,21.3,60.0,21.3,59.8,21.3,57.4]],"c":7},{"id":"beaker","nm":"量杯","r":[[22.3,55.6,22.1,56.0,22.1,56.8,22.0,56.9,22.0,58.2,22.1,58.3,22.1,60.7,22.0,60.8,22.0,64.8,22.3,65.5,22.6,65.6,22.7,66.0,23.0,66.4,23.1,66.4,23.5,67.1,23.7,67.1,23.8,67.0,23.8,66.7,23.8,66.4,23.8,66.3,23.8,65.3,23.9,65.2,23.9,63.5,23.9,63.4,23.9,60.2,24.0,59.3,24.0,56.5,24.0,56.3,23.9,56.1,23.7,56.1,23.3,55.6,23.2,55.6,23.1,55.4,22.6,55.4,22.5,55.6]],"c":1},{"id":"monitor","nm":"電腦螢幕（覆核）","r":[[50.5,40.2,50.4,41.8,50.3,44.2,50.2,45.5,50.1,48.7,50.6,49.9,50.7,50.5,50.7,52.4,50.9,53.0,51.3,53.4,51.9,53.4,52.3,53.6,52.6,54.6,52.6,55.3,52.5,55.7,52.2,56.0,51.7,55.8,51.6,56.1,51.6,56.4,51.8,56.7,52.9,57.1,53.1,56.7,53.2,55.8,53.3,55.4,54.6,53.2,55.0,52.0,56.2,51.9,56.4,51.6,56.6,51.2,56.7,49.0,56.7,46.1,56.9,43.5,56.8,41.8,56.4,41.7,56.2,41.4,53.9,41.1,53.5,40.9,51.4,40.4,50.7,40.0]],"c":1},{"id":"scanner","nm":"條碼掃描器","r":[[50.0,49.2,49.7,49.7,49.4,50.6,49.0,50.3,48.7,50.9,48.5,51.4,48.5,52.8,48.6,53.1,48.9,54.1,48.9,55.8,49.0,56.1,49.1,56.3,49.3,56.0,49.4,56.4,49.4,56.8,49.5,56.9,49.5,57.5,49.4,57.8,49.2,58.0,49.0,58.0,48.9,58.3,48.8,59.4,48.8,60.0,48.8,60.2,49.0,60.7,49.6,60.8,49.7,60.9,49.9,60.9,50.0,61.1,50.4,61.1,50.8,60.4,50.9,60.4,51.1,60.1,51.2,59.7,51.2,58.6,51.2,58.5,51.2,58.2,51.1,57.8,51.0,57.6,50.9,57.1,50.8,56.9,50.7,57.1,50.6,56.8,50.6,56.4,50.5,55.7,50.5,55.2,50.4,55.0,50.4,54.5,50.4,54.3,50.4,53.0,50.5,52.5,50.6,52.4,50.7,51.9,50.7,50.6,50.6,49.8,50.2,49.2]],"c":1},{"id":"rxbox","nm":"兩盒處方","r":[[52.7,61.1,52.7,65.3,53.0,66.0,53.3,66.2,53.7,65.6,53.9,65.6,54.0,65.7,54.8,65.7,56.1,66.4,56.5,66.4,56.6,66.2,56.7,66.2,57.0,66.6,57.4,66.7,57.9,67.3,58.9,67.5,59.6,68.1,60.4,68.4,61.4,66.7,62.0,65.3,62.3,64.9,62.7,63.8,63.5,62.6,63.6,61.5,63.5,58.5,63.6,55.7,63.5,55.3,63.4,55.0,63.3,55.0,63.0,55.4,62.5,55.2,62.3,54.7,62.3,54.5,62.2,54.1,61.4,52.8,60.6,52.7,60.0,52.3,59.5,52.3,59.2,52.5,58.8,52.5,58.4,52.3,58.0,52.7,57.9,52.4,57.6,52.4,57.1,52.0,56.6,52.1,55.3,52.0,55.0,52.4,54.6,53.8,54.4,54.1,53.9,56.1,53.3,56.5,53.3,57.5,53.2,59.1,53.0,59.7,52.9,60.0]],"c":2},{"id":"printer","nm":"印表機","r":[[39.3,44.2,39.2,44.3,38.9,44.4,38.2,45.3,38.0,46.4,37.6,47.2,37.6,48.3,37.7,49.1,37.7,50.6,37.6,51.4,37.6,54.6,37.7,55.2,37.9,55.4,38.4,55.6,38.4,55.7,38.7,55.7,38.7,55.8,39.1,55.8,39.2,56.0,39.5,56.0,39.5,56.1,39.6,56.1,39.8,55.6,39.8,54.5,39.8,54.3,39.8,53.8,39.9,53.1,40.1,52.7,40.2,52.7,40.5,52.3,40.8,52.3,41.0,52.0,41.1,51.6,41.1,51.3,41.1,51.2,41.1,47.0,41.2,46.4,41.2,45.7,41.1,45.1,41.0,45.0,40.5,44.7,40.3,44.4,39.4,44.3]],"c":1},{"id":"pillbottle","nm":"藥罐","r":[[42.3,62.4,42.1,62.7,42.0,63.3,42.0,64.0,42.0,64.1,42.0,67.3,42.0,67.4,42.0,67.7,42.2,68.1,42.6,68.1,42.6,68.0,42.8,67.8,43.0,67.3,43.0,66.9,43.0,66.7,43.0,65.7,43.1,65.6,43.1,63.7,43.0,63.5,43.0,63.1,42.9,62.7,42.7,62.4]],"c":1},{"id":"files","nm":"文件資料櫃（右邊）","r":[[100.0,43.7,100.0,42.4,99.2,42.2,98.8,41.4,98.9,19.8,98.7,16.6,98.5,16.2,95.5,16.1,95.2,16.5,91.5,16.2,86.6,16.8,82.9,16.5,81.9,17.1,81.2,16.6,80.7,17.2,79.8,16.6,79.4,17.2,78.0,17.6,77.0,16.9,76.8,17.3,73.6,17.5,73.3,18.0,73.3,28.2,73.1,33.6,73.5,34.5,74.9,33.8,75.7,34.7,76.0,35.9,77.9,34.7,78.2,36.2,78.4,38.7,78.6,38.9,78.7,38.0,79.2,38.0,80.6,40.6,81.8,41.1,82.3,41.8,82.9,41.3,83.5,41.4,84.4,35.6,85.7,33.7,87.3,35.8,87.4,36.5,87.3,38.2,87.5,39.1,90.0,40.9,90.7,41.8,91.5,41.3,93.7,42.9,94.4,42.4,94.5,38.0,95.1,36.0,96.6,35.9,96.8,36.5,97.3,39.9,98.7,42.8]],"c":1},{"id":"desk","nm":"辦公桌（行政事宜）","r":[[76.5,52.4,76.5,70.7,77.9,75.9,79.9,75.8,79.2,60.5,79.9,56.8,81.9,58.7,83.5,68.6,87.2,75.9,87.3,93.9,86.7,97.1,87.3,99.9,100.0,99.9,100.0,70.3,99.3,69.7,100.0,68.6,100.0,58.0,97.2,58.3,93.5,53.5,93.8,43.6,91.2,42.2,91.1,47.2,92.1,48.3,92.4,53.5,85.1,49.1,86.0,53.4,85.6,60.9,87.8,63.1,88.2,66.2,89.0,64.5,90.9,67.5,91.5,65.9,90.5,64.9,90.6,61.1,95.6,64.0,97.1,62.9,98.2,67.3,98.7,63.8,98.9,79.0,94.6,79.1,92.8,75.8,89.6,76.5,88.5,72.6,89.7,70.2,87.7,70.6,87.5,68.0,84.0,64.0,82.5,58.6,82.5,55.0,81.6,54.1,81.7,51.3,81.0,50.5,80.3,52.7,77.2,51.0],[77.2,40.2,77.2,41.3,77.1,41.4,77.1,42.6,77.0,42.8,77.0,43.7,77.0,43.9,76.9,45.3,76.9,45.4,76.9,46.5,77.0,46.8,77.2,47.0,77.4,47.0,77.5,47.3,78.2,47.7,78.4,48.4,78.5,50.1,78.7,50.3,78.9,49.9,79.3,49.0,79.5,49.0,79.7,49.5,79.7,49.8,79.8,49.9,79.9,49.8,80.1,48.4,80.1,47.0,80.2,46.9,80.2,44.4,80.2,44.3,80.2,43.7,80.3,43.6,80.3,43.1,80.3,42.9,80.3,42.1,80.3,42.0,80.3,41.7,80.1,41.3,79.9,41.3,79.8,41.1,79.7,41.1,79.4,40.9,79.3,40.9,79.1,40.6,78.6,40.6,78.2,40.2,77.8,40.0,77.7,39.9,77.3,39.9],[71.6,35.8,71.6,36.2,71.5,36.3,71.5,38.0,71.5,38.1,71.5,41.3,71.6,41.5,72.2,41.4,72.3,41.7,72.5,41.7,72.7,41.3,72.8,41.3,73.2,40.6,73.4,40.4,73.5,40.0,73.5,39.8,73.6,39.6,73.5,37.1,73.6,37.0,73.6,36.0,73.6,35.9,73.6,35.6,73.5,35.5,73.1,35.5,73.1,35.6,72.1,35.6,72.1,35.5,71.7,35.5],[69.9,42.9,69.9,43.9,70.1,44.6,70.0,45.9,70.1,46.1,70.1,46.5,70.1,46.6,70.2,46.5,70.3,45.9,70.5,45.5,70.9,45.7,71.0,45.8,71.3,45.9,71.4,46.1,71.8,46.1,72.0,45.5,72.0,44.6,72.0,44.4,72.0,44.0,71.9,43.9,71.6,43.7,71.1,42.9,70.3,42.6,70.1,42.4]],"c":7}],"add":{"p11":{"label":"問卷","to":"q:all","ico":"📋","desc":"開放中的問卷"}}},
{"old":"v1","bx":{"p1":[5,12,11,17,"t"],"p2":[37,9,12,22,"t"],"p3":[55,9,14,21,"t"],"p4":[81,8,14,21,"t"],"p5":[60,46,10,16,"t"],"p6":[10,57,11,15,"t"],"p7":[36,63,16,13,"b"],"p8":[6,75,13,16,"t"],"p9":[57,76,14,16,"l"],"p10":[81,74,15,14,"t"]}},
{"old":"v2","bx":{"p1":[17,12,6,29,"r"],"p2":[43,19,8,17,"t"],"p3":[59,19,10,20,"t"],"p4":[82,20,11,20,"t"],"p5":[66,37,13,23,"t"],"p6":[14,18,4,25,"b"],"p7":[42,53,18,13,"b"],"p8":[20,61,19,23,"t"],"p9":[58,63,14,17,"l"],"p10":[71,64,18,26,"t"]}},
{"old":"v3","bx":{"p1":[17,12,6,29,"r"],"p2":[43,19,8,17,"t"],"p3":[59,19,10,20,"t"],"p4":[82,20,11,20,"t"],"p5":[66,37,13,23,"t"],"p6":[14,18,4,25,"b"],"p7":[42,53,18,13,"b"],"p8":[20,61,19,23,"t"],"p9":[58,63,14,17,"l"],"p10":[71,64,18,26,"t"],"p11":[31,76,18,24,"t"]}}];

/* ════════ shape.js ════════ */
/* ───────── 物品的形狀（第 26 批）：在「物品框」裡自動找出物品的輪廓 ─────────
   做法：GrabCut（框外面＝背景；框裡面用「物品的顏色」和「背景的顏色」兩個模型，加上「相鄰的點盡量同一邊」，用圖割分成物品／背景，來回 4 次）。
   只有開發者的編輯器會算（選到一個地點、移動框、點選要亮的物品、按「儲存」的時候）；算好的輪廓（幾個多邊形，用整張圖的 %）存在地點裡。
   網頁首頁：平常有按鍵的物品留一半顏色、滑到時亮起來——都只照輪廓（物品本身），框裡的背景不亮。藥師的瀏覽器照著畫，不用算。
   「點一下要亮的物品」（pick）：那一點附近一定算物品，最後只留那一樣（框裡的其他東西不亮）。
   這個檔裡的函式除了 shFind、shFp（要畫布）以外都不碰畫面，測試可以直接跑。
   第 27 批：目錄圖是「圖一」（物品圖庫 shapelib.js 裡有的那一張）→ 直接用圖庫裡切好的整個物品（整本書、整個藥盤…，不用設定）；別張圖才用上面的方法在框裡找。 */
var SH_VER = "s7", SH_SIDE = 180, SH_ITER = 4, SH_K = 5, SH_GAMMA = 12, SH_PTS = 40, SH_RINGS = 4;
// SH_VER：第 28 批改成 s3（圖庫的「覆核」多了電腦）、第 29 批 s4（行政事宜＝整個文件資料櫃）、第 30 批 s5（圖庫多了新的圖一）、
//   第 32 批 s6（有問卷夾板的圖一；覆核＋兩盒處方、行政事宜＋辦公桌、水藥＝藥品櫃＋窄藥架＋冰箱）、s7（水藥：左邊兩座藥品櫃都亮）
//   → 存過的形狀都會重找一次（圖一用圖庫，很快；打開編輯器、自動存檔開著就自動做）。
// SH_GAMMA：「相鄰的點盡量同一邊」有多重要。縮小過的圖用 OpenCV 的 50 太重（整個框會變成背景）；12 試過藥盤、藥水瓶、法規書、處方夾都對。
// 還是整個變背景的話，自動用一半再試一次。

function shBox(s) { return [s.x, s.y, s.w, s.h].map(function (v) { return Math.round(Number(v) || 0); }).join(","); }
function shKey(cat, s) { return SH_VER + "|" + ((cat && cat.fid) || "") + "|" + shBox(s) + "|" + (Array.isArray(s.pick) ? s.pick.join(",") : "") + "|" + String((s && s.id) || "").slice(0, 40); }
function shNeed(cat, s) { return !!(cat && cat.img && s && s.lit !== "box" && !(s.shape && s.shape.k === shKey(cat, s))); }

/* ── 第 27 批：物品圖庫（shapelib.js 的 SH_LIB）──
   圖的指紋 fp：縮成 272×128 → 每 16×16 一格平均 → 17×8 格灰階 → 每一列左右相鄰比亮暗 → 128 個 0/1（32 個十六進位字）。跟 build_lib.py 同一個算法；
   重新存過、縮小過的同一張圖，差不到幾個；別張圖差 50～70 個。差 SH_FP_MAX 個以內、長寬比差 3% 以內＝同一張。 */
var SH_FP_MAX = 20;
function shFpOf(px, W, H) {   // px＝RGBA（W×H，已經縮成 272×128）
  var L = new Float64Array(17 * 8), x, y, hex = "", nib = 0, nb = 0;
  for (y = 0; y < H; y++) for (x = 0; x < W; x++) { var o = (y * W + x) * 4; L[(Math.min(7, (y * 8 / H) | 0)) * 17 + Math.min(16, (x * 17 / W) | 0)] += px[o] * 0.299 + px[o + 1] * 0.587 + px[o + 2] * 0.114; }
  for (y = 0; y < 8; y++) for (x = 0; x < 16; x++) { nib = nib * 2 + (L[y * 17 + x] < L[y * 17 + x + 1] ? 1 : 0); if (++nb === 4) { hex += nib.toString(16); nib = 0; nb = 0; } }
  return hex;
}
function shSmall(img) {   // 瀏覽器裡：載好的圖 → 縮成 272×128 的像素（RGBA）
  var cv = document.createElement("canvas"); cv.width = 272; cv.height = 128;
  var g = cv.getContext("2d", { willReadFrequently: true });
  g.imageSmoothingEnabled = true; try { g.imageSmoothingQuality = "high"; } catch (e) { /* 舊瀏覽器 */ }
  g.drawImage(img, 0, 0, 272, 128);
  return g.getImageData(0, 0, 272, 128).data;
}
function shFp(img) { return shFpOf(shSmall(img), 272, 128); }   // 瀏覽器裡：載好的圖 → 指紋
// 第 32 批：探針＝縮成 272×128 以後，某一塊（整張圖的 %）的平均顏色（build_lib3.py 一樣算法）
function shProbeOf(px, W, H, b) {
  var X0 = Math.floor(b[0] / 100 * W), Y0 = Math.floor(b[1] / 100 * H), X1 = Math.max(X0 + 1, Math.round(b[2] / 100 * W)), Y1 = Math.max(Y0 + 1, Math.round(b[3] / 100 * H));
  var s = [0, 0, 0], n = 0, x, y;
  for (y = Y0; y < Y1; y++) for (x = X0; x < X1; x++) { var o = (y * W + x) * 4; s[0] += px[o]; s[1] += px[o + 1]; s[2] += px[o + 2]; n++; }
  return n ? [s[0] / n, s[1] / n, s[2] / n] : null;
}
function shFpDist(a, b) {   // 兩個指紋差幾個 0/1
  if (!a || !b || a.length !== b.length) return 999;
  var n = 0; for (var i = 0; i < a.length; i++) { var v = parseInt(a.charAt(i), 16) ^ parseInt(b.charAt(i), 16); while (v) { n += v & 1; v >>= 1; } }
  return n;
}
// 指紋、長寬比 → 圖庫裡的那一筆（沒有＝null）。第 32 批：挑「最接近」的那一筆（以前是第一筆對得上的）：
//   有問卷夾板的圖一跟第 30 批的圖只差一個夾板，指紋只差 4 個 → 兩筆都有探針（夾板那一塊的平均顏色），顏色差越多扣越多分。probe(b)＝這張圖那一塊的平均顏色
function shLibMatch(fp, ar, probe) {
  var lib = typeof SH_LIB !== "undefined" ? SH_LIB : [], best = null, bs = Infinity;
  for (var i = 0; i < lib.length; i++) {
    var E = lib[i]; if (!E.fp || !E.objs) continue;   // 第 34 批追加：舊圖（old）只留預設按鍵位置，不比對
    if (Math.abs(ar - E.ar) / E.ar > 0.03) continue;
    var d = shFpDist(fp, E.fp); if (d > SH_FP_MAX) continue;
    if (probe && E.pr) E.pr.forEach(function (p) { var c = probe(p); if (c) d += Math.sqrt(Math.pow(c[0] - p[4], 2) + Math.pow(c[1] - p[5], 2) + Math.pow(c[2] - p[6], 2)) / 5; });
    if (d < bs) { bs = d; best = E; }
  }
  return best;
}
function shInRings(rings, x, y) {   // 這一點在不在物品裡（好幾圈：在任一圈裡就算）
  var c = false;
  (rings || []).forEach(function (r) { for (var i = 0, j = r.length - 2; i < r.length; j = i, i += 2) { var xi = r[i], yi = r[i + 1], xj = r[j], yj = r[j + 1]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } });
  return c;
}
function shRingsBox(rings) { var b = [Infinity, Infinity, -Infinity, -Infinity]; (rings || []).forEach(function (r) { for (var k = 0; k + 1 < r.length; k += 2) { b[0] = Math.min(b[0], r[k]); b[2] = Math.max(b[2], r[k]); b[1] = Math.min(b[1], r[k + 1]); b[3] = Math.max(b[3], r[k + 1]); } }); return b; }
function shRingsArea(rings) { var a = 0; (rings || []).forEach(function (r) { a += shArea(r); }); return a; }
// 這個地點要亮圖庫裡的哪一個物品（沒有合適的＝null，照舊在框裡找）：
//   ① 點選過（pick）：點到的那一個（點到好幾個，例如量杯也在「藥水瓶和量杯」裡：小的那個）
//   ② 預設的地點（p1…p10）：圖庫指定的物品，只要它還在框附近（框搬到別的東西上面就不算）
//   ③ 其他：框裡佔最多的物品（至少佔框的 15%，物品也至少有 8% 在框裡）
function shLibPick(L, s) {
  var objs = (L && L.objs) || [], B = [s.x, s.y, s.x + s.w, s.y + s.h], i;
  if (Array.isArray(s.pick)) {
    var hit = null;
    objs.forEach(function (o) { if (shInRings(o.r, s.pick[0], s.pick[1]) && (!hit || shRingsArea(o.r) < shRingsArea(hit.r))) hit = o; });
    return hit;
  }
  var mx = Math.max(4, s.w * 0.5), my = Math.max(4, s.h * 0.5);
  for (i = 0; i < objs.length; i++) {
    var o = objs[i];
    if (!o.ids || o.ids.indexOf(s.id) < 0) continue;
    var bb = shRingsBox(o.r);
    if (bb[0] < B[2] + mx && bb[2] > B[0] - mx && bb[1] < B[3] + my && bb[3] > B[1] - my) return o;
  }
  var N = 24, best = null, bc = 0, ba = Infinity, boxA = Math.max(1e-6, s.w * s.h);
  objs.forEach(function (o) {
    var bb = shRingsBox(o.r); if (bb[0] > B[2] || bb[2] < B[0] || bb[1] > B[3] || bb[3] < B[1]) return;
    var n = 0, a, b;
    for (a = 0; a < N; a++) for (b = 0; b < N; b++) if (shInRings(o.r, B[0] + (a + 0.5) / N * s.w, B[1] + (b + 0.5) / N * s.h)) n++;
    var cov = n / (N * N), oa = shRingsArea(o.r), inBox = oa > 0 ? cov * boxA / oa : 0;
    if (cov >= 0.15 && inBox >= 0.08 && (cov > bc + 1e-9 || (Math.abs(cov - bc) <= 1e-9 && oa < ba))) { best = o; bc = cov; ba = oa; }
  });
  return best;
}
// 編輯器：img＝目錄圖（載好的）→ 圖庫裡的那一筆（不在圖庫＝null）。算一次就記在 img 上
function shLibOf(img) {
  if (!img) return null;
  if (img.__shLib === undefined) {
    var IW = img.naturalWidth || img.width, IH = img.naturalHeight || img.height, L = null;
    try { if (IW && IH) { var px = shSmall(img); L = shLibMatch(shFpOf(px, 272, 128), IW / IH, function (b) { return shProbeOf(px, 272, 128, b); }); } } catch (e) { L = null; }
    img.__shLib = L;
  }
  return img.__shLib;
}
// 第 30 批：換了目錄圖（圖庫裡的另一張）→ 按鍵還在「別張圖的預設位置」（沒動過）的，搬到這張圖的預設位置（L.bx：x、y、w、h、標籤在哪一邊）。
//   第 34 批追加：舊圖（old）只留預設按鍵位置，也算「別張圖的預設位置」。
//   動過的（不是任何一張圖的預設位置）不動；標籤的位置也是：還是舊的預設才換。點選過的物品（pick）是舊圖上的位置：拿掉。回傳搬了哪幾個（代號）。
function shLibMove(L, spots) {
  var lib = typeof SH_LIB !== "undefined" ? SH_LIB : [], moved = [];
  if (!L || !L.bx) return moved;
  var same = function (s, b) { return !!b && Math.abs(+s.x - b[0]) < 0.05 && Math.abs(+s.y - b[1]) < 0.05 && Math.abs(+s.w - b[2]) < 0.05 && Math.abs(+s.h - b[3]) < 0.05; };
  (spots || []).forEach(function (s) {
    var nb = L.bx[s.id]; if (!nb || same(s, nb)) return;
    var from = null;
    lib.forEach(function (E) { if (E !== L && E.bx && same(s, E.bx[s.id])) from = E.bx[s.id]; });
    if (!from) return;
    s.x = nb[0]; s.y = nb[1]; s.w = nb[2]; s.h = nb[3];
    if (nb[4] && (s.pos || "t") === (from[4] || "t")) s.pos = nb[4];
    delete s.pick;
    moved.push(s.id);
  });
  return moved;
}
// 第 32 批：這張圖多的按鍵（L.add，例如有問卷夾板的圖一多一個「問卷」）：還沒有就加一個（放在 L.bx 的位置）。
//   已經有連到同一個地方（to 一樣）、或同一個代號的：不加（自己刪掉又想要，換一次圖或手動新增）。回傳加了哪幾個（代號）
function shLibAdd(L, spots) {
  var added = [];
  if (!L || !L.add || !L.bx || !Array.isArray(spots)) return added;
  Object.keys(L.add).forEach(function (id) {
    var a = L.add[id], b = L.bx[id];
    if (!a || !b || spots.length >= 12) return;
    if (spots.some(function (s) { return s.id === id || (a.to && s.to === a.to); })) return;
    spots.push({ id: id, label: a.label || "", to: a.to || "", ico: a.ico || "", x: b[0], y: b[1], w: b[2], h: b[3], pos: b[4] || "t", desc: a.desc || "", st: "" });
    added.push(id);
  });
  return added;
}
// 編輯器：img＝目錄圖（載好的），s＝地點 → 圖庫裡有：{ r, n, nm }；這張圖不在圖庫、或框裡沒有圖庫的物品：null
function shLibFind(img, s) {
  if (!img) return null;
  var L = shLibOf(img);
  var o = L ? shLibPick(L, s) : null;
  return o ? { r: o.r.map(function (r) { return r.slice(); }), n: o.c || o.r.length, nm: o.nm } : null;
}

// 固定的亂數（同一張圖、同一個框，每次算出來都一樣）
function shRand(seed) { var r = (seed >>> 0) || 1; return function () { r = (Math.imul(r, 1664525) + 1013904223) >>> 0; return r / 4294967296; }; }

/* ── k-means（給顏色模型一個好的起點）── */
function shKmeans(Z, idx, K, iters, rnd) {
  var n = idx.length, lab = new Uint8Array(n), C = new Float64Array(K * 3), d2 = new Float64Array(n), i, k, c;
  if (!n) return lab;
  var dist = function (p, kk) { var a = Z[p * 3] - C[kk * 3], b = Z[p * 3 + 1] - C[kk * 3 + 1], e = Z[p * 3 + 2] - C[kk * 3 + 2]; return a * a + b * b + e * e; };
  var p0 = idx[Math.floor(rnd() * n)];
  for (c = 0; c < 3; c++) C[c] = Z[p0 * 3 + c];
  for (i = 0; i < n; i++) d2[i] = dist(idx[i], 0);
  for (k = 1; k < K; k++) {   // k-means++：離已經選的中心越遠，越容易被選
    var sum = 0; for (i = 0; i < n; i++) sum += d2[i];
    var pick = Math.floor(rnd() * n);
    if (sum > 0) { var t = rnd() * sum; for (i = 0; i < n; i++) { t -= d2[i]; if (t <= 0) { pick = i; break; } } }
    for (c = 0; c < 3; c++) C[k * 3 + c] = Z[idx[pick] * 3 + c];
    for (i = 0; i < n; i++) { var dd = dist(idx[i], k); if (dd < d2[i]) d2[i] = dd; }
  }
  var S = new Float64Array(K * 3), cnt = new Float64Array(K);
  for (var it = 0; it < iters; it++) {
    for (i = 0; i < n; i++) { var best = 0, bd = Infinity; for (k = 0; k < K; k++) { var v = dist(idx[i], k); if (v < bd) { bd = v; best = k; } } lab[i] = best; }
    S.fill(0); cnt.fill(0);
    for (i = 0; i < n; i++) { k = lab[i]; cnt[k]++; for (c = 0; c < 3; c++) S[k * 3 + c] += Z[idx[i] * 3 + c]; }
    for (k = 0; k < K; k++) if (cnt[k]) for (c = 0; c < 3; c++) C[k * 3 + c] = S[k * 3 + c] / cnt[k];
  }
  return lab;
}

/* ── 顏色模型（5 個高斯混在一起；跟 OpenCV 的 GrabCut 一樣的算法）── */
function shGmm() { var K = SH_K; return { coef: new Float64Array(K), mean: new Float64Array(K * 3), inv: new Float64Array(K * 9), det: new Float64Array(K), isd: new Float64Array(K), S: new Float64Array(K * 3), P: new Float64Array(K * 9), n: new Float64Array(K), tot: 0, best: 0 }; }
function shGmmReset(m) { m.S.fill(0); m.P.fill(0); m.n.fill(0); m.tot = 0; }
function shGmmAdd(m, k, r, g, b) {
  var o = k * 3, q = k * 9, P = m.P;
  m.S[o] += r; m.S[o + 1] += g; m.S[o + 2] += b;
  P[q] += r * r; P[q + 1] += r * g; P[q + 2] += r * b; P[q + 4] += g * g; P[q + 5] += g * b; P[q + 8] += b * b;
  m.n[k]++; m.tot++;
}
function shGmmEnd(m) {
  for (var k = 0; k < SH_K; k++) {
    var n = m.n[k];
    if (!n) { m.coef[k] = 0; continue; }
    m.coef[k] = n / m.tot;
    var o = k * 3, q = k * 9, a = m.S[o] / n, b = m.S[o + 1] / n, e = m.S[o + 2] / n, P = m.P;
    m.mean[o] = a; m.mean[o + 1] = b; m.mean[o + 2] = e;
    var c0 = P[q] / n - a * a, c1 = P[q + 1] / n - a * b, c2 = P[q + 2] / n - a * e, c4 = P[q + 4] / n - b * b, c5 = P[q + 5] / n - b * e, c8 = P[q + 8] / n - e * e;
    var det = c0 * (c4 * c8 - c5 * c5) - c1 * (c1 * c8 - c5 * c2) + c2 * (c1 * c5 - c4 * c2);
    if (det <= 1e-9) { c0 += 0.01; c4 += 0.01; c8 += 0.01; det = c0 * (c4 * c8 - c5 * c5) - c1 * (c1 * c8 - c5 * c2) + c2 * (c1 * c5 - c4 * c2); }   // 顏色幾乎一樣（平的一片）：加一點點，免得除以 0
    if (det <= 1e-12) det = 1e-12;
    m.det[k] = det; m.isd[k] = 1 / Math.sqrt(det);
    var I = m.inv;
    I[q] = (c4 * c8 - c5 * c5) / det; I[q + 1] = (c2 * c5 - c1 * c8) / det; I[q + 2] = (c1 * c5 - c2 * c4) / det;
    I[q + 3] = I[q + 1]; I[q + 4] = (c0 * c8 - c2 * c2) / det; I[q + 5] = (c1 * c2 - c0 * c5) / det;
    I[q + 6] = I[q + 2]; I[q + 7] = I[q + 5]; I[q + 8] = (c0 * c4 - c1 * c1) / det;
  }
}
function shGmmEval(m, r, g, b) {   // 這個顏色像不像（Σ 權重×密度，不含常數）；m.best＝最像的那一個高斯
  var s = 0, best = 0, bp = -1, I = m.inv, M = m.mean, C = m.coef, D = m.isd;
  for (var k = 0; k < SH_K; k++) {
    if (C[k] <= 0) continue;
    var o = k * 3, q = k * 9, d0 = r - M[o], d1 = g - M[o + 1], d2 = b - M[o + 2];
    var p = Math.exp(-0.5 * (d0 * (d0 * I[q] + 2 * (d1 * I[q + 1] + d2 * I[q + 2])) + d1 * (d1 * I[q + 4] + 2 * d2 * I[q + 5]) + d2 * d2 * I[q + 8])) * D[k];
    s += C[k] * p;
    if (p > bp) { bp = p; best = k; }
  }
  m.best = best;
  return s;
}

/* ── 圖割（最大流／最小割，Boykov–Kolmogorov 演算法）：每個點是一個節點；連到「物品」端、「背景」端的容量＋相鄰點之間的容量 ── */
function shGraph(N, E) {   // E：最多幾條邊（每條邊兩個方向）
  return { N: N, first: new Int32Array(N).fill(-1), trCap: new Float64Array(N), head: new Int32Array(E * 2), nxtA: new Int32Array(E * 2), rCap: new Float64Array(E * 2), nA: 0 };
}
function shEdge(G, i, j, cap, rev) {
  var a = G.nA; G.nA += 2;
  G.head[a] = j; G.nxtA[a] = G.first[i]; G.first[i] = a; G.rCap[a] = cap;
  G.head[a + 1] = i; G.nxtA[a + 1] = G.first[j]; G.first[j] = a + 1; G.rCap[a + 1] = rev;
}
function shMaxflow(G) {   // 回傳：每個節點在不在「物品」那一邊（Uint8Array）
  var N = G.N, first = G.first, head = G.head, nxtA = G.nxtA, rCap = G.rCap, trCap = G.trCap;
  var NONE = -1, TERM = -2, ORPH = -3, INF_D = 1e9;
  var parent = new Int32Array(N), nxt = new Int32Array(N).fill(-1), TS = new Int32Array(N), DIST = new Int32Array(N), sink = new Uint8Array(N);
  var qF = -1, qL = -1, orph = [], oh = 0, TIME = 0, i, j, a, a0;
  var setActive = function (v) { if (nxt[v] === -1) { if (qL >= 0) nxt[qL] = v; else qF = v; qL = v; nxt[v] = v; } };
  var nextActive = function () {
    for (;;) {
      var v = qF; if (v < 0) return -1;
      if (nxt[v] === v) { qF = qL = -1; } else qF = nxt[v];
      nxt[v] = -1;
      if (parent[v] !== NONE) return v;
    }
  };
  var orphan = function (v) { parent[v] = ORPH; orph.push(v); };
  for (i = 0; i < N; i++) {
    if (trCap[i] > 0) { sink[i] = 0; parent[i] = TERM; setActive(i); DIST[i] = 1; }
    else if (trCap[i] < 0) { sink[i] = 1; parent[i] = TERM; setActive(i); DIST[i] = 1; }
    else parent[i] = NONE;
  }
  var augment = function (mid) {
    var v, e, b = rCap[mid];
    for (v = head[mid ^ 1]; ; v = head[e]) { e = parent[v]; if (e === TERM) break; if (b > rCap[e ^ 1]) b = rCap[e ^ 1]; }
    if (b > trCap[v]) b = trCap[v];
    for (v = head[mid]; ; v = head[e]) { e = parent[v]; if (e === TERM) break; if (b > rCap[e]) b = rCap[e]; }
    if (b > -trCap[v]) b = -trCap[v];
    rCap[mid ^ 1] += b; rCap[mid] -= b;
    for (v = head[mid ^ 1]; ; v = head[e]) { e = parent[v]; if (e === TERM) break; rCap[e] += b; rCap[e ^ 1] -= b; if (rCap[e ^ 1] <= 0) { rCap[e ^ 1] = 0; orphan(v); } }
    trCap[v] -= b; if (trCap[v] <= 0) { trCap[v] = 0; orphan(v); }
    for (v = head[mid]; ; v = head[e]) { e = parent[v]; if (e === TERM) break; rCap[e ^ 1] += b; rCap[e] -= b; if (rCap[e] <= 0) { rCap[e] = 0; orphan(v); } }
    trCap[v] += b; if (trCap[v] >= 0) { trCap[v] = 0; orphan(v); }
  };
  var adopt = function (v) {
    var isS = sink[v], dmin = INF_D, amin = NONE, d, w, e, e0;
    for (e0 = first[v]; e0 !== NONE; e0 = nxtA[e0]) {
      if ((isS ? rCap[e0] : rCap[e0 ^ 1]) > 0) {
        w = head[e0];
        if (sink[w] === isS && (e = parent[w]) !== NONE) {
          d = 0;
          for (;;) {   // 這個鄰居是不是真的接回「物品」端（或「背景」端）
            if (TS[w] === TIME) { d += DIST[w]; break; }
            e = parent[w]; d++;
            if (e === TERM) { TS[w] = TIME; DIST[w] = 1; break; }
            if (e === ORPH) { d = INF_D; break; }
            w = head[e];
          }
          if (d < INF_D) {
            if (d < dmin) { amin = e0; dmin = d; }
            for (w = head[e0]; TS[w] !== TIME; w = head[parent[w]]) { TS[w] = TIME; DIST[w] = d--; }
          }
        }
      }
    }
    parent[v] = amin;
    if (amin !== NONE) { TS[v] = TIME; DIST[v] = dmin + 1; return; }
    for (e0 = first[v]; e0 !== NONE; e0 = nxtA[e0]) {   // 找不到新的爸爸：變成自由的點，鄰居重新長過來
      w = head[e0];
      if (sink[w] === isS && (e = parent[w]) !== NONE) {
        if ((isS ? rCap[e0] : rCap[e0 ^ 1]) > 0) setActive(w);
        if (e !== TERM && e !== ORPH && head[e] === v) orphan(w);
      }
    }
  };
  var cur = -1;
  for (;;) {
    i = -1;
    if (cur >= 0) { nxt[cur] = -1; if (parent[cur] !== NONE) i = cur; cur = -1; }
    if (i < 0) { i = nextActive(); if (i < 0) break; }
    a = NONE;
    if (!sink[i]) {
      for (a0 = first[i]; a0 !== NONE; a0 = nxtA[a0]) if (rCap[a0] > 0) {
        j = head[a0];
        if (parent[j] === NONE) { sink[j] = 0; parent[j] = a0 ^ 1; TS[j] = TS[i]; DIST[j] = DIST[i] + 1; setActive(j); }
        else if (sink[j]) { a = a0; break; }
        else if (TS[j] <= TS[i] && DIST[j] > DIST[i]) { parent[j] = a0 ^ 1; TS[j] = TS[i]; DIST[j] = DIST[i] + 1; }
      }
    } else {
      for (a0 = first[i]; a0 !== NONE; a0 = nxtA[a0]) if (rCap[a0 ^ 1] > 0) {
        j = head[a0];
        if (parent[j] === NONE) { sink[j] = 1; parent[j] = a0 ^ 1; TS[j] = TS[i]; DIST[j] = DIST[i] + 1; setActive(j); }
        else if (!sink[j]) { a = a0 ^ 1; break; }
        else if (TS[j] <= TS[i] && DIST[j] > DIST[i]) { parent[j] = a0 ^ 1; TS[j] = TS[i]; DIST[j] = DIST[i] + 1; }
      }
    }
    TIME++;
    if (a !== NONE) {
      nxt[i] = i; cur = i;   // 這個點等一下再看一次（可能還有別條路）
      augment(a);
      while (oh < orph.length) adopt(orph[oh++]);
      orph.length = 0; oh = 0;
    }
  }
  var fg = new Uint8Array(N);
  for (i = 0; i < N; i++) fg[i] = parent[i] !== NONE && !sink[i] ? 1 : 0;   // 從「物品」端走得到的＝物品
  return fg;
}

/* ── GrabCut：px＝RGBA（W×H），框＝[X0,Y0,X1,Y1)（框外＝確定是背景），pk＝[x,y]（點選的地方，可以沒有），gamma＝相鄰的點有多黏 → 每個點是不是物品 ── */
function shGrabCut(px, W, H, X0, Y0, X1, Y1, pk, gamma) {
  var N = W * H, i, x, y, it;
  gamma = gamma || SH_GAMMA;
  var LAMBDA = 9 * gamma, Z = new Float64Array(N * 3);
  for (i = 0; i < N; i++) { Z[i * 3] = px[i * 4]; Z[i * 3 + 1] = px[i * 4 + 1]; Z[i * 3 + 2] = px[i * 4 + 2]; }
  var lab = new Uint8Array(N);   // 0 確定背景、1 確定物品、2 可能背景、3 可能物品（跟 OpenCV 一樣）
  for (y = 0; y < H; y++) for (x = 0; x < W; x++) lab[y * W + x] = x >= X0 && x < X1 && y >= Y0 && y < Y1 ? 3 : 0;
  if (pk) {   // 點選的地方：一小圈確定是物品
    var rr = Math.max(1.5, Math.min(X1 - X0, Y1 - Y0) * 0.035);
    for (y = Math.max(Y0, Math.floor(pk[1] - rr)); y <= Math.min(Y1 - 1, Math.ceil(pk[1] + rr)); y++)
      for (x = Math.max(X0, Math.floor(pk[0] - rr)); x <= Math.min(X1 - 1, Math.ceil(pk[0] + rr)); x++)
        if ((x - pk[0]) * (x - pk[0]) + (y - pk[1]) * (y - pk[1]) <= rr * rr) lab[y * W + x] = 1;
  }
  var bgIdx = [], fgIdx = [];
  for (i = 0; i < N; i++) (lab[i] === 0 || lab[i] === 2 ? bgIdx : fgIdx).push(i);
  if (bgIdx.length < 20 || fgIdx.length < 20) return null;   // 框太大（外面沒有背景可以參考）或太小
  // 圖：每個點連到左、左上、上、右上（容量＝顏色越像越大）；只建一次
  var d2 = function (p, q) { var a = Z[p * 3] - Z[q * 3], b = Z[p * 3 + 1] - Z[q * 3 + 1], c = Z[p * 3 + 2] - Z[q * 3 + 2]; return a * a + b * b + c * c; };
  var sum = 0, cnt = 0;
  for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
    i = y * W + x;
    if (x > 0) { sum += d2(i, i - 1); cnt++; }
    if (x > 0 && y > 0) { sum += d2(i, i - W - 1); cnt++; }
    if (y > 0) { sum += d2(i, i - W); cnt++; }
    if (x < W - 1 && y > 0) { sum += d2(i, i - W + 1); cnt++; }
  }
  var beta = sum > 1e-9 ? 1 / (2 * sum / cnt) : 0, gD = gamma / Math.SQRT2, G = shGraph(N, N * 4);
  for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
    i = y * W + x;
    if (x > 0) { var w1 = gamma * Math.exp(-beta * d2(i, i - 1)); shEdge(G, i, i - 1, w1, w1); }
    if (x > 0 && y > 0) { var w2 = gD * Math.exp(-beta * d2(i, i - W - 1)); shEdge(G, i, i - W - 1, w2, w2); }
    if (y > 0) { var w3 = gamma * Math.exp(-beta * d2(i, i - W)); shEdge(G, i, i - W, w3, w3); }
    if (x < W - 1 && y > 0) { var w4 = gD * Math.exp(-beta * d2(i, i - W + 1)); shEdge(G, i, i - W + 1, w4, w4); }
  }
  var cap0 = new Float64Array(G.rCap.subarray(0, G.nA));
  // 顏色模型的起點：物品、背景各分 5 群
  var rnd = shRand(20261017), bg = shGmm(), fg = shGmm();
  var lb = shKmeans(Z, bgIdx, SH_K, 6, rnd), lf = shKmeans(Z, fgIdx, SH_K, 6, rnd);
  shGmmReset(bg); shGmmReset(fg);
  for (i = 0; i < bgIdx.length; i++) { var pb = bgIdx[i]; shGmmAdd(bg, lb[i], Z[pb * 3], Z[pb * 3 + 1], Z[pb * 3 + 2]); }
  for (i = 0; i < fgIdx.length; i++) { var pf = fgIdx[i]; shGmmAdd(fg, lf[i], Z[pf * 3], Z[pf * 3 + 1], Z[pf * 3 + 2]); }
  shGmmEnd(bg); shGmmEnd(fg);
  var pB = new Float64Array(N), pF = new Float64Array(N), bB = new Uint8Array(N), bF = new Uint8Array(N), BIG = 1e4;
  var evalAll = function () { for (var k = 0; k < N; k++) { var r = Z[k * 3], g = Z[k * 3 + 1], b = Z[k * 3 + 2]; pB[k] = shGmmEval(bg, r, g, b); bB[k] = bg.best; pF[k] = shGmmEval(fg, r, g, b); bF[k] = fg.best; } };
  var nlog = function (p) { return p > 1e-300 ? Math.min(BIG, -Math.log(p)) : BIG; };
  evalAll();
  for (it = 0; it < SH_ITER; it++) {
    // ① 每個點歸到最像的高斯 → 重新學兩個顏色模型 ② 算新的「像不像」
    shGmmReset(bg); shGmmReset(fg);
    for (i = 0; i < N; i++) { var isB = lab[i] === 0 || lab[i] === 2; shGmmAdd(isB ? bg : fg, isB ? bB[i] : bF[i], Z[i * 3], Z[i * 3 + 1], Z[i * 3 + 2]); }
    shGmmEnd(bg); shGmmEnd(fg);
    evalAll();
    // ③ 容量換新、切開
    G.rCap.set(cap0);
    for (i = 0; i < N; i++) {
      var L = lab[i];
      G.trCap[i] = L === 2 || L === 3 ? nlog(pB[i]) - nlog(pF[i]) : L === 0 ? -LAMBDA : LAMBDA;
    }
    var cut = shMaxflow(G);
    for (i = 0; i < N; i++) if (lab[i] === 2 || lab[i] === 3) lab[i] = cut[i] ? 3 : 2;
  }
  var out = new Uint8Array(N);
  for (i = 0; i < N; i++) out[i] = lab[i] === 1 || lab[i] === 3 ? 1 : 0;
  return out;
}

/* ── 整理：去掉細小的點、補小縫、太小的塊不要；點選了就只留那一樣；補洞 ── */
function shMorph(m, W, H, grow) {   // 3×3 擴張（grow）或侵蝕
  var o = new Uint8Array(W * H), x, y, dx, dy;
  for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
    var hit = grow ? 0 : 1;
    for (dy = -1; dy <= 1 && hit === (grow ? 0 : 1); dy++) for (dx = -1; dx <= 1; dx++) {
      var xx = x + dx, yy = y + dy, v = xx >= 0 && yy >= 0 && xx < W && yy < H ? m[yy * W + xx] : 0;
      if (grow && v) { hit = 1; break; }
      if (!grow && !v) { hit = 0; break; }
    }
    o[y * W + x] = hit;
  }
  return o;
}
function shComps(m, W, H) {   // 連在一起的塊（8 個方向）：{ id: Int32Array（0＝背景）, n, size: [] }
  var id = new Int32Array(W * H), n = 0, size = [0], st = [], i, x, y;
  for (i = 0; i < W * H; i++) if (m[i] && !id[i]) {
    n++; size.push(0); id[i] = n; st.push(i);
    while (st.length) {
      var p = st.pop(); size[n]++; x = p % W; y = (p / W) | 0;
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
        var xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        var q = yy * W + xx; if (m[q] && !id[q]) { id[q] = n; st.push(q); }
      }
    }
  }
  return { id: id, n: n, size: size };
}
function shClean(m, W, H, X0, Y0, X1, Y1, pk) {
  if (!m) return null;
  var a = shMorph(shMorph(m, W, H, false), W, H, true);   // 打開：細小的點不要
  a = shMorph(shMorph(a, W, H, true), W, H, false);        // 關起來：小縫補起來
  var c = shComps(a, W, H), minA = Math.max(12, (X1 - X0) * (Y1 - Y0) * 0.02), keep = new Uint8Array(c.n + 1), i, k, x, y;
  if (pk) {   // 點選的：只留那一塊（點的地方剛好不是物品：留最近的那一塊）
    var px = Math.min(W - 1, Math.max(0, Math.round(pk[0]))), py = Math.min(H - 1, Math.max(0, Math.round(pk[1]))), hitId = c.id[py * W + px];
    if (!hitId) { var bd = Infinity; for (i = 0; i < W * H; i++) if (c.id[i] && c.size[c.id[i]] >= 4) { x = i % W; y = (i / W) | 0; var d = (x - px) * (x - px) + (y - py) * (y - py); if (d < bd) { bd = d; hitId = c.id[i]; } } }
    if (hitId) keep[hitId] = 1;
  } else for (k = 1; k <= c.n; k++) keep[k] = c.size[k] >= minA ? 1 : 0;
  var o = new Uint8Array(W * H), any = 0;
  for (i = 0; i < W * H; i++) if (keep[c.id[i]] && c.id[i]) { o[i] = 1; any++; }
  if (!any) return null;
  // 補洞：從邊邊走不到的背景＝洞
  var seen = new Uint8Array(W * H), st = [];
  for (x = 0; x < W; x++) { st.push(x); st.push((H - 1) * W + x); }
  for (y = 0; y < H; y++) { st.push(y * W); st.push(y * W + W - 1); }
  while (st.length) {
    var p = st.pop(); if (seen[p] || o[p]) continue; seen[p] = 1; x = p % W; y = (p / W) | 0;
    if (x > 0) st.push(p - 1); if (x < W - 1) st.push(p + 1); if (y > 0) st.push(p - W); if (y < H - 1) st.push(p + W);
  }
  for (i = 0; i < W * H; i++) if (!o[i] && !seen[i]) o[i] = 1;
  var nk = 0; for (k = 1; k <= c.n; k++) if (keep[k]) nk++;
  return { m: o, n: nk };
}

/* ── 描外框：沿著物品和背景之間的格線走一圈（物品永遠在右手邊），再簡化成多邊形 ── */
function shRings(m, W, H) {
  var VW = W + 1, NV = VW * (H + 1), e1 = new Int32Array(NV).fill(-1), e2 = new Int32Array(NV).fill(-1), x, y, out = [];
  var add = function (a, b) { if (e1[a] < 0) e1[a] = b; else e2[a] = b; };
  var f = function (xx, yy) { return xx >= 0 && yy >= 0 && xx < W && yy < H && m[yy * W + xx] === 1; };
  for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (f(x, y)) {
    if (!f(x, y - 1)) add(y * VW + x, y * VW + x + 1);
    if (!f(x + 1, y)) add(y * VW + x + 1, (y + 1) * VW + x + 1);
    if (!f(x, y + 1)) add((y + 1) * VW + x + 1, (y + 1) * VW + x);
    if (!f(x - 1, y)) add((y + 1) * VW + x, y * VW + x);
  }
  for (var v0 = 0; v0 < NV; v0++) {
    while (e1[v0] >= 0) {
      var ring = [], v = v0, prev = -1, guard = 0;
      do {
        var nx;
        if (e2[v] >= 0) {   // 兩條路（斜對角碰在一起的地方）：往右轉（緊貼著同一塊）
          nx = e1[v];
          if (prev >= 0) {
            var dx = v % VW - prev % VW, dy = ((v / VW) | 0) - ((prev / VW) | 0), rx = -dy, ry = dx;
            if (e2[v] % VW - v % VW === rx && ((e2[v] / VW) | 0) - ((v / VW) | 0) === ry) nx = e2[v];
          }
          if (nx === e1[v]) { e1[v] = e2[v]; e2[v] = -1; } else e2[v] = -1;
        } else { nx = e1[v]; e1[v] = -1; }
        ring.push(v % VW, (v / VW) | 0);
        prev = v; v = nx;
      } while (v !== v0 && v >= 0 && ++guard < 4e5);
      if (ring.length >= 8) out.push(ring);
    }
  }
  return out;
}
function shArea(r) { var s = 0, n = r.length / 2; for (var i = 0; i < n; i++) { var j = (i + 1) % n; s += r[i * 2] * r[j * 2 + 1] - r[j * 2] * r[i * 2 + 1]; } return Math.abs(s) / 2; }
function shSimplify(r, eps) {   // 封閉多邊形的 Douglas–Peucker
  var n = r.length / 2; if (n <= 4) return r.slice();
  var far = 0, fd = -1, i;
  for (i = 1; i < n; i++) { var dx = r[i * 2] - r[0], dy = r[i * 2 + 1] - r[1], d = dx * dx + dy * dy; if (d > fd) { fd = d; far = i; } }
  var keep = new Uint8Array(n); keep[0] = keep[far] = 1;
  var dp = function (a, b) {   // a→b（繞一圈的索引）
    var len = (b - a + n) % n; if (len < 2) return;
    var ax = r[a * 2], ay = r[a * 2 + 1], bx = r[b * 2], by = r[b * 2 + 1], vx = bx - ax, vy = by - ay, L = Math.sqrt(vx * vx + vy * vy) || 1, md = -1, mi = -1;
    for (var t = 1; t < len; t++) { var k = (a + t) % n, d = Math.abs((r[k * 2] - ax) * vy - (r[k * 2 + 1] - ay) * vx) / L; if (d > md) { md = d; mi = k; } }
    if (md > eps) { keep[mi] = 1; dp(a, mi); dp(mi, b); }
  };
  dp(0, far); dp(far, 0);
  var o = []; for (i = 0; i < n; i++) if (keep[i]) o.push(r[i * 2], r[i * 2 + 1]);
  return o;
}
function shPoly(rings, minArea) {   // 簡化到每圈最多 SH_PTS 個點；太小的圈不要；最多 SH_RINGS 圈（大的優先）
  return rings.map(function (r) { return { r: r, a: shArea(r) }; }).filter(function (o) { return o.a >= minArea; }).sort(function (p, q) { return q.a - p.a; }).slice(0, SH_RINGS).map(function (o) {
    var eps = 0.75, s = shSimplify(o.r, eps);
    while (s.length / 2 > SH_PTS && eps < 50) { eps *= 1.4; s = shSimplify(o.r, eps); }
    return s;
  });
}

/* ── 整個流程（不碰畫面）：rgba＝工作區的像素（W×H），box＝框在工作區的位置，pk＝點選的地方，map＝工作區→整張圖 % 的換算 ── */
function shSeg(rgba, W, H, box, pk, map) {
  var area = Math.max(1, (box[2] - box[0]) * (box[3] - box[1])), fgOf = function (mm) { var n = 0; if (mm) for (var i = 0; i < mm.length; i++) n += mm[i]; return n / area; };
  var m = shGrabCut(rgba, W, H, box[0], box[1], box[2], box[3], pk, SH_GAMMA);
  if (m && fgOf(m) < 0.03) m = shGrabCut(rgba, W, H, box[0], box[1], box[2], box[3], pk, SH_GAMMA / 2);   // 整個變背景：放鬆一點再試
  var c = shClean(m, W, H, box[0], box[1], box[2], box[3], pk);
  if (!c) return { r: [], n: 0 };
  var rings = shPoly(shRings(c.m, W, H), Math.max(6, (box[2] - box[0]) * (box[3] - box[1]) * 0.01));
  var r = rings.map(function (ring) {
    var o = [];
    for (var i = 0; i < ring.length; i += 2) o.push(Math.round(Math.max(0, Math.min(100, map.x(ring[i]))) * 10) / 10, Math.round(Math.max(0, Math.min(100, map.y(ring[i + 1]))) * 10) / 10);
    return o;
  }).filter(function (o) { return o.length >= 6; });
  return { r: r, n: c.n };
}
// 在瀏覽器裡：img＝目錄圖（已經載好的 Image），s＝地點（x、y、w、h 是 %；pick 是 [x%, y%]）→ { r: [[x,y,x,y,…],…]（整張圖的 %）, n: 找到幾樣 }
function shFind(img, s) {
  var IW = img.naturalWidth || img.width, IH = img.naturalHeight || img.height;
  var bx0 = s.x / 100 * IW, by0 = s.y / 100 * IH, bx1 = (s.x + s.w) / 100 * IW, by1 = (s.y + s.h) / 100 * IH;
  var mx = Math.max(8, (bx1 - bx0) * 0.25), my = Math.max(8, (by1 - by0) * 0.25);   // 框外面一圈：當背景的樣本
  var rx0 = Math.max(0, Math.floor(bx0 - mx)), ry0 = Math.max(0, Math.floor(by0 - my)), rx1 = Math.min(IW, Math.ceil(bx1 + mx)), ry1 = Math.min(IH, Math.ceil(by1 + my));
  var sc = Math.min(1, SH_SIDE / Math.max(rx1 - rx0, ry1 - ry0)), W = Math.max(8, Math.round((rx1 - rx0) * sc)), H = Math.max(8, Math.round((ry1 - ry0) * sc));
  var cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  var g = cv.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, rx0, ry0, rx1 - rx0, ry1 - ry0, 0, 0, W, H);
  var px = g.getImageData(0, 0, W, H).data;
  var kx = W / (rx1 - rx0), ky = H / (ry1 - ry0);
  var box = [Math.max(0, Math.round((bx0 - rx0) * kx)), Math.max(0, Math.round((by0 - ry0) * ky)), Math.min(W, Math.round((bx1 - rx0) * kx)), Math.min(H, Math.round((by1 - ry0) * ky))];
  var pk = Array.isArray(s.pick) ? [(s.pick[0] / 100 * IW - rx0) * kx, (s.pick[1] / 100 * IH - ry0) * ky] : null;
  return shSeg(px, W, H, box, pk, { x: function (v) { return (rx0 + v / kx) / IW * 100; }, y: function (v) { return (ry0 + v / ky) / IH * 100; } });
}

/* ════════ edit.js ════════ */
/* ═══════════════ edit.js：編輯（開發者）：最上面一排工具列、左邊章節／目錄圖、中間表單、預覽（浮動視窗）═══════════════
 * 圖片：放進來就在瀏覽器縮好、馬上上傳（檔名換成亂碼、原檔名不留）；上傳完才算放好。
 * 儲存：整本存回去；在你編輯的時候別人（或 LINE 裡）改過，會先問你要不要蓋掉。 */
var ED = null;
var PV = { open: (typeof innerWidth === "undefined" || innerWidth > 900), x: null, y: null, w: 420, h: 680, max: false };   // 窄螢幕（手機、小視窗）一開始先關著，會把編輯區蓋住   // 預覽視窗的狀態（開／關、位置、大小、是否放到最大）
function edFirst(chs, tts) {   // 一開始選哪一個：第一個標題；沒有標題就第一章；連章都沒有就目錄圖
  chs = chs || ED.chapters; tts = tts || ED.titles;
  for (var i = 0; i < chs.length; i++) { var ts = tts[chs[i].id] || []; if (ts.length) return { kind: "title", id: ts[0].id }; }
  return chs.length ? { kind: "ch", id: chs[0].id } : { kind: "map", id: "" };
}
function edReset(src) {   // src：從哪一本開始（沒給＝現在的手冊 HB；第 28 批：載入舊版本時給舊的那一本）
  src = src || HB;
  var cat = clone(src.cat || {}); if (!Array.isArray(cat.spots)) cat.spots = []; if (!Array.isArray(cat.parts)) cat.parts = []; if (!Array.isArray(cat.parts3)) cat.parts3 = [];
  var titles = clone(src.titles || {}), chs = clone(src.chapters || []);
  chs.forEach(function (c) { if (!titles[c.id]) titles[c.id] = []; });
  var cur = edFirst(chs, titles);
  ED = { chapters: chs, titles: titles, kws: clone(src.kws || []), cat: cat, rev: HB.rev, base: HB, catLocal: null, mapUi: null, lastCh: null, cfg: { chSize: (chs[0] && chs[0].size) || "kilo", chWeb: 200 }, cur: cur, mode: cur.kind === "map" ? "map" : "ch", view: "line", dirty: false, saving: false, ab: null, warners: [], restore: null, savedAt: 0, saveMs: 0, auto: false };
  AS.first = 0; if (AS.pause !== "conflict") AS.pause = "";
}
function edHb() { return { chapters: ED.chapters, titles: ED.titles, kws: ED.kws, cat: ED.cat }; }
function edCh(id) { return ED.chapters.filter(function (c) { return c.id === id; })[0]; }
function edTitle(id) { for (var k in ED.titles) { var r = ED.titles[k].filter(function (t) { return t.id === id; })[0]; if (r) return r; } return null; }
function edCounts() { var o = {}; ED.chapters.forEach(function (c) { o[c.id] = (ED.titles[c.id] || []).length; }); return o; }
function renumber() { ED.chapters.forEach(function (c, i) { c.no = String(i + 1); }); }
function markDirty() { ED.dirty = true; dirtyPaint(); asKick(); }
function hhmm(t) { var d = new Date(t); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
function dirtyPaint() {
  var d = $("#edDirty"); if (!d || !ED) return;
  var idle = !ED.dirty && !ED.saving && !UPL && !ED.bgMsg, nb = idle ? edBgNeed() : 0, ns = idle ? edShapeNeed() : 0, no = idle ? edOcrTodo().length : 0;
  var nc = idle && ED.cat && _yzMapNeedCut_(ED.cat) ? _yzMapCutsFor_(_yzMapRatio_(ED.cat)).length : 0;   // 第 35 批：LINE 用的目錄圖要重新切（很寬的圖改切三張）
  var nd = idle ? edDrawNeed() : 0;   // 第 40 批：流程圖改過、還沒畫成圖片
  var todo = [nb ? nb + " 章的背景" : "", ns ? ns + " 個物品的形狀" : "", nc ? "LINE 用的目錄圖（切成 " + nc + " 張）" : "", nd ? nd + " 張流程圖（畫成圖片）" : ""].filter(Boolean).join("、"), txt = "", cls = "";
  if (ED.bgMsg) txt = ED.bgMsg;
  else if (ED.saving) txt = ED.auto ? "自動儲存中…" : "儲存中…";
  else if (UPL) txt = "⏳ 圖片上傳中（" + UPL + "）…";
  else if (ED.restore) { txt = "🕘 正在看「" + ED.restore + "」的舊版本：按「儲存」換成這一版；不要的話按「放棄修改」"; cls = "warn"; }
  else if (ED.dirty) {
    if (AS.pause === "conflict") { txt = "⏸ 自動存檔暫停：手冊剛剛被改過（按「儲存」處理）"; cls = "warn"; }
    else if (AS.pause === "img") { txt = "⏸ 自動存檔暫停：有圖片沒放好（按「儲存」）"; cls = "warn"; }
    else if (AS.fail) txt = "● 有修改還沒存進去（等一下自動再試）";
    else txt = AS.on ? "● 有修改：停手 3 秒就自動儲存" : "● 有還沒儲存的修改";
    if (ED_OCR_RUN && !cls) txt += "（背景辨識圖片裡的字中…）";
  } else if (todo) txt = "● 有 " + todo + "還沒做：按「儲存」就會做好";
  else if (ED_OCR_OFF && no) { txt = "⚠ 圖片裡的字還不能辨識：藥戰手冊的 Apps Script 專案要加「Drive API」服務（加好按「儲存」）"; cls = "warn"; }
  else if (ED_OCR_RUN || (no && !ED_OCR_OFF)) txt = "🔍 背景辨識圖片裡的字（還有 " + Math.max(no, ED_OCR_RUN) + " 張）…";
  else if (ED.savedAt) txt = "✅ 已" + (ED.auto ? "自動" : "") + "儲存（" + hhmm(ED.savedAt) + "，花了 " + (ED.saveMs / 1000).toFixed(1) + " 秒）";
  d.textContent = txt; d.className = "dirty" + (cls ? " " + cls : "");
  var sb = $("#edSave"); if (sb) sb.disabled = !!(ED.saving || UPL);
}
function changed() { markDirty(); refreshPreview(); ED.warners.forEach(function (fn) { fn(); }); }

function no6(n) { return h("span", { class: "no6" }, [n + "、"]); }
function lbl(n, text, extra) { return h("div", { class: "lbl" }, [n ? no6(n) : null, text, extra ? h("span", { html: " " + extra }) : null]); }
function hint(text) { return h("div", { class: "hint" }, [text]); }
function sizeSeg(cur, onPick) {
  var seg = h("div", { class: "seg" });
  YZ_SIZES.forEach(function (s, i) {
    var b = h("button", { class: s === cur ? "on" : "", title: s + (i === 0 ? "（LINE 規定的最小）" : i === YZ_SIZES.length - 1 ? "（LINE 規定的最大）" : "") }, [s]);
    b.onclick = function () { $$("button", seg).forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); onPick(s); };
    seg.appendChild(b);
  });
  return seg;
}
function rangeRow(min, max, val, unit, onInput) {
  var out = h("b", {}, [val + " " + unit]);
  var r = h("input", { type: "range", min: String(min), max: String(max), step: "10", value: String(val), style: "flex:1;min-width:140px" });
  r.oninput = function () { out.textContent = r.value + " " + unit; onInput(parseInt(r.value, 10)); };
  return h("div", { class: "rrow" }, [h("span", { class: "muted" }, ["最小 " + min]), r, h("span", { class: "muted" }, ["最大 " + max]), out]);
}
function confirmBtn(label, fn, cls) {
  var b = btn(label, function () {
    if (b.dataset.arm) { fn(); return; }
    b.dataset.arm = "1"; b.textContent = "再按一次確認"; b.classList.add("bad");
    setTimeout(function () { if (!b.isConnected) return; delete b.dataset.arm; b.textContent = label; b.classList.remove("bad"); }, 3000);
  }, cls || "sm");
  return b;
}

/* 圖片：縮到最長邊 1600、轉成 JPEG（LINE 一張圖不能超過 1 MB）；檔名改成亂碼，原檔名不保存 */
function shrinkImage(blob, cb, max, png) {   // png＝留透明背景、存成 PNG（第 28 批：大標題旁的符號）
  var fr = new FileReader();
  fr.onload = function () {
    var img = new Image();
    img.onload = function () {
      var w = img.naturalWidth || 1, hh = img.naturalHeight || 1, M = max || 1600, s = Math.min(1, M / Math.max(w, hh));
      var cv = document.createElement("canvas"); cv.width = Math.max(1, Math.round(w * s)); cv.height = Math.max(1, Math.round(hh * s));
      var g = cv.getContext("2d"); if (!png) { g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); } g.drawImage(img, 0, 0, cv.width, cv.height);
      var uri = png ? cv.toDataURL("image/png") : cv.toDataURL("image/jpeg", 0.85);
      cb(uri, { w: cv.width, h: cv.height, ow: w, oh: hh, bytes: Math.round((uri.length - (png ? 22 : 23)) * 0.75), obytes: blob.size || 0 });
    };
    img.onerror = function () { cb(null, { error: "這個檔案打不開，請換一張圖" }); };
    img.src = fr.result;
  };
  fr.onerror = function () { cb(null, { error: "讀不到這個檔案" }); };
  fr.readAsDataURL(blob);
}
/* 第 29 批：「辨識專用」的清楚版（加強照片辨識）：用原圖（上傳前的檔案、或手冊裡的圖）另外做一份，只拿去讀字、不保存
   ・放大：最長邊不到 2000 的放大到 2400 左右（最多 2 倍）；太大的縮到 3000（雲端硬碟的辨識：字要夠大、檔案 2 MB 以內）
   ・轉黑白、拉開對比（最暗的 1% 當全黑、最亮的 1% 當全白）：照片偏暗、偏黃、反光的字比較讀得出來；
     字和底只有顏色不一樣（亮度差不多，例如藍字印在紅底）：改用差最多的那個顏色，不然轉黑白字就不見了；
     大部分是暗的（深色底、白字，例如手機深色模式的截圖）：黑白反過來，變成白底黑字
   src：檔案（Blob）或 data: 網址 → Promise：{ b64, mime, w, h }（做不出來：null） */
var OCR_PREP_B64 = 2.55e6;   // 約 1.9 MB（雲端硬碟的辨識：圖 2 MB 以內比較穩；後端最多收 2 MB）
function ocrPrep(src) {
  return new Promise(function (ok) {
    var url = typeof src === "string" ? src : "", own = false;
    if (!url) { try { url = URL.createObjectURL(src); own = true; } catch (e) { ok(null); return; } }
    var img = new Image(), fin = function (v) { if (own) try { URL.revokeObjectURL(url); } catch (e) { /* 沒關係 */ } ok(v); };
    img.onload = function () {
      try {
        var w = img.naturalWidth, hh = img.naturalHeight, L = Math.max(w, hh);
        if (!w || !hh) { fin(null); return; }
        var sc = L < 2000 ? Math.min(2, 2400 / L) : Math.min(1, 3000 / L);
        if (w * sc * hh * sc > 9e6) sc = Math.sqrt(9e6 / (w * hh));
        var cw = Math.max(1, Math.round(w * sc)), ch = Math.max(1, Math.round(hh * sc));
        var cv = document.createElement("canvas"); cv.width = cw; cv.height = ch;
        var g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, cw, ch);
        g.imageSmoothingEnabled = true; try { g.imageSmoothingQuality = "high"; } catch (e) { /* 舊瀏覽器 */ }
        g.drawImage(img, 0, 0, cw, ch);
        var id = g.getImageData(0, 0, cw, ch), d = id.data, n = d.length / 4, i, v, c;
        var hs = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)];   // 紅、綠、藍、亮度
        for (i = 0; i < d.length; i += 4) { hs[0][d[i]]++; hs[1][d[i + 1]]++; hs[2][d[i + 2]]++; hs[3][(d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 8]++; }
        var cut = n * 0.01, rng = function (hh) {   // 最暗、最亮的 1% 不算：{ lo, hi }
          var lo = 0, hi = 255, acc = 0;
          for (acc = 0; lo < 255 && acc + hh[lo] <= cut; lo++) acc += hh[lo];
          for (acc = 0; hi > 0 && acc + hh[hi] <= cut; hi--) acc += hh[hi];
          return { lo: lo, hi: Math.max(lo, hi) };
        };
        var use = 3, R = rng(hs[3]);
        if (R.hi - R.lo < 40) for (c = 0; c < 3; c++) { var Rc = rng(hs[c]); if (Rc.hi - Rc.lo > R.hi - R.lo + 16) { use = c; R = Rc; } }   // 只有顏色不一樣（亮度差不多）的字：用差最多的那個顏色，不然轉黑白就看不到了
        var span = R.hi - R.lo, lut = new Uint8ClampedArray(256);
        for (i = 0; i < 256; i++) lut[i] = span >= 24 ? Math.round((i - R.lo) * 255 / span) : i;   // 對比本來就很小（幾乎一片空白）：不拉
        var mid = 0, acc2 = 0, hh = hs[use];
        for (mid = 0; mid < 255 && acc2 + hh[mid] < n / 2; mid++) acc2 += hh[mid];
        if (lut[mid] < 100) for (i = 0; i < 256; i++) lut[i] = 255 - lut[i];   // 大部分是暗的（深色底、白字）：黑白反過來（變成白底黑字，比較好辨識）
        for (i = 0; i < d.length; i += 4) { v = lut[use === 3 ? (d[i] * 77 + d[i + 1] * 150 + d[i + 2] * 29) >> 8 : d[i + use]]; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
        g.putImageData(id, 0, 0);
        var q = 0.9, uri = cv.toDataURL("image/jpeg", q), k = 0;
        while (uri.length > OCR_PREP_B64 && k++ < 5) {   // 太大：先降畫質，再縮小
          if (q > 0.75) q -= 0.08;
          else { var c2 = document.createElement("canvas"); c2.width = Math.round(cv.width * 0.8); c2.height = Math.round(cv.height * 0.8); c2.getContext("2d").drawImage(cv, 0, 0, c2.width, c2.height); cv = c2; }
          uri = cv.toDataURL("image/jpeg", q);
        }
        var m = /^data:(image\/jpeg);base64,(.*)$/.exec(uri);
        fin(m && m[2].length <= OCR_PREP_B64 ? { b64: m[2], mime: m[1], w: cv.width, h: cv.height } : null);
      } catch (e) { fin(null); }
    };
    img.onerror = function () { fin(null); };
    img.src = url;
  });
}
// 放圖的框：拖進來／選檔案／Ctrl+V 貼上 → 在瀏覽器縮好 → 上傳（o.kind 是上傳的種類）→ o.set(上傳結果 {url, raw, fid, fname}, 圖的資訊)
// o.upload(uri, info) 有給就用它自己上傳（動畫、目錄圖要傳好幾張）；回傳 Promise
function dropZone(o) {
  var el = h("div", { class: "drop", tabindex: "0" }), busy = false;
  var file = h("input", { type: "file", accept: o.accept || "image/*", style: "display:none" });
  function paint() {
    el.innerHTML = "";
    var cur = o.get();
    if (busy) el.appendChild(h("div", { class: "upl" }, ["⏳ 上傳中…（檔名會換成亂碼）"]));
    else if (cur) {
      el.appendChild(h("img", { src: o.shown ? o.shown() : cur, alt: "" }));
      var inf = o.info && o.info();
      el.appendChild(h("div", { class: "fn" }, [o.fnText ? o.fnText() : (inf && inf.w ? inf.w + "×" + inf.h + "，約 " + Math.round((inf.bytes || 0) / 1000) + " KB　" : "") + "存檔名稱（亂碼）：" + (o.fname && o.fname() || "—") + "　原檔名不保存"]));
    } else el.appendChild(h("div", {}, [o.empty || "把圖拖進來　／　點這裡之後按 Ctrl+V 貼上"]));
    el.appendChild(h("div", { style: "margin-top:6px;display:flex;gap:6px;justify-content:center" }, [
      btn(cur ? "換一個…" : "選擇檔案…", function (e) { e.stopPropagation(); if (!busy) file.click(); }),
      cur && o.clear && !busy ? btn("移除", function (e) { e.stopPropagation(); o.clear(); paint(); }) : null
    ]));
    el.appendChild(file);
  }
  function take(blob) {
    if (busy) { toast("上一張還在上傳，等一下"); return; }
    if (!blob || !(o.ok ? o.ok(blob) : /^image\/(jpeg|png|gif|webp|bmp)$/.test(blob.type || ""))) { toast(o.bad || "這不是圖片檔（JPEG、PNG、GIF、WebP）"); return; }
    var reader = o.reader || function (bl, cb) { shrinkImage(bl, cb, o.max || 1600); };
    reader(blob, function (uri, info) {
      if (!uri) { toast(info && info.error || "讀不到這個檔案"); return; }
      busy = true; paint();
      var prep = !o.upload && (o.kind || "圖片") === "圖片" ? ocrPrep(blob) : null;   // 第 29 批：內容的圖 → 同時用原圖做「辨識專用」的清楚版
      var job = o.upload ? o.upload(uri, info) : uploadUri(uri, o.kind || "圖片").then(function (r) { if (prep && r.fid) ocrSrcPut(r.fid, prep); o.set(r, info); });
      job.then(function () { busy = false; paint(); toast(o.done || "圖片放好了（已縮小、檔名換成亂碼）"); },
        function (e) {   // 沒放進去：用小視窗講清楚（只跳一下的提示容易漏看）
          busy = false; paint();
          modal({ title: "❌ 這張圖沒有放進去", lines: [(e && e.message) || "上傳失敗", "請再放一次。一直失敗的話：截圖給開發者，或在 LINE 打「手冊圖片檢查」。"], buttons: [{ label: "知道了", cls: "sm pri" }] });
        });
    });
  }
  file.onchange = function () { if (file.files[0]) take(file.files[0]); file.value = ""; };
  el.addEventListener("dragover", function (e) { e.preventDefault(); el.classList.add("hot"); });
  el.addEventListener("dragleave", function () { el.classList.remove("hot"); });
  el.addEventListener("drop", function (e) { e.preventDefault(); el.classList.remove("hot"); var f = e.dataTransfer && e.dataTransfer.files[0]; if (f) take(f); });
  el.addEventListener("focus", function () { el.classList.add("hot"); });
  el.addEventListener("blur", function () { el.classList.remove("hot"); });
  el.addEventListener("paste", function (e) {
    var items = (e.clipboardData && e.clipboardData.items) || [];
    for (var i = 0; i < items.length; i++) if (items[i].type.indexOf("image/") === 0) { e.preventDefault(); take(items[i].getAsFile()); return; }
    toast("剪貼簿裡沒有圖片");
  });
  paint();
  return { el: el, take: take, paint: paint };
}
// 上傳一張（data: 網址）→ {url, raw, fid, fname}。一次最多約 6 MB（Apps Script 一次收得下的大小）
var UPL = 0, UP_MAX_B64 = 8.4e6;
function uploadUri(uri, kind) {
  var m = /^data:([^;,]+);base64,(.*)$/.exec(uri || "");
  if (!m) return Promise.reject(new Error("圖片壞掉了"));
  if (m[2].length > UP_MAX_B64) return Promise.reject(new Error("檔案太大（上限約 6 MB）"));
  UPL++; dirtyPaint();
  return call("hbImg", [m[2], m[1], kind]).then(function (r) {
    UPL--; dirtyPaint();
    if (r && r.st === "lock") { logout("expired"); throw new Error("驗證過期了"); }
    if (!r || !r.ok || !r.url) throw new Error(r && r.err || "上傳失敗");
    if (r.warn) modal({ title: "⚠ 圖片放好了，但是……", lines: [r.warn, "在 LINE 打「手冊圖片檢查」可以再檢查一次、自動修好。"], buttons: [{ label: "知道了", cls: "sm pri" }] });
    return r;
  }, function (e) { UPL--; dirtyPaint(); throw e; });
}

/* ───────── 章元背景（第 25 批）：目錄圖（圖一）上這一章的位置，裁成 20:13 的圖 ─────────
   按「儲存」時：還沒做過、或目錄圖換了、或那一章的框移動了 → 在瀏覽器裁好、上傳（檔名亂碼、放手冊資料夾）。
   網頁的章、標題頁的背景，和 LINE 章、標題卡片最上面那張圖，都用這一張。開發者自己放的「章元圖」優先（不會被蓋掉）。 */
var BG_VER = "b2", BG_W = 1024, BG_H = 666;   // 20:13（跟 LINE 章元卡片上的圖一樣比例）
function bgSpotOf(cat, cid) {   // 目錄圖上連到這一章的地點（好幾個拿最大的）；沒有的話，拿連到這一章某個標題的
  var best = null, alt = null, ts = (ED.titles[cid] || []).map(function (t) { return "t:" + t.id; });
  _yzMapSpots_(cat).forEach(function (sp) {
    if (sp.to === "c:" + cid) { if (!best || sp.w * sp.h > best.w * best.h) best = sp; }
    else if (!alt && ts.indexOf(sp.to) >= 0) alt = sp;
  });
  return best || alt;
}
function bgKey(cat, sp) { return BG_VER + "|" + cat.fid + "|" + [sp.x, sp.y, sp.w, sp.h].map(function (v) { return Math.round(v * 10); }).join(","); }
function edBgNeed() {   // 有幾章的背景要（重）做（只算，不改東西）
  var cat = ED && ED.cat, n = 0;
  if (!cat || !cat.img || !cat.fid) return 0;
  ED.chapters.forEach(function (c) { var sp = bgSpotOf(cat, c.id); if (sp && (!c.bg || c.bg.k !== bgKey(cat, sp))) n++; });
  return n;
}
function edBgTodo() {   // 要（重）做背景的章：[{ c, sp, k }]。目錄圖上已經沒有這一章的地點：背景拿掉
  var cat = ED.cat, out = [];
  if (!cat || !cat.img || !cat.fid) return out;
  ED.chapters.forEach(function (c) {
    var sp = bgSpotOf(cat, c.id);
    if (!sp) { if (c.bg) { c.bg = null; markDirty(); } return; }
    var k = bgKey(cat, sp);
    if (!c.bg || c.bg.k !== k) out.push({ c: c, sp: sp, k: k });
  });
  return out;
}
function bgRect(W, H, sp) {   // 裁哪一塊（像素）：框的中心當中心、寬是框的 2.2 倍（最少整張的 24%）、20:13、不超出圖
  var ar = BG_W / BG_H, cx = (sp.x + sp.w / 2) / 100 * W, cy = (sp.y + sp.h / 2) / 100 * H;
  var w = Math.max(W * 0.24, Math.min(W, sp.w / 100 * W * 2.2)), hh = w / ar;
  if (hh > H) { hh = H; w = hh * ar; }
  if (w > W) { w = W; hh = w / ar; }
  return { x: Math.max(0, Math.min(W - w, cx - w / 2)), y: Math.max(0, Math.min(H - hh, cy - hh / 2)), w: w, h: hh };
}
function catSrcP() {   // 目錄圖的原始檔（瀏覽器裡的 data:／blob: 網址才畫得進畫布、讀得出像素）
  return new Promise(function (ok, bad) {
    var cat = ED.cat;
    if (ED.catLocal && ED.catLocal.fid === cat.fid) { ok(ED.catLocal.url); return; }
    if (!(HB && HB.cat && cat.fid && cat.fid === HB.cat.fid)) { bad(new Error("拿不到目錄圖")); return; }
    var u = catBlob(HB.cat, function () { var v = catBlob(HB.cat); if (v) ok(v); else bad(new Error("拿不到目錄圖")); });
    if (u) ok(u); else if (u === null) bad(new Error("拿不到目錄圖"));
  });
}
function loadImg(src) { return new Promise(function (ok, bad) { var im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { bad(new Error("目錄圖打不開")); }; im.src = src; }); }
function bgCut(img, sp) {
  var W = img.naturalWidth || 1, H = img.naturalHeight || 1, r = bgRect(W, H, sp), cv = document.createElement("canvas");
  cv.width = BG_W; cv.height = BG_H;
  var g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, BG_W, BG_H);
  g.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, BG_W, BG_H);
  return cv.toDataURL("image/jpeg", 0.84);
}
function edBgMake(onStep) {   // Promise：做了幾張
  var todo = edBgTodo();
  if (!todo.length) return Promise.resolve(0);
  return catSrcP().then(loadImg).then(function (img) {
    var i = 0;
    var next = function () {
      if (i >= todo.length) return todo.length;
      var it = todo[i++]; if (onStep) onStep(i, todo.length);
      return uploadUri(bgCut(img, it.sp), "章元背景").then(function (r) { it.c.bg = { img: r.url, fid: r.fid, k: it.k }; markDirty(); return next(); });
    };
    return next();
  });
}
function edChI(c) { var ico = _yzChIcons_(edHb())[c.id]; return ico ? Object.assign({}, c, { ico: ico }) : c; }   // 預覽用：章＋目錄圖上的圖示

/* ───────── 物品的形狀（第 26 批）：在框裡自動找物品的輪廓（shape.js），網頁滑到時只亮物品本身 ─────────
   選到一個地點、移動框、點選要亮的物品時：只算那一個（看得到綠色外框）；按「儲存」時：還沒算的都算好。算過的記著（同一張圖、同一個框不重算）。 */
var SHC = {}, ED_IMG = null;
function edShapeNeed() { var cat = ED && ED.cat; if (!cat || !cat.img || !cat.fid) return 0; return cat.spots.filter(function (s) { return shNeed(cat, s); }).length; }
function edCatImg() {   // 目錄圖（載好的 Image）：同一張圖只載一次
  var fid = ED.cat.fid;
  if (ED_IMG && ED_IMG.fid === fid) return ED_IMG.p;
  var p = catSrcP().then(loadImg);
  ED_IMG = { fid: fid, p: p };
  p.catch(function () { if (ED_IMG && ED_IMG.p === p) ED_IMG = null; });
  return p;
}
// 第 30 批：目錄圖是圖庫裡的一張、按鍵還在「別張圖的預設位置」（沒動過）→ 搬到這張圖上對應的物品（動過的不動）
function edSpotsMove(img) {
  var L = null; try { L = shLibOf(img); } catch (e) { L = null; }
  var mv = shLibMove(L, ED.cat.spots), ad = shLibAdd(L, ED.cat.spots);   // 第 32 批：這張圖多的按鍵（問卷）也自動加上
  if (mv.length || ad.length) {
    markDirty();
    var names = ad.map(function (id) { var s = edSpot(id); return s ? "「" + s.label + "」" : ""; }).join("");
    toast("📍 這張目錄圖認得：" + (mv.length ? "沒動過的 " + mv.length + " 個按鍵，已經搬到圖上對應的物品" : "") + (mv.length && ad.length ? "；" : "") + (ad.length ? "多了" + names + "按鍵" : "") + "（可以再拖）");
    if (ED.cur && ED.cur.kind === "map") setTimeout(function () { if (ED && TAB === "edit") renderEdit(); }, 0);
  }
  return mv.concat(ad);
}
function edShapeOne(img, s) {   // 算一個（算過的就拿出來）→ 寫進這個地點。第 27 批：圖一 → 用物品圖庫（整個物品）；別張圖 → 在框裡找
  var cat = ED.cat, k = shKey(cat, s), r = SHC[k];
  if (!r) { try { r = shLibFind(img, s) || shFind(img, s); } catch (e) { r = { r: [], n: 0 }; } SHC[k] = r; }
  s.shape = { k: k, b: shBox(s), r: r.r };
  if (r.nm) s.shape.nm = r.nm;   // 圖庫裡的物品名字（編輯器顯示「自動找到：法規書（整本）」用）
  return r;
}
function edShapeMake(onStep) {   // 按「儲存」：要（重）算的都算好。Promise：算了幾個
  var cat = ED.cat;
  if (!cat.spots.some(function (s) { return shNeed(cat, s); })) return Promise.resolve(0);
  return edCatImg().then(function (img) {
    edSpotsMove(img);   // 第 30 批：先把沒動過的按鍵搬到這張圖的位置（搬了，框就變了，下面照新的框算）
    var todo = cat.spots.filter(function (s) { return shNeed(cat, s); });
    return new Promise(function (ok) {
      var i = 0;
      var next = function () {
        if (i >= todo.length) { ok(todo.length); return; }
        var s = todo[i++]; if (onStep) onStep(i, todo.length);
        edShapeOne(img, s); markDirty();
        setTimeout(next, 0);   // 讓畫面有機會更新進度
      };
      next();
    });
  });
}

/* ───────── 圖片裡的字（第 27 批：照片裡的字也搜得到，例如時間表裡的「正班33分」）─────────
   用 Google 雲端硬碟內建的文字辨識（後端 hbOcr）。辨識出來的字只存成「搜尋用」（LINE 卡片、網頁上都不會顯示）。換了圖就重新辨識。
   第 28 批：不再卡在「儲存」裡（存檔快很多）——打開編輯器、放了新的圖，就在背景一張一張辨識（同時 2 張）；辨識好了算「有修改」，自動存檔會存。
   每張圖下面直接寫狀態（已辨識／辨識中／還沒辨識／辨識不了＋原因），可以按「重新辨識」。 */
var ED_OCR = {}, ED_OCR_BAD = {}, ED_OCR_OFF = "", ED_OCR_TOLD = false, ED_OCR_RUN = 0, ED_OCR_PAR = 2, ED_OCR_ELS = [];
// ED_OCR：fid → Promise（辨識中）；ED_OCR_BAD：fid → 辨識不了的原因（重新整理網頁、或按「重新辨識」再試）；ED_OCR_OFF：辨識功能還沒開（按「儲存」、「重新辨識」再試）
// 第 29 批：ED_OCR_SRC：fid → 剛放的圖用原圖做的「辨識專用」清楚版（Promise）；ED_OCR_STAGE：fid → 現在做到哪一步（pic＝用原圖的清楚版、boost＝字太少，加強版再讀一次）
var ED_OCR_SRC = {}, ED_OCR_STAGE = {}, ED_OCR_GC = 0;
function ocrSrcPut(fid, prep) { ED_OCR_SRC[fid] = prep; setTimeout(function () { if (ED_OCR_SRC[fid] === prep) delete ED_OCR_SRC[fid]; }, 15 * 60e3); }
function edPics() {   // 要辨識的圖：圖片、階梯裡的圖、分步動畫的每一格、文字裡的圖（已經上傳好的）
  var out = [];
  if (!ED) return out;
  ED.chapters.forEach(function (c) { (ED.titles[c.id] || []).forEach(function (t) { out = out.concat(_yzTitlePics_(t)); }); });
  return out.filter(function (p) { return p.fid && p.url && String(p.url).indexOf("data:") !== 0; });
}
function edOcrTodo() {   // 還沒辨識的圖（同一張圖只算一次；辨識不了的不算）：[fid]
  var seen = {}, out = [];
  edPics().forEach(function (p) { if (typeof p.ocr !== "string" && !ED_OCR_BAD[p.fid] && !seen[p.fid]) { seen[p.fid] = 1; out.push(p.fid); } });
  return out;
}
function ocrRes(r) {   // 後端的回答 → 字（不行就丟錯誤，e.code：noapi＝還沒開、scope＝權限不夠、busy＝Google 在忙）
  if (r && r.st === "lock") { logout("expired"); throw new Error("驗證過期了"); }
  if (r && r.gc) { ED_OCR_GC += r.gc; toast("🧹 以前留下來的「辨識暫存」文件：已經丟到垃圾桶 " + ED_OCR_GC + " 份"); }   // 辨識沒成功也會清
  if (!r || !r.ok) { var e = new Error(r && r.err || "後端沒有回答，等一下再按「重新辨識」"); e.code = r && r.code; throw e; }
  return String(r.text || "");
}
function ocrHard(e) { return !!(e && (e.code === "noapi" || e.code === "scope" || /驗證過期/.test(e.message || ""))); }   // 換方法也沒用的錯
function ocrWeak(t) { return String(t || "").replace(/[^0-9A-Za-z\u3400-\u9fff\uf900-\ufaff]/g, "").length < 6; }      // 讀到的字太少（不到 6 個字）
function ocrMerge(a, b) {   // 兩次讀到的字合在一起：a 全部，再加 b 裡 a 沒有的行（比對不管空白、全形半形、大小寫）
  a = String(a || ""); b = String(b || "");
  var sq = function (x) { return _yzNorm_(x).replace(/\s+/g, ""); }, A = sq(a), out = a ? a.split("\n") : [];
  b.split("\n").forEach(function (l) { var k = sq(l); if (k && A.indexOf(k) < 0) { out.push(l); A += "\n" + k; } });
  return out.join("\n").slice(0, 2000);
}
function ocrPlain(fid) { return call("hbOcr", [fid], { ms: 120000 }).then(ocrRes); }   // 一般辨識：後端把手冊裡的這張圖轉成文件來讀
function ocrViaPic(fid, prep) {   // 用清楚版辨識（prep：Promise → { b64, mime }）
  return Promise.resolve(prep).then(function (o) {
    if (!o) throw new Error("清楚版做不出來");
    ED_OCR_STAGE[fid] = "pic"; ocrPaint();
    return call("hbOcrPic", [fid, o.b64, o.mime], { ms: 120000 }).then(ocrRes);
  });
}
function ocrBoost(fid, t0) {   // 字太少（或按了「重新辨識」）：拿手冊裡這張圖 → 做清楚版 → 再讀一次，跟第一次的合在一起
  ED_OCR_STAGE[fid] = "boost"; ocrPaint();
  return call("hbPicData", [fid], { ms: 60000 }).then(function (r) {
    if (r && r.st === "lock") { logout("expired"); throw new Error("驗證過期了"); }
    if (!r || !r.ok || !r.b64) throw new Error(r && r.err || "拿不到這張圖");
    return ocrViaPic(fid, ocrPrep("data:" + r.mime + ";base64," + r.b64));
  }).then(function (t1) { return ocrMerge(t1, t0); }, function () { return t0; });   // 加強版不行：用第一次的
}
function edOcrAsk(fid, force) {   // Promise：這張圖裡的字（""＝沒有字）。同一張圖辨識中：等同一個。辨識好就寫進用到這張圖的每一個地方
  if (ED_OCR[fid]) return ED_OCR[fid];
  var src = ED_OCR_SRC[fid], p;
  delete ED_OCR_SRC[fid];
  if (src) p = ocrViaPic(fid, src).then(function (t) {   // 剛放的圖：先用原圖的清楚版；字太少再用一般的補
    return ocrWeak(t) ? ocrPlain(fid).then(function (t2) { return ocrMerge(t, t2); }, function () { return t; }) : t;
  }, function (e) { if (ocrHard(e)) throw e; return ocrPlain(fid); });
  else p = ocrPlain(fid).then(function (t) { return force || ocrWeak(t) ? ocrBoost(fid, t) : t; });
  ED_OCR[fid] = p;
  p.then(function (text) { delete ED_OCR[fid]; delete ED_OCR_STAGE[fid]; edPics().forEach(function (x) { if (x.fid === fid) x.ocr = text; }); }, function (e) {
    delete ED_OCR[fid]; delete ED_OCR_STAGE[fid];
    if (e && e.code === "noapi") ED_OCR_OFF = e.message; else ED_OCR_BAD[fid] = (e && e.message) || "後端沒有回答";
  });
  return p;
}
var ED_OCR_FORCE = {};   // 按了「重新辨識」的圖：一般的、加強版都做（第 29 批）
function edOcrPump() {   // 背景辨識：還沒辨識的圖，同時 2 張；辨識好一張就標「有修改」（自動存檔會存）
  if (!ED || ED_OCR_OFF) { ocrPaint(); dirtyPaint(); return; }
  var todo = edOcrTodo().filter(function (fid) { return !ED_OCR[fid]; });
  while (ED_OCR_RUN < ED_OCR_PAR && todo.length) {
    var fid = todo.shift(), force = !!ED_OCR_FORCE[fid];
    delete ED_OCR_FORCE[fid];
    ED_OCR_RUN++;
    edOcrAsk(fid, force).then(function () { if (ED) markDirty(); }, function (e) { if (e && e.code === "noapi") edOcrOff(e.message); }).then(function () { ED_OCR_RUN--; ocrPaint(); dirtyPaint(); setTimeout(edOcrPump, 200); });
  }
  ocrPaint(); dirtyPaint();
}
function edOcrNew(p) {   // 剛放好（或換了）一張圖：舊的字拿掉，在背景辨識新的
  delete p.ocr;
  if (p.fid) delete ED_OCR_BAD[p.fid];
  setTimeout(edOcrPump, 0);
}
function edOcrRetry(p) {   // 「重新辨識」（第 29 批：一般的、加強版都做，讀到的字合在一起）
  delete p.ocr; ED_OCR_OFF = "";
  if (p.fid) { delete ED_OCR_BAD[p.fid]; ED_OCR_FORCE[p.fid] = 1; }
  edPics().forEach(function (x) { if (x.fid === p.fid) delete x.ocr; });
  markDirty(); edOcrPump();
}
function edOcrOff(msg) {   // 辨識功能還沒開：第一次用小視窗講清楚，之後只寫在上面
  if (ED_OCR_TOLD) return;
  ED_OCR_TOLD = true;
  modal({ title: "⚠ 圖片裡的字還不能搜尋", lines: [msg + "（只要做一次）。", "加好以後，在編輯器按一次「儲存」（或圖下面的「重新辨識」），就會開始辨識每一張圖。其他的修改照樣儲存。"], buttons: [{ label: "知道了", cls: "sm pri" }] });
}
function ocrStat(p) {   // 這張圖的「圖片裡的字」狀態：{ t: 文字, c: 樣式, retry: 能不能重新辨識 }
  if (!p || !p.url) return null;
  if (!p.fid || String(p.url).indexOf("data:") === 0) return { t: "🔍 圖片裡的字：圖放好以後才會辨識", c: "" };
  if (typeof p.ocr === "string") return p.ocr ? { t: "🔍 圖片裡的字（搜尋找得到）：" + p.ocr.replace(/\s+/g, " ").slice(0, 60) + (p.ocr.length > 60 ? "…" : ""), c: "ok", retry: true, edit: "✏️ 看全部／改字" } : { t: "🔍 圖片裡的字：辨識過了，沒有讀到字（有字的話：按「重新辨識」，或自己打）", c: "", retry: true, edit: "✏️ 自己打字" };
  if (ED_OCR[p.fid]) return { t: ED_OCR_STAGE[p.fid] === "boost" ? "🔍 圖片裡的字：讀到的字太少，用加強版（放大、轉黑白）再讀一次…" : ED_OCR_STAGE[p.fid] === "pic" ? "🔍 圖片裡的字：用原圖的清楚版辨識中…" : "🔍 圖片裡的字：辨識中…", c: "" };
  if (ED_OCR_BAD[p.fid]) return { t: "⚠ 圖片裡的字讀不到：" + ED_OCR_BAD[p.fid], c: "warn", retry: true, edit: "✏️ 自己打字" };
  if (ED_OCR_OFF) return { t: "⚠ 圖片裡的字：還不能辨識（藥戰手冊的 Apps Script 專案要加「Drive API」服務）", c: "warn", retry: true };
  return { t: "🔍 圖片裡的字：還沒辨識（馬上會在背景做）", c: "" };
}
function ocrLine(p) {   // 每張圖下面那一行（辨識好了會自己更新）
  var el = h("div", { class: "ocrst" });
  el._p = p; ED_OCR_ELS.push(el); ocrPaint1(el);
  return el;
}
function ocrPaint1(el) {
  var st = ocrStat(el._p); el.innerHTML = "";
  if (!st) { el.hidden = true; return; }
  el.hidden = false; el.className = "ocrst" + (st.c ? " " + st.c : "");
  el.appendChild(h("span", {}, [st.t]));
  if (st.retry) el.appendChild(h("button", { class: "btn sm ocrre", type: "button", onclick: function (e) { e.preventDefault(); e.stopPropagation(); edOcrRetry(el._p); } }, ["重新辨識"]));
  if (st.edit) el.appendChild(h("button", { class: "btn sm ocred", type: "button", onclick: function (e) { e.preventDefault(); e.stopPropagation(); ocrEdit(el._p); } }, [st.edit]));
}
// 第 29 批：看全部、自己改圖片裡的字（只用在搜尋；辨識錯的改掉、少的自己補）。同一張圖用在好幾個地方：一起改
function ocrEdit(p) {
  if (!p || !p.fid) return;
  var bx = h("div", { class: "modal", role: "dialog", "aria-modal": "true" }), close = function () { bx.remove(); };
  var ta = h("textarea", { class: "ocrta", rows: "10", maxlength: "2000", "aria-label": "圖片裡的字" });
  ta.value = typeof p.ocr === "string" ? p.ocr : "";
  var done = function () {
    var v = String(ta.value || "").split("\n").map(function (l) { return l.replace(/[ \t\u00A0\u3000]+/g, " ").trim(); }).filter(Boolean).join("\n").slice(0, 2000);
    edPics().forEach(function (x) { if (x.fid === p.fid) x.ocr = v; });
    p.ocr = v; delete ED_OCR_BAD[p.fid];
    close(); markDirty(); ocrPaint(); dirtyPaint();
    toast(v ? "圖片裡的字改好了（存檔以後搜尋找得到）" : "圖片裡的字清掉了");
  };
  bx.appendChild(h("div", { class: "dlg ocrdlg" }, [
    h("h3", {}, ["🔍 圖片裡的字"]),
    h("div", { class: "dlg-p" }, [h("p", {}, ["只用在搜尋（LINE、網頁的卡片上不會出現）。讀錯的字直接改，少的自己補，一行一段。"])]),
    ta,
    h("div", { class: "dlg-b" }, [btn("好了", done, "sm pri"), btn("取消", close, "sm")])
  ]));
  document.body.appendChild(bx);
  try { ta.focus(); } catch (e) { /* 沒關係 */ }
  bx.onkeydown = function (e) { if (e.key === "Escape") close(); };
}
function ocrPaint() { ED_OCR_ELS = ED_OCR_ELS.filter(function (el) { return el.isConnected; }); ED_OCR_ELS.forEach(ocrPaint1); }

/* ───────── 自動存檔（第 28 批：有修改就自動存，12 秒內存好）─────────
   停手 3 秒就存；一直在改的話，最晚第一個修改後 8 秒也會存（存一次大約 2～5 秒）。最上面的「自動存檔」可以關掉（記在這台電腦）。
   不會自動存的時候：圖片還在上傳、有圖片沒放好、存不進去（手冊剛被別人改過）、正在看舊版本、連不上（等一下自動再試）。
   自動存檔存好以後不重畫編輯器（不打斷正在打字的人）。 */
var AS = { on: true, t: null, first: 0, pause: "", fail: 0 }, AS_IDLE = 3000, AS_MAX = 8000;
function asInit() { try { AS.on = localStorage.getItem("yz_autosave") !== "0"; } catch (e) { AS.on = true; } AS.pause = ""; AS.first = 0; AS.fail = 0; clearTimeout(AS.t); AS.t = null; }
function asSet(on) {
  AS.on = !!on;
  try { localStorage.setItem("yz_autosave", on ? "1" : "0"); } catch (e) { /* 記不住就算了 */ }
  if (on) asKick(); else { clearTimeout(AS.t); AS.t = null; }
  dirtyPaint();
}
function asKick() {   // 有修改了：排一次自動存檔
  if (!ED || !AS.on || AS.pause || !ED.dirty) return;
  var now = Date.now(); if (!AS.first) AS.first = now;
  clearTimeout(AS.t); AS.t = setTimeout(asRun, Math.max(200, Math.min(AS_IDLE, AS.first + AS_MAX - now)));
}
function asRun() {
  AS.t = null;
  if (!ED || !AS.on || AS.pause || !ED.dirty) return;
  if (ED.saving || UPL || ED.bgMsg) { AS.t = setTimeout(asRun, 1200); return; }   // 上一次還在存、圖片還在上傳：等一下再看
  if (edLocalImgs()) { AS.pause = "img"; dirtyPaint(); return; }                    // 有圖片沒放好：不自動存（按「儲存」會問你）
  saveEd(false, true);
}
function asFail(msg, auto) {   // 沒存進去：自動存的話，等一下自動再試（5、10、15… 秒，最多 1 分鐘）
  AS.fail++; dirtyPaint();
  if (!auto || AS.fail === 1) toast("❌ 沒有存進去：" + msg + (auto ? "（等一下會自動再試）" : ""));
  if (AS.on && ED && ED.dirty) { clearTimeout(AS.t); AS.t = setTimeout(asRun, Math.min(60000, 5000 * AS.fail)); }
}

/* ───────── 🕘 舊版本（第 28 批：自動存檔很快，改錯的也很快存進去 → 每 10 分鐘留一份，最多 50 份）─────────
   列出來 → 選一份「載入」→ 編輯器換成那一份（還沒存；看一看）→ 按「儲存」才換成那一份（換之前會先留一份現在的），不要就按「放棄修改」。 */
function verOpen() {
  if (!ED) return;
  if (ED.saving || UPL) { toast("等存好（圖片上傳好）再看舊版本"); return; }
  var bx = h("div", { class: "modal", role: "dialog", "aria-modal": "true" }), close = function () { bx.remove(); };
  var list = h("div", { class: "verlist" }, [h("div", { class: "muted" }, ["讀取中…"])]);
  var note = h("p", {}, ["每 10 分鐘留一份「存之前的樣子」，最多 50 份（放在手冊資料夾裡的「舊版本」，檔名亂碼）。選一份「載入」：編輯器先換成那一份讓你看，按「儲存」才算數。"]);
  var clr = btn("🧹 全部清空", function () {   // 第 31 批：想清就按（丟到雲端硬碟的垃圾桶，30 天內救得回來）
    modal({ title: "清空全部的舊版本？", lines: ["全部丟到雲端硬碟的垃圾桶（30 天內還救得回來，之後 Google 自動刪掉）。", "現在手冊的內容不受影響；之後的存檔一樣會再留新的舊版本。"], buttons: [{ label: "不要", cls: "sm" }, { label: "🧹 清空", cls: "sm bad", fn: function () {
      clr.disabled = true;
      call("hbVer", ["clear"]).then(function (r) {
        clr.disabled = false;
        if (!r || !r.ok) { toast("❌ " + (r && r.err || "清不掉")); return; }
        toast("🧹 清掉了 " + r.n + " 份舊版本（丟到雲端硬碟的垃圾桶）");
        list.innerHTML = ""; list.appendChild(h("div", { class: "muted" }, ["舊版本都清掉了。之後的存檔會再留新的。"]));
      }, function (e) { clr.disabled = false; toast("❌ " + e.message); });
    } }] });
  }, "sm bad verclr");
  var dlg = h("div", { class: "dlg verdlg" }, [h("h3", {}, ["🕘 舊版本"]), h("div", { class: "dlg-p" }, [note]), list,
    h("div", { class: "dlg-b" }, [clr, h("span", { style: "flex:1" }), btn("關閉", close, "sm")])]);
  bx.appendChild(dlg); document.body.appendChild(bx);
  bx.onkeydown = function (e) { if (e.key === "Escape") close(); };
  call("hbVer", ["list"]).then(function (r) {
    if (r && r.st === "lock") { close(); logout("expired"); return; }
    list.innerHTML = "";
    if (!r || !r.ok) { list.appendChild(h("div", { class: "muted" }, ["❌ " + (r && r.err || "拿不到舊版本")])); return; }
    if (r.days !== undefined) note.textContent = "每 10 分鐘留一份「存之前的樣子」，" + (r.days > 0 ? "留 " + r.days + " 天（過了自動丟到雲端硬碟的垃圾桶；最新 " + (r.keep || 3) + " 份一定留）、" : "") + "最多 50 份（放在手冊資料夾裡的「舊版本」，檔名亂碼）。選一份「載入」：編輯器先換成那一份讓你看，按「儲存」才算數。留幾天：「管理 → 設定」可以改。";
    clr.style.display = r.list.length ? "" : "none";
    if (!r.list.length) { list.appendChild(h("div", { class: "muted" }, ["還沒有舊版本（第一次存檔、或 10 分鐘後的存檔，才會留第一份）。"])); return; }
    r.list.forEach(function (v) {
      var label = v.at;
      list.appendChild(h("div", { class: "verrow" }, [
        h("div", { class: "vermeta" }, [h("b", {}, [v.at]), h("span", { class: "muted" }, ["　" + (v.who || "") + (v.why ? "（" + v.why + "）" : "") + "　" + v.kb + " KB"])]),
        btn("載入這一版", function () {
          if (ED.dirty && !confirmLoss()) return;
          call("hbVer", ["get", v.id]).then(function (g) {
            if (!g || !g.ok) { toast("❌ " + (g && g.err || "拿不到這一版")); return; }
            close(); edLoadVer(g.m, label);
          }, function (e) { toast("❌ " + e.message); });
        }, "sm")
      ]));
    });
  }, function (e) { list.innerHTML = ""; list.appendChild(h("div", { class: "muted" }, ["❌ " + e.message])); });
}
function confirmLoss() { toast("你有還沒存的修改：先按「儲存」或「放棄修改」，再載入舊版本"); return false; }
function edLoadVer(m, label) {   // 編輯器換成舊版本（還沒存）
  var cur = ED.cur, mode = ED.mode;
  edReset(m);
  ED.chapters.forEach(function (c) { if (c.bg) c.bg = null; });   // 章元背景：舊的那幾張可能已經丟到垃圾桶了 → 拿掉，儲存時重做
  ED.restore = label; ED.dirty = true; AS.pause = "restore"; clearTimeout(AS.t);
  edPick(cur, mode); renderEdit(); dirtyPaint();
  toast("已載入「" + label + "」的舊版本：按「儲存」才算數");
}

/* ───────── 📢 跑馬燈（第 25 批）：開關、內容（一行一段）、速度 ───────── */
function edMq() {   // 還沒設定過：照網頁現在的預設（藥戰手冊 →［這一頁］→ 內部資料，請勿外傳）
  if (!ED.cat.mq) ED.cat.mq = { on: true, items: mqDefault(), speed: "mid" };
  return ED.cat.mq;
}
function mqPreview(q) {   // 首頁、章的頁面各一條（跟網頁上一模一樣，會跑）
  var box = h("div", {});
  if (q.on === false) { box.appendChild(h("div", { class: "muted" }, ["（跑馬燈關掉了：網頁上下都不放）"])); return box; }
  var conf = { on: true, items: (q.items || []).length ? q.items : ["藥戰手冊", MQ_PAGE], speed: q.speed || "mid" };
  [["首頁", ED.cat.title || "藥師調劑台"], ["章的頁面（例：" + ((ED.chapters[0] || {}).name || "章名") + "）", (ED.chapters[0] || {}).name || "章名"]].forEach(function (x) {
    box.appendChild(h("div", { class: "mqpvl" }, [x[0]]));
    box.appendChild(marquee(mqWordsOf(conf, x[1]), "pv", conf.speed));
  });
  return box;
}
function renderMqForm(f) {
  var q = edMq();
  f.appendChild(h("h3", { style: "font-size:16px" }, ["📢 跑馬燈"]));
  f.appendChild(hint("網頁最上面那一條會跑的字（章、標題頁上下各一條）。手機開了「減少動態效果」的人，會停住不跑。LINE 沒有跑馬燈。改完會自動儲存（也可以按「儲存」）。"));
  var pv = h("div", { class: "mqpv" });
  var paint = function () { pv.innerHTML = ""; pv.appendChild(mqPreview(q)); };
  var on = h("input", { type: "checkbox", id: "mqOn" }); on.checked = q.on !== false;
  on.onchange = function () { q.on = on.checked; changed(); paint(); };
  f.appendChild(h("label", { class: "mck" }, [on, h("span", {}, [h("b", {}, ["顯示跑馬燈"]), h("span", { class: "muted mcn" }, ["　關掉：網頁上下都不放跑馬燈"])])]));
  f.appendChild(lbl("", "內容（一行一段，每段前面會自動加「→」；最多 8 段、每段 30 個字）"));
  var ta = h("textarea", { class: "ta", id: "mqText", style: "min-height:130px" }); ta.value = (q.items || []).join("\n");
  ta.oninput = function () { q.items = ta.value.split(/\r?\n/).map(function (x) { return x.trim().slice(0, 30).replace(/[\uD800-\uDBFF]$/, "").trim(); }).filter(Boolean).slice(0, 8); changed(); paint(); };
  f.appendChild(ta);
  f.appendChild(h("div", { class: "addrow" }, [
    btn("＋插入「" + MQ_PAGE + "」", function () {
      var a = ta.selectionStart || 0, b = ta.selectionEnd || 0, v = ta.value;
      ta.value = v.slice(0, a) + MQ_PAGE + v.slice(b); ta.focus(); ta.selectionStart = ta.selectionEnd = a + MQ_PAGE.length; ta.oninput();
    }),
    confirmBtn("還原成預設", function () { q.on = true; q.items = mqDefault(); q.speed = "mid"; changed(); renderForm(); })
  ]));
  f.appendChild(hint("「" + MQ_PAGE + "」會自動換成那一頁的名字：首頁＝" + (ED.cat.title || "藥師調劑台") + "、章和標題的頁面＝章名、搜尋頁＝搜尋。"));
  f.appendChild(lbl("", "速度"));
  var seg = h("div", { class: "seg", id: "mqSpeed" });
  [["slow", "慢"], ["mid", "一般"], ["fast", "快"]].forEach(function (x) {
    var b = h("button", { class: (q.speed || "mid") === x[0] ? "on" : "", type: "button", "data-v": x[0] }, [x[1]]);
    b.onclick = function () { q.speed = x[0]; $$("button", seg).forEach(function (y) { y.classList.toggle("on", y === b); }); changed(); paint(); };
    seg.appendChild(b);
  });
  f.appendChild(seg);
  f.appendChild(lbl("", "預覽（跟網頁上一樣）"));
  f.appendChild(pv); paint();
  renderSymForm(f);
}
/* ───────── 🔰 大標題旁的符號（第 28 批）：以前大標題兩邊是波浪符號（拿掉了）；可以放自己的符號（例如藥劑部的標誌），沒放就只有字 ───────── */
function renderSymForm(f) {
  f.appendChild(h("h3", { style: "font-size:16px;margin-top:26px" }, ["🔰 大標題旁的符號"]));
  f.appendChild(hint("網頁上章、標題頁的大標題左邊，可以放一個小符號（例如以後的藥劑部標誌）。沒放就只有標題的字。建議用正方形、去背的 PNG（透明的地方會照樣透明），會縮成約 64 px。LINE 沒有這個符號。"));
  var pv = h("div", { class: "sympv", "aria-hidden": "true" });
  var paintPv = function () {
    var s = ED.cat.sym;
    pv.innerHTML = "";
    if (s && s.url) pv.appendChild(h("img", { src: s.url, alt: "" }));
    pv.appendChild(h("b", {}, [(ED.chapters[0] || {}).name || "章名"]));
  };
  var dz = dropZone({
    kind: "符號", accept: "image/png,image/jpeg,image/webp,image/gif",
    reader: function (bl, cb) { shrinkImage(bl, cb, 256, true); },
    get: function () { return ED.cat.sym && ED.cat.sym.url; }, fname: function () { return ED.cat.sym && ED.cat.sym.fname; },
    info: function () { return ED.cat.sym && ED.cat.sym.info; },
    empty: "把符號的圖拖進來　／　點這裡之後按 Ctrl+V 貼上（可以不放）",
    done: "符號放好了（檔名換成亂碼）",
    set: function (r, info) { ED.cat.sym = { url: r.url, fid: r.fid, fname: r.fname, ar: _yzAR_(info.w, info.h), info: info }; changed(); paintPv(); },
    clear: function () { ED.cat.sym = null; changed(); paintPv(); }
  });
  f.appendChild(dz.el);
  f.appendChild(lbl("", "樣子（深色的大標題列）"));
  f.appendChild(pv); paintPv();
}

/* ───────── 最上面的工具列 ───────── */
// 還沒放好的圖（上傳失敗、還是 data: 網址）：存的時候後端會丟掉，先提醒
function edLocalImgs() { var n = 0; JSON.stringify(edHb(), function (k, v) { if (typeof v === "string" && v.indexOf("data:") === 0) n++; return v; }); return n; }
function saveEd(force, auto) {   // auto＝自動存檔（不跳小視窗、存好不重畫）
  if (!ED || ED.saving) return;
  if (UPL) { if (!auto) toast("還有圖片在上傳，等上傳好再存"); return; }
  var nl = edLocalImgs();
  if (nl && !force) {
    if (auto) { AS.pause = "img"; dirtyPaint(); return; }
    modal({ title: "有 " + nl + " 張圖沒有放好", lines: ["那幾張圖沒有上傳成功，存的時候會被拿掉。要先重新放一次嗎？"], buttons: [{ label: "先不存", cls: "sm" }, { label: "照樣儲存", cls: "sm pri", fn: function () { saveEd(true); } }] });
    return;
  }
  clearTimeout(AS.t); AS.t = null;
  if (!auto && AS.pause === "img") AS.pause = "";
  ED.saving = true; ED.auto = !!auto;
  if (ED_OCR_OFF && !auto) { ED_OCR_OFF = ""; setTimeout(edOcrPump, 0); }   // 圖片文字辨識沒開的話：按「儲存」再試一次（開好了就會做）
  dirtyPaint();
  var t0 = Date.now();
  var drawStep = function () {   // 第 40 批：改過的流程圖畫成 PNG、上傳（整張＋LINE 用的那張）
    var dl = edDrawTodo(auto);
    if (!dl.length) { saveSend(force, auto, t0); return; }
    ED.bgMsg = "流程圖畫成圖片中（0／" + dl.length + "）…"; dirtyPaint();
    edDrawMake(dl, function (i, n) { ED.bgMsg = "流程圖畫成圖片中（" + i + "／" + n + "）…"; dirtyPaint(); }).then(function () { ED.bgMsg = ""; saveSend(force, auto, t0); }, function (e) {
      ED.bgMsg = ""; toast("⚠ 流程圖沒有畫成圖片（" + ((e && e.message) || "畫不出來") + "）：其他的照樣儲存，下次儲存會再試一次"); saveSend(force, auto, t0);
    });
  };
  var bgStep = function () {
    var nbg = edBgTodo().length;   // 章元背景（目錄圖上每一章的位置）：目錄圖或框改了才重做
    if (!nbg) { drawStep(); return; }
    ED.bgMsg = "做章元背景中（0／" + nbg + "）…"; dirtyPaint();
    edBgMake(function (i, n) { ED.bgMsg = "做章元背景中（" + i + "／" + n + "）…"; dirtyPaint(); }).then(function () { ED.bgMsg = ""; drawStep(); }, function (e) {
      ED.bgMsg = ""; toast("⚠ 章元背景沒做好（" + e.message + "）：其他的照樣儲存，下次儲存會再試一次"); drawStep();
    });
  };
  var shapeStep = function () {
    var nsh = edShapeNeed();   // 物品的形狀（滑到時只亮物品本身）：框或圖改了才重找
    if (!nsh) { bgStep(); return; }
    ED.bgMsg = "找物品的形狀（0／" + nsh + "）…"; dirtyPaint();
    edShapeMake(function (i, n) { ED.bgMsg = "找物品的形狀（" + i + "／" + n + "）…"; dirtyPaint(); }).then(function () { ED.bgMsg = ""; bgStep(); }, function (e) {
      ED.bgMsg = ""; toast("⚠ 物品的形狀沒找好（" + e.message + "）：先亮整個框，下次儲存會再試一次"); bgStep();
    });
  };
  // 第 35 批：LINE 用的切法跟現在的規則不一樣（很寬的圖改切三張）→ 先用原始檔重新切好、上傳（檔名一樣亂碼），再存
  if (!_yzMapNeedCut_(ED.cat)) { shapeStep(); return; }
  var c0 = ED.cat;
  ED.bgMsg = "重新切目錄圖（LINE 用）…"; dirtyPaint();
  catSrcP().then(function (src) { return catPartsUp(src, { w: c0.w, h: c0.h }); }).then(function (parts) {
    if (ED && ED.cat === c0 && parts.length) catPartsSet(c0, parts);
    ED.bgMsg = ""; shapeStep();
  }, function (e) { ED.bgMsg = ""; toast("⚠ 目錄圖沒有重新切好（" + (e && e.message || "切圖失敗") + "）：LINE 先照舊的切法，下次儲存會再試一次"); shapeStep(); });
}
function saveSend(force, auto, t0) {
  if (!ED) return;
  var cur = ED.cur, mode = ED.mode, sent = edJson(), why = ED.restore ? "restore" : auto ? "auto" : "";
  t0 = t0 || Date.now();
  call("hbSave", [sent, ED.rev, !!force, why]).then(function (r) {
    if (!ED) return;
    ED.saving = false;
    if (r && r.st === "lock") { dirtyPaint(); logout("expired"); return; }
    if (r && r.conflict) {
      AS.pause = "conflict"; dirtyPaint();
      modal({ title: "存不進去：手冊剛剛被改過", lines: ["在你編輯的時候，手冊被改過了（可能是別的開發者，或在 LINE 裡改的）。自動存檔先暫停。", "「用我的蓋掉」：別人剛改的會不見。「放棄我的」：重新載入最新的內容，你這次的修改不見。"], buttons: [
        { label: "先不要", cls: "sm" }, { label: "放棄我的、重新載入", cls: "sm", fn: function () { AS.pause = ""; refreshForEdit(); } }, { label: "用我的蓋掉", cls: "sm bad", fn: function () { AS.pause = ""; saveEd(true); } }] });
      return;
    }
    if (!r || !r.ok || !r.data) { asFail(r && r.err || "後端沒有回應", auto); return; }
    AS.fail = 0;
    var still = edJson() !== sent;   // 存的時候又改了：那些修改保留在編輯器裡
    HB = r.data;
    ED.rev = HB.rev; ED.base = HB; ED.savedAt = Date.now(); ED.saveMs = Date.now() - t0;
    var wasRestore = !!ED.restore; ED.restore = null; if (AS.pause === "restore") AS.pause = "";
    if (still) { AS.first = 0; markDirty(); if (!auto) toast("已儲存（存的時候你又改了一些，那些還沒存）"); }
    else if (auto && !wasRestore) { ED.dirty = false; AS.first = 0; dirtyPaint(); }   // 自動存檔：不重畫（不打斷正在打字的人）
    else { edReset(); edPick(cur, mode); ED.savedAt = Date.now(); ED.saveMs = Date.now() - t0; renderEdit(); toast(wasRestore ? "✅ 已換成那一版（換之前的樣子也留了一份）" : "✅ 已儲存：LINE 和網頁都會看到新的內容"); }
    if (r.line === 0 && !ED.lineWarned) { ED.lineWarned = true; toast("⚠ 存好了，但 LINE 那邊還是舊的：最晚 30 分鐘後才會看到"); }
    if (TAB !== "edit") drawWeb();
    edOcrPump();
  }, function (e) { if (!ED) return; ED.saving = false; asFail(e.message, auto); });
}
function edPick(cur, mode) {   // 存完、重新載入以後，盡量停在原本選的地方
  var gone = !cur || (cur.kind === "title" ? !edTitle(cur.id) : cur.kind === "ch" ? !edCh(cur.id) : cur.kind === "map" ? !!(cur.id && !edSpot(cur.id)) : cur.kind === "mq" || cur.kind === "qz" ? false : true);
  if (!gone) { ED.cur = cur; ED.mode = mode; }
}
function refreshForEdit() {
  call("hbData", []).then(function (x) {
    if (!x || x.st === "lock") { logout("expired"); return; }
    if (!x.data) { toast("❌ 重新載入失敗"); return; }
    var cur = ED && ED.cur, mode = ED && ED.mode;
    HB = x.data; edReset(); edPick(cur, mode); renderEdit(); toast("已重新載入最新的內容");
  }, function (e) { toast("❌ " + e.message); });
}
function discardEd() {
  if (!ED.dirty) { toast("沒有要放棄的修改"); return; }
  modal({ title: "放棄還沒儲存的修改？", lines: ["會回到上一次儲存的內容（已經上傳的圖片會留在雲端資料夾，但不會出現在手冊裡）。"], buttons: [{ label: "不要", cls: "sm" }, { label: "放棄修改", cls: "sm bad", fn: function () {
    var cur = ED.cur, mode = ED.mode; AS.pause = ""; clearTimeout(AS.t); AS.t = null; AS.fail = 0;   // 正在看舊版本、存不進去暫停的：回到現在的內容（自動存檔也恢復）
    edReset(); edPick(cur, mode); renderEdit(); toast("已還原成上一次儲存的內容");
  } }] });
}
function renderToolbar() {
  var tb = $("#edtb"); tb.innerHTML = "";
  var isT = ED.cur.kind === "title";
  var vb = h("button", { class: "btn sm verb", id: "edVer", type: "button", title: "每 10 分鐘留一份舊的（最多 50 份）：改錯了可以換回去", onclick: verOpen }, ["🕘 舊版本"]);
  tb.appendChild(vb);   // 第 28 批：放在最左上角
  var sb = btn("儲存", function () { saveEd(false); }, "pri"); sb.id = "edSave";
  tb.appendChild(sb);
  tb.appendChild(btn("放棄修改", discardEd));
  var ac = h("input", { type: "checkbox", id: "edAuto" }); ac.checked = AS.on; ac.onchange = function () { asSet(ac.checked); };
  tb.appendChild(h("label", { class: "asck", title: "有修改就自動儲存：停手 3 秒就存，一直在改的話最晚 8 秒（記在這台電腦）" }, [ac, h("span", {}, ["自動存檔"])]));
  tb.appendChild(h("span", { id: "edDirty", class: "dirty", "aria-live": "polite" }, [""]));
  tb.appendChild(h("span", { class: "vsep" }));
  if (ED.mode === "qz") tb.appendChild(h("span", { class: "tblabel qetb" }, ["📋 問卷：用中間的「💾 儲存」（存進問卷試算表；左邊的「儲存」是手冊的）"]));
  else tb.appendChild(h("span", { class: "tblabel" }, ["新增內容"]));
  if (ED.mode !== "qz") [["text", "＋文字"], ["ladder", "＋階梯式內容"], ["table", "＋表格"], ["img", "＋圖片"], ["draw", "＋流程圖"], ["link", "＋網址連結"], ["anim", "＋動畫"], ["drug", "＋藥品"]].forEach(function (x) {
    var b = h("button", { class: "btn sm addb", "data-k": x[0], title: isT ? x[0] === "drug" ? "從補藥神器的藥品資料庫找藥放進來（LINE 收起來、網頁直接打開；不顯示位置）" : x[0] === "draw" ? "流程圖（第 40 批）：自己畫框、箭頭、說明框；存檔時自動畫成圖片（LINE、網頁、Word 都看得到）" : x[0] === "link" ? "網址連結（第 40 批）：放外部網站的連結（顯示的字＋網址）。讀的人點了：電腦開小視窗、手機開新分頁、LINE 用 LINE 的瀏覽器開" : (x[0] === "text" ? "新的文字塊會接在你點選的那一塊後面（沒點選就放最後面）" : "游標在文字裡的話，文字會從游標那一行切開，新的放在中間；不然接在你點選的那一塊後面") : "先在左邊選一個標題" }, [x[1], x[0] === "draw" || x[0] === "link" ? h("span", { class: "newb" }, ["新"]) : null]);
    if (!isT) b.disabled = true;
    b.addEventListener("mousedown", function (e) { e.preventDefault(); });   // 按下去，文字框不會失去游標（才知道要從哪裡切開）
    b.onclick = function () { addBlock(x[0]); };
    tb.appendChild(b);
  });
  if (ED.mode !== "qz" && ED_CLIP) {   // 第 32 批：「📋 複製」了某一塊 → 這裡可以貼（放在點選的那一塊後面；沒點選就放最後面）
    var pb2 = h("button", { class: "btn sm addb pstb", type: "button", title: isT ? "把複製的「" + ED_CLIP.what + "」放在你點選的那一塊後面（沒點選就放最後面）" : "先在左邊選一個標題" }, ["📌 貼上整塊（" + ED_CLIP.blocks.length + "）"]);
    if (!isT) pb2.disabled = true;
    pb2.addEventListener("mousedown", function (e) { e.preventDefault(); });
    pb2.onclick = edPasteBlocks;
    tb.appendChild(pb2);
  }
  var fm = $("#edfmt"); if (fm) fm.style.display = isT ? "" : "none";   // 文字格式那一排：只有在編輯「標題」時才出現
  tb.appendChild(h("span", { class: "sp" }));
  var pb = h("button", { class: "btn sm" + (PV.open ? " on" : ""), id: "pvToggle", type: "button", title: "預覽會浮在畫面上，可以拖來拖去、拉大拉小、放到最大" }, [PV.open ? "👁 預覽視窗：開" : "👁 打開預覽視窗"]);
  pb.onclick = function () { PV.open = !PV.open; pvSync(); renderToolbar(); if (PV.open) refreshPreview(); };
  tb.appendChild(pb);
  dirtyPaint();
}

/* ───────── 左：章節清單（「🔑 關鍵字」第 25 批拿掉了）───────── */
function renderTree() {
  var c1 = $("#edc1"); c1.innerHTML = "";
  var seg = h("div", { class: "seg", style: "display:flex;margin-bottom:8px" });
  [["ch", "章節"], ["map", "🖼 目錄圖"], ["mq", "📢 跑馬燈"], ["qz", "📋 問卷"]].forEach(function (p) {   // 第 32 批：問卷、考試
    var b = h("button", { class: ED.mode === p[0] ? "on" : "", style: "flex:1;padding-left:3px;padding-right:3px;white-space:nowrap;font-size:12px", "data-m": p[0] }, [p[1]]);
    b.onclick = function () {
      if (ED.mode === p[0]) return;
      if (ED.mode === "ch") ED.lastCh = ED.cur;   // 離開「章節」前，記住看到哪裡，回來時接著看
      ED.mode = p[0]; ED.ab = null;
      if (p[0] === "map") ED.cur = { kind: "map", id: "" };
      else if (p[0] === "mq") { ED.cur = { kind: "mq", id: "" }; ED.view = "web"; }   // 跑馬燈只有網頁有：預覽切到「網頁」
      else if (p[0] === "qz") { ED.cur = { kind: "qz", id: "" }; ED.view = "web"; }   // 問卷：預覽先看「網頁」（藥師作答的樣子）
      else {
        var lc = ED.lastCh;
        ED.cur = lc && ((lc.kind === "title" && edTitle(lc.id)) || (lc.kind === "ch" && edCh(lc.id))) ? lc : edFirst();
        if (ED.cur.kind === "map") ED.mode = "map";
      }
      renderEdit();
    };
    seg.appendChild(b);
  });
  c1.appendChild(seg);
  if (ED.mode === "map") { renderMapTree(c1); return; }
  if (ED.mode === "qz") { qeTree(c1); return; }
  if (ED.mode === "mq") { c1.appendChild(hint("跑馬燈：網頁最上面那一條會跑的字（章、標題頁上下各一條）。下面還有「🔰 大標題旁的符號」。在中間改內容、速度，存好才會生效（會自動存）。LINE 沒有跑馬燈。")); return; }
  c1.appendChild(lbl("", "章元（" + ED.chapters.length + " ／ 一排最多 12 張）"));
  ED.chapters.forEach(function (c) {
    var chosen = ED.cur.kind === "ch" ? ED.cur.id === c.id : (edTitle(ED.cur.id) || {}).ch === c.id;
    var bgu = _yzChBg_(c);
    c1.appendChild(h("div", { class: "chI" + (ED.cur.kind === "ch" && ED.cur.id === c.id ? " on" : ""), onclick: function () { selectNode("ch", c.id); } }, [
      bgu ? h("div", { class: "th thimg", style: "background-image:" + cssUrl(bgu) }) : h("div", { class: "th thi" }, [chIco(c, edHb())]),
      h("div", {}, [h("div", { class: "t2" }, [c.name || "（還沒有章名）"]), h("div", { class: "t1" }, [(ED.titles[c.id] || []).length + " 個標題"])])
    ]));
    if (chosen) {
      var tsc = ED.titles[c.id] || [], lvc = _yzTLvs_(tsc);   // 第 43 批：標題分層（像目錄：第 2、3 層往右縮；第 1 層有子標題＝粗體）
      tsc.forEach(function (t, k) {
        var lv = lvc[k], hd = lv === 1 && _yzTKids_(tsc, k, lvc) > 0;
        c1.appendChild(h("div", { class: "chT lv" + lv + (hd ? " hd" : "") + (ED.cur.kind === "title" && ED.cur.id === t.id ? " on" : ""), "data-lv": String(lv), onclick: function () { selectNode("title", t.id); } }, [t.name || "（還沒有標題）"]));
      });
      c1.appendChild(h("div", { style: "padding:4px 0 6px 26px" }, [btn("＋新增標題", function () { addTitle(c.id); })]));
    }
  });
  c1.appendChild(h("div", { style: "padding-top:8px" }, [h("button", { class: "btn sm", disabled: ED.chapters.length >= YZ_CAROUSEL_MAX, onclick: addChapter }, ["＋新增章元"])]));
}
function selectNode(kind, id) { ED.cur = { kind: kind, id: id }; ED.mode = kind === "map" ? "map" : kind === "mq" ? "mq" : kind === "qz" ? "qz" : "ch"; ED.ab = null; renderEdit(); }
function addTitle(cid) {
  var t = { id: "t" + Date.now(), ch: cid, name: "（新標題）", size: "giga", ww: 760, note: "", page: "", blocks: [] };
  ED.titles[cid].push(t); markDirty(); selectNode("title", t.id);
}
function addChapter() {
  if (ED.chapters.length >= YZ_CAROUSEL_MAX) return;
  var n = ED.chapters.length + 1, id = "c" + Date.now();
  ED.chapters.push({ id: id, no: String(n), name: "（新章元）", intro: "", img: "", fid: "", size: ED.cfg.chSize });
  ED.titles[id] = []; markDirty(); selectNode("ch", id);
}

/* ───────── 中：表單 ───────── */
function renderForm() {
  var f = $("#edc2"); f.innerHTML = ""; ED.warners = [];
  RTE.cur = null; rteClosePop(); rteBarSync();   // 舊的文字框都被換掉了：格式列先熄掉，點進新的文字框才又亮起來
  ED.mapUi = null;
  if (ED.cur.kind === "map") return renderMapForm(f);
  if (ED.cur.kind === "mq") return renderMqForm(f);
  if (ED.cur.kind === "qz") return qeForm(f);
  if (ED.cur.kind === "ch") return renderChForm(f, edCh(ED.cur.id));
  var t = edTitle(ED.cur.id);
  if (!t) return;
  renderTitleForm(f, t, edCh(t.ch));
}
function renderChForm(f, c) {
  var ts = ED.titles[c.id] || [];
  f.appendChild(h("h3", { style: "font-size:16px" }, ["章元：" + (c.name || "（還沒有章名）")]));
  // 背景：目錄圖上這一章的位置（按「儲存」時自動做）；自己放的圖優先
  f.appendChild(lbl("三", "背景（藥師看到的章、標題頁的背景，和 LINE 卡片最上面那張圖）"));
  var bsp = ED.cat && ED.cat.img ? bgSpotOf(ED.cat, c.id) : null, have = _yzChBg_(c);
  var why = c.img ? "現在用的是你自己放的圖（下面那張）。拿掉它，就改用目錄圖上這一章的位置。" :
    !ED.cat || !ED.cat.img ? "還沒有目錄圖：先到「🖼 目錄圖」放圖一，按「儲存」，每一章的背景就會自動做好。" :
    !bsp ? "目錄圖上沒有連到這一章的地點：背景先用青綠色。到「🖼 目錄圖」新增一個連到這一章的地點，按「儲存」就會自動做好。" :
    c.bg && c.bg.k === bgKey(ED.cat, bsp) ? "用目錄圖上「" + (bsp.label || "這一章") + "」那個框的位置（放大）。目錄圖換了、或框移動了，按「儲存」會自動重做。" :
    "按「儲存」時，會自動用目錄圖上「" + (bsp.label || "這一章") + "」那個框的位置做好。";
  f.appendChild(h("div", { class: "bgrow" }, [have ? h("div", { class: "bgth", style: "background-image:" + cssUrl(have) }) : h("div", { class: "bgth none" }, ["還沒有"]), h("div", { class: "bgwhy" }, [why])]));
  f.appendChild(lbl("三", "自己換一張背景（可以不放）"));
  f.appendChild(hint("放了就用你放的這張，不用目錄圖裁的。拖進來、選檔案，或複製後在下面框裡按 Ctrl+V 貼上。圖裡面不要有病人資料、人臉。"));
  var dz = dropZone({
    kind: "章元封面",
    get: function () { return c.img; }, info: function () { return c.info; }, fname: function () { return c.fname; },
    set: function (r, info) { c.img = r.url; c.fid = r.fid; c.fname = r.fname; c.info = info; markDirty(); renderTree(); refreshPreview(); },
    clear: function () { c.img = ""; c.fid = ""; c.info = null; markDirty(); renderTree(); refreshPreview(); }
  });
  f.appendChild(dz.el);
  f.appendChild(lbl("三", "章名（純文字）"));
  var nm = h("input", { class: "in", value: c.name }); nm.oninput = function () { c.name = nm.value; markDirty(); renderTree(); refreshPreview(); }; f.appendChild(nm);
  f.appendChild(lbl("三", "簡介（一兩行，章元卡片上會顯示）"));
  var it = h("textarea", { class: "ta", style: "min-height:56px" }); it.value = c.intro || ""; it.oninput = function () { c.intro = it.value; changed(); }; f.appendChild(it);
  f.appendChild(hint("卡片的大小在預覽視窗裡調（所有章元共用同一個大小）。"));
  f.appendChild(h("div", { class: "lbl" }, ["這一章的標題（" + ts.length + "）"]));
  var lvf = _yzTLvs_(ts);   // 第 43 批：分層的往右縮
  ts.forEach(function (t, k) { f.appendChild(h("div", { class: "chT lv" + lvf[k], style: "padding-left:" + (8 + (lvf[k] - 1) * 18) + "px;border:1px solid var(--line);border-radius:8px;margin:4px 0", onclick: function () { selectNode("title", t.id); } }, [t.name || "（還沒有標題）"])); });
  f.appendChild(h("div", { style: "display:flex;gap:6px;flex-wrap:wrap;margin-top:12px" }, [
    btn("＋新增標題", function () { addTitle(c.id); }), btn("▲ 往前移", function () { moveChapter(c.id, -1); }), btn("▼ 往後移", function () { moveChapter(c.id, 1); }),
    confirmBtn("刪除這一章", function () {
      var i = ED.chapters.indexOf(c); ED.chapters.splice(i, 1); delete ED.titles[c.id]; renumber(); markDirty();
      if (ED.chapters.length) selectNode("ch", ED.chapters[Math.min(i, ED.chapters.length - 1)].id); else renderEdit();
    })
  ]));
}
function moveChapter(id, d) {
  var i = ED.chapters.indexOf(edCh(id)), j = i + d; if (j < 0 || j >= ED.chapters.length) return;
  var x = ED.chapters[i]; ED.chapters[i] = ED.chapters[j]; ED.chapters[j] = x; renumber(); markDirty(); renderEdit();
}
function renderTitleForm(f, t, ch) {
  var tsl = ED.titles[ch.id] || [], tlv = _yzTLvs_(tsl)[tsl.indexOf(t)] || 1;
  f.appendChild(h("div", { class: "muted", style: "font-size:12.5px" }, [[ch.name].concat(_yzTPath_(tsl, t).map(function (x) { return x.name || "（還沒有標題）"; })).join(" › ") + " ›" + (tlv > 1 ? "　（第 " + tlv + " 層）" : "")]));
  f.appendChild(lbl("四", "標題（純文字）"));
  var ti = h("input", { class: "in", value: t.name, placeholder: "例：一、一般藥品補充" });
  ti.oninput = function () { t.name = ti.value; markDirty(); renderTree(); refreshPreview(); };
  f.appendChild(ti);
  f.appendChild(hint("標題只能是純文字：貼上帶格式的文字，格式會自動拿掉。"));

  f.appendChild(lbl("五", "內容（文字、階梯式、表格、圖片，可以混著放，順序可以調）"));
  f.appendChild(hint("新增請用最上面第一排的按鈕。游標在文字裡：表格、圖片、動畫、階梯式會放在游標那一行的後面（文字自動從那裡切開）；不然接在你點選的那一塊後面。文字的格式（粗體、顏色、標題…）用第二排的按鍵。"));
  var list = h("div", { id: "blklist" }); t.blocks.forEach(function (b, i) { list.appendChild(blockEditor(t, b, i)); });
  f.appendChild(list);
  if (!t.blocks.length) f.appendChild(h("div", { class: "muted", style: "padding:10px;border:1px dashed #C7CED7;border-radius:10px;text-align:center" }, ["這個標題還沒有內容，按最上面的「＋文字」「＋階梯式內容」「＋表格」「＋圖片」開始。"]));
  list.addEventListener("focusin", function (e) {
    var blk = e.target.closest && e.target.closest(".blk"); if (!blk) return;
    ED.ab = +blk.getAttribute("data-i");
    $$(".blk", list).forEach(function (x) { x.classList.toggle("act", x === blk); });
  });

  f.appendChild(lbl("六", "備註（會用淡黃色框，放在內容最下面；沒寫字就不顯示）"));
  var nt = h("textarea", { class: "ta", style: "min-height:60px" }); nt.value = t.note || ""; nt.oninput = function () { t.note = nt.value; changed(); if (typeof pgNote === "function") pgNote(); }; f.appendChild(nt);
  var pgOut = h("span", { class: "muted", id: "pgOut" });
  function pgNote() { var x = _yzPageText_(t.page); pgOut.textContent = x ? (_yzNoteHas_(t.note) ? "→ 備註框裡會多一個青綠色小框：📖 藥戰手冊頁數　" + x + "（備註文字和小框中間空一行）" : "→ 只顯示一個青綠色小框：📖 藥戰手冊頁數　" + x + "（備註沒寫字：不會有黃色的備註框）") : "（不填，就不會顯示這個小框）"; }
  var pgIn = h("input", { class: "in", id: "pgIn", value: t.page || "", placeholder: "例：14　或　14–15　或　12、15", style: "max-width:230px" });
  pgIn.oninput = function () { t.page = pgIn.value; pgNote(); changed(); };
  pgNote();
  f.appendChild(h("div", { class: "pgbox" }, [
    h("div", { class: "lbl", style: "margin-top:6px" }, ["📖 藥戰手冊頁數", h("span", { class: "tag warn", style: "margin-left:6px" }, ["備註裡新增的欄位"]), mkEl(15)]),
    h("div", { style: "display:flex;gap:10px;align-items:center;flex-wrap:wrap" }, [pgIn, pgOut]),
    hint("這一段對應紙本「藥戰手冊」的第幾頁。LINE 卡片、網頁的備註框、搜尋結果都會帶出來；也可以在 LINE 打「第14頁」反過來找。")
  ]));

  // 第 27 批：🔗 連結（互相連結）
  f.appendChild(lbl("七", "🔗 連結（互相連結：A 連到 B，B 那一頁最下面也會自動出現連回 A 的連結）"));
  f.appendChild(linkPanel(t, ch));

  // 第 29 批：LINE 好幾張卡片怎麼排：滑動式（左右滑）／一頁一頁（往下排）；沒選＝照「管理 → 設定」的預設
  f.appendChild(lbl("八", "📱 LINE：好幾張卡片怎麼排"));
  f.appendChild(laySeg(t, false));

  f.appendChild(h("div", { style: "display:flex;gap:6px;flex-wrap:wrap;margin-top:14px" }, [
    btn("▲ 往前移", function () { moveTitle(t, -1); }), btn("▼ 往後移", function () { moveTitle(t, 1); }),
    btn("← 往左（上一層）", function () { lvTitle(t, -1); }, "sm tlvl"), btn("→ 往右（變子標題）", function () { lvTitle(t, 1); }, "sm tlvr"),   // 第 43 批：標題分層
    btn("＋ 子標題", function () { addSubTitle(t); }, "sm tlvsub"),
    btn("📋 複製這一篇", function () { edCopyTitle(t); }, "sm cpt"),   // 第 32 批：整篇複製一份，放到選的章
    confirmBtn("刪除這個標題", function () { var a = ED.titles[ch.id], i = a.indexOf(t); edTitleDrop(a, i); markDirty(); a.length ? selectNode("title", a[Math.min(i, a.length - 1)].id) : selectNode("ch", ch.id); })
  ]));
  f.appendChild(hint("分層（最多 3 層，像目錄）：「→ 往右」＝變成上一個標題的子標題；「← 往左」＝回到上一層。子標題會跟著一起動（往前移、往後移、往右、往左）；刪掉一個標題，它的子標題往上一層。"));
}
// 第 27 批：這個標題的「連結」一區：這一篇連到哪裡（文字裡的「連結」行）、誰連到這一篇（自動）、＋ 加一個連結
function linkPanel(t, ch) {
  var outBox = h("span", { class: "lkchips" }), backBox = h("span", { class: "lkchips" }), backTip = h("span", { class: "muted" });
  var chip = function (label, go, cls) { var x = h("button", { class: "lkchip" + (cls ? " " + cls : ""), type: "button" }, [label]); x.onclick = go; return x; };
  function paint() {
    if (!outBox.isConnected && outBox.parentNode) return;
    var hb = edHb(), ids = [];
    (t.blocks || []).forEach(function (b) { if (b.t === "text") _yzGoIds_(b.v).forEach(function (g) { if (ids.indexOf(g) < 0) ids.push(g); }); });
    outBox.innerHTML = ""; backBox.innerHTML = "";
    ids.forEach(function (g) {
      var tg = _yzGoTarget_(hb, g, ch.id);
      outBox.appendChild(tg ? chip((tg.kind === "c" ? "📚 " : "→ ") + tg.label, function () { selectNode(tg.kind === "c" ? "ch" : "title", tg.id); }) : chip("⚠ 有一個連結找不到了（可能被刪掉）", function () { toast("在文字裡找到那一行「🔗 連結到」，重新選一個"); }, "bad"));
    });
    if (!ids.length) outBox.appendChild(h("span", { class: "muted" }, ["（還沒有。用下面的「＋ 加一個連結」，或在文字裡按第二排的「🔗 連結」）"]));
    var back = _yzBacklinks_(hb, [t.id, ch.id], t.id);
    back.forEach(function (x) { backBox.appendChild(chip("↩ " + _yzBackLabel_(x, ch.id), function () { selectNode("title", x.t.id); })); });
    if (!back.length) backBox.appendChild(h("span", { class: "muted" }, ["（還沒有）"]));
    backTip.textContent = back.length ? "→ 會自動出現在這一頁最下面（LINE：最後一張卡片下面的按鈕）" : "";
  }
  var sel = h("select", { class: "in lksel", style: "width:auto;max-width:100%", "aria-label": "要連到哪一章、哪個標題" }, [h("option", { value: "" }, ["（選要連到的標題或整章）"])].concat(rteGoOpts(edTitleChoices().filter(function (x) { return x.id !== t.id; }))));
  var add = btn("＋ 加一個連結", function () {
    if (!sel.value) { toast("先選要連到哪裡"); return; }
    var last = t.blocks[t.blocks.length - 1];
    if (last && last.t === "text") last.v = String(last.v || "").replace(/\s+$/, "") + "\n[go=" + sel.value + "]";
    else t.blocks.push({ t: "text", v: "[go=" + sel.value + "]" });
    renderForm(); changed(); toast("加好了：放在最後一塊文字的最下面（LINE、網頁上是一個可以點的按鈕列）");
  }, "sm pri lkadd");
  paint();
  ED.warners.push(paint);   // 文字裡加了、刪了「連結」：馬上更新
  return h("div", { class: "lkpanel" }, [
    h("div", { class: "lkrow" }, [h("b", {}, ["這一篇連到："]), outBox]),
    h("div", { class: "lkrow" }, [h("b", {}, ["連到這一篇的："]), backBox, backTip]),
    h("div", { class: "lkrow" }, [sel, add])
  ]);
}
// 第 43 批：往前／往後＝連子標題一起搬，跟同一層的前一個／後一個（也連它的子標題）換位置；已經是那一層的第一個／最後一個：不動
function edTSpan(a, i, lvs) { var e = i + 1; while (e < a.length && lvs[e] > lvs[i]) e++; return e; }   // 第 i 個標題＋它的子標題：[i, e)
function moveTitle(t, d) {
  var a = ED.titles[t.ch], i = a.indexOf(t); if (i < 0) return;
  edTLvFix(a);
  var lvs = _yzTLvs_(a), L = lvs[i], e = edTSpan(a, i, lvs), blk;
  if (d < 0) {
    var k = i - 1; while (k >= 0 && lvs[k] > L) k--;
    if (k < 0 || lvs[k] < L) { toast(L > 1 ? "已經是這一層的第一個了（要搬出去：先按「← 往左」）" : "已經是第一個了"); return; }
    blk = a.splice(i, e - i); Array.prototype.splice.apply(a, [k, 0].concat(blk));
  } else {
    if (e >= a.length || lvs[e] < L) { toast(L > 1 ? "已經是這一層的最後一個了（要搬出去：先按「← 往左」）" : "已經是最後一個了"); return; }
    var e2 = edTSpan(a, e, lvs);
    blk = a.splice(e, e2 - e); Array.prototype.splice.apply(a, [i, 0].concat(blk));
  }
  markDirty(); renderEdit();
}
function edTLvFix(a) { var lvs = _yzTLvs_(a); a.forEach(function (x, k) { if (lvs[k] > 1) x.lv = lvs[k]; else delete x.lv; }); }   // 層級照順序修好（存檔時後端也會修）
function lvTitle(t, d) {   // ← → ：這個標題連子標題一起往左／往右一層
  var a = ED.titles[t.ch], i = a.indexOf(t); if (i < 0) return;
  edTLvFix(a);
  var lvs = _yzTLvs_(a), L = lvs[i], e = edTSpan(a, i, lvs), k, mx = L;
  for (k = i; k < e; k++) mx = Math.max(mx, lvs[k]);
  if (d > 0) {
    if (i === 0) { toast("第一個標題不能往右（要先有一個上層的標題）"); return; }
    if (L > lvs[i - 1]) { toast("已經是上一個標題的子標題了"); return; }
    if (mx >= YZ_TLV_MAX) { toast("最多 " + YZ_TLV_MAX + " 層：" + (L >= YZ_TLV_MAX ? "已經是第 " + YZ_TLV_MAX + " 層了" : "它的子標題已經到第 " + YZ_TLV_MAX + " 層了")); return; }
  } else if (L <= 1) { toast("已經是第 1 層了"); return; }
  for (k = i; k < e; k++) { var nv = lvs[k] + d; if (nv > 1) a[k].lv = nv; else delete a[k].lv; }
  markDirty(); renderEdit();
}
function addSubTitle(t) {   // ＋ 子標題：放在這個標題（和它的子標題）的後面，比它多一層
  var a = ED.titles[t.ch], i = a.indexOf(t); if (i < 0) return;
  edTLvFix(a);
  var lvs = _yzTLvs_(a), L = lvs[i];
  if (L >= YZ_TLV_MAX) { toast("最多 " + YZ_TLV_MAX + " 層：這個標題已經是第 " + YZ_TLV_MAX + " 層了"); return; }
  var nt = { id: "t" + Date.now(), ch: t.ch, name: "（新的子標題）", size: "giga", ww: 760, note: "", page: "", blocks: [], lv: L + 1 };
  a.splice(edTSpan(a, i, lvs), 0, nt); markDirty(); selectNode("title", nt.id);
}
function edTitleDrop(a, i) {   // 刪掉第 i 個標題：它的子標題往上一層（不會掛到別人底下）
  edTLvFix(a);
  var lvs = _yzTLvs_(a), e = edTSpan(a, i, lvs);
  for (var k = i + 1; k < e; k++) { var nv = lvs[k] - 1; if (nv > 1) a[k].lv = nv; else delete a[k].lv; }
  a.splice(i, 1);
}

/* ───────── 內容塊（文字／階梯式／表格／圖片） ───────── */
var KIND_NAME = { text: "文字", ladder: "階梯式內容", table: "表格", img: "圖片", anim: "動畫", drug: "藥品卡片", link: "網址連結" };
function blockEditor(t, b, i) {
  var del = function () { t.blocks.splice(i, 1); ED.ab = null; renderForm(); changed(); };
  var delBtn = (b.t === "ladder" || b.t === "table" || b.t === "anim" || b.t === "drug" || b.t === "link" || b.draw) ? confirmBtn("✕", del, "sm bad") : btn("✕", del, "sm bad");
  // 第 27 批：「📄 換下一張」＝LINE 從這一塊開始放到下一張卡片（網頁照常一整頁）；第一塊不用
  var brkLbl = function () { return b.brk ? "✂ LINE 從這裡換下一張 ✓" : "📄 換下一張"; };
  var brkBtn = i > 0 ? btn(brkLbl(), function () {
    if (b.brk) delete b.brk; else b.brk = true;
    brkBtn.textContent = brkLbl(); brkBtn.classList.toggle("on", !!b.brk); brkBtn.setAttribute("aria-pressed", b.brk ? "true" : "false");
    var el = brkBtn.closest(".blk"); if (el) el.classList.toggle("brk", !!b.brk);
    changed();
  }, "sm brkb" + (b.brk ? " on" : "")) : null;
  if (brkBtn) { brkBtn.title = "LINE：從這一塊開始，放到下一張卡片（太擠的時候用；網頁不受影響）。再按一次取消。"; brkBtn.setAttribute("aria-pressed", b.brk ? "true" : "false"); }
  // 第 27 批：整塊縮排（任何內容都能縮排：文字、階梯式、表格、圖片、動畫）。⇤＝往左、⇥＝往右，最多 3 層；文字裡每一行的縮排照舊用第二排的 ⇤ ⇥
  var indTxt = function (n) { return n ? "整塊縮排 " + n + " 層" : "整塊縮排"; };
  var indLbl = h("span", { class: "indn" + (_yzBlockInd_(b) ? " on" : ""), title: "這一塊整塊往右縮幾層（LINE、網頁都一樣）" }, [indTxt(_yzBlockInd_(b))]);
  var setInd = function (d) {
    var n = Math.max(0, Math.min(YZ_IND_MAX, _yzBlockInd_(b) + d));
    if (n) b.ind = n; else delete b.ind;
    indLbl.textContent = indTxt(n); indLbl.classList.toggle("on", !!n);
    var el = indLbl.closest(".blk"); if (el) { if (n) el.setAttribute("data-ind", String(n)); else el.removeAttribute("data-ind"); }
    decB.disabled = n <= 0; incB.disabled = n >= YZ_IND_MAX;
    changed();
  };
  var decB = btn("⇤", function () { setInd(-1); }), incB = btn("⇥", function () { setInd(1); });
  decB.title = "整塊往左（少縮排一層）"; incB.title = "整塊往右縮排一層（例如圖片、表格要對齊上面縮排的文字）";
  decB.setAttribute("aria-label", "整塊往左"); incB.setAttribute("aria-label", "整塊往右縮排");
  decB.className += " indb"; incB.className += " indb";
  decB.disabled = !_yzBlockInd_(b); incB.disabled = _yzBlockInd_(b) >= YZ_IND_MAX;
  // 第 28 批：「⤴ 併到上一塊」：文字、圖片併進上一塊文字（不用一塊一塊調；縮排照舊）
  var mrg = mergeOk(t, i) ? btn("⤴ 併到上一塊", function () { mergeUp(t, i); }, "sm mrgb") : null;
  if (mrg) mrg.title = mergeTip(t, i);
  // 第 41 批：這一塊顯示在哪裡：LINE、網頁都顯示／只在 LINE／只在網頁（例如：照片只給 LINE、流程圖只給網頁）
  var visSel = h("select", { class: "in sm visb", title: "這一塊顯示在哪裡：LINE、網頁都顯示／只在 LINE／只在網頁（例如照片只給 LINE 看、流程圖只給網頁看）。搜尋也一樣：LINE 搜不到只在網頁的字，反過來也是", "aria-label": "這一塊顯示在哪裡" },
    [["", "💬🌐 LINE、網頁都顯示"], ["line", "💬 只在 LINE"], ["web", "🌐 只在網頁"]].map(function (x) { return h("option", { value: x[0] }, [x[1]]); }));
  visSel.value = b.only === "line" || b.only === "web" ? b.only : "";
  visSel.onchange = function () {
    var v = visSel.value;
    if (v && !bk41Ok()) { visSel.value = b.only === "line" || b.only === "web" ? b.only : ""; bk41Warn("只在 LINE／只在網頁"); return; }
    if (v) b.only = v; else delete b.only;
    renderForm(); changed();   // 重畫：顏色、「⤴ 併到上一塊」（顯示的地方不一樣就不能併）跟著變
    toast(v === "line" ? "💬 這一塊只在 LINE 顯示：網頁看不到，網頁搜尋也找不到" : v === "web" ? "🌐 這一塊只在網頁顯示：LINE 看不到，LINE 搜尋也找不到" : "這一塊 LINE、網頁都顯示");
  };
  if (brkBtn && b.only === "web") brkBtn.hidden = true;
  var cpB = btn("📋 複製", function () { edClipBlocks(t, [i]); }, "sm cpb");   // 第 32 批：整塊複製 → 別的標題（或這一篇別的地方）按最上面的「📌 貼上整塊」
  cpB.title = "複製這一塊（文字、圖片、表格…格式都帶著）：到要放的標題，點一下某一塊，按最上面的「📌 貼上整塊」（會放在那一塊後面）";
  var head = h("div", { class: "bh" }, [(b.t === "img" && b.draw ? "流程圖" : KIND_NAME[b.t]) + "　#" + (i + 1), visSel, h("span", { class: "sp" }),
    mrg, indLbl, decB, incB, brkBtn, cpB, btn("▲", function () { moveBlock(t, i, -1); }), btn("▼", function () { moveBlock(t, i, 1); }), delBtn]);
  var body = h("div", { class: "bb2" });
  var rte = null;
  if (b.t === "text") {
    rte = rteCreate({ value: b.v || "", titles: edTitleChoices, onChange: function (v) { b.v = v; changed(); },
      pics: function () { if (!b.pics || typeof b.pics !== "object") b.pics = {}; return b.pics; },   // 第 28 批：文字裡的圖
      onPics: function (p) { if (p) edOcrNew(p); changed(); }, picInfo: ocrLine,
      tbls: function () { if (!b.tbls || typeof b.tbls !== "object") b.tbls = {}; return b.tbls; },   // 第 29 批：文字裡的表格
      tblEdit: function (id, done) { edTblModal(t, b, id, done); },
      imgUp: function (file, cb, swap) { if (!swap && _yzImgIds_(b.v).length >= ED_TEXT_PICS_MAX) { toast("一塊文字最多放 " + ED_TEXT_PICS_MAX + " 張圖：請放到下一塊"); cb(null); return; } edImgUp(file, cb); } });
    body.appendChild(rte.el);
    body.appendChild(hint("選取文字 → 按最上面第二排的按鍵（粗體、顏色、大小）。整行的變化（標題、項目符號、編號、標註、分隔線…）：游標放在那一行，按對應的鍵，再按一次就取消。Enter 換行，清單會自動接下一個符號；Ctrl+Z 復原。圖片可以直接放在文字裡：游標放在那一行，按「🖼 圖片」（或把圖拖進來、Ctrl+V 貼上），圖會放在那一行下面、跟那一行一樣縮排。要做像法條那樣一層一層的編號，請用「＋階梯式內容」。"));
  } else if (b.t === "ladder") body.appendChild(ladderEditor(t, b));
  else if (b.t === "table") body.appendChild(tableEditor(b, t));
  else if (b.t === "anim") body.appendChild(animEditor(t, b));
  else if (b.t === "drug") body.appendChild(drugEditor(t, b));   // 第 29 批：藥品卡片
  else if (b.t === "link") body.appendChild(linkEditor(b));   // 第 40 批（一起做的）：網址連結
  else if (b.t === "img" && b.draw) {   // 第 40 批：流程圖
    body.appendChild(drawEditor(t, b));
    var dcap = h("input", { class: "in", value: b.cap || "", placeholder: "圖說（可以不填；寫在流程圖下面）", style: "margin-top:6px" });
    dcap.oninput = function () { b.cap = dcap.value; changed(); };
    body.appendChild(dcap);
  } else {
    var dz = dropZone({
      kind: "圖片",
      get: function () { return b.url; }, info: function () { return b.info; }, fname: function () { return b.fname; },
      set: function (r, info) { b.url = r.url; b.fid = r.fid; b.fname = r.fname; b.info = info; b.ar = _yzAR_(info.w, info.h); edOcrNew(b); changed(); },
      clear: function () { b.url = ""; b.fid = ""; b.info = null; delete b.ocr; changed(); ocrPaint(); }
    });
    body.appendChild(dz.el);
    var cap = h("input", { class: "in", value: b.cap || "", placeholder: "圖說（可以不填）", style: "margin-top:6px" });
    cap.oninput = function () { b.cap = cap.value; changed(); };
    body.appendChild(cap);
    body.appendChild(ocrLine(b));   // 第 28 批：圖片裡的字的狀態
    if (/\.png$/i.test(b.fname || "") && /^1\. /.test(String(b.ocr || ""))) {   // 第 40 批：退回舊版本時，流程圖被存成一般的圖 → 從圖裡存的資料還原
      body.appendChild(h("div", { class: "drw-rec" }, [btn("🔀 還原成流程圖", function () { drRecover(b, function () { renderForm(); changed(); }); }, "sm"), h("span", { class: "muted" }, ["這張圖是流程圖畫的（退回舊版本時變成一般的圖）：按這裡就能再用流程圖改"])]));
    }
  }
  var blk = h("div", { class: "blk" + (ED.ab === i ? " act" : "") + (b.brk && i > 0 ? " brk" : "") + (b.only === "line" ? " only-line" : b.only === "web" ? " only-web" : ""), "data-i": String(i), "data-ind": _yzBlockInd_(b) ? String(_yzBlockInd_(b)) : null }, [head, body]);
  if (rte) blk._rte = rte;
  return blk;
}
function edTitleChoices() {   // 「連結」可以選的：整章（第 27 批）＋全部章元的全部標題（照章分組）
  var out = ED.chapters.map(function (c) { return { id: c.id, label: "📚 " + (c.name || "（還沒有章名）") + "（整章）", grp: "整章（打開那一章的標題清單）" }; });
  ED.chapters.forEach(function (c) { var tsg = ED.titles[c.id] || []; tsg.forEach(function (t) { out.push({ id: t.id, label: [c.name].concat(_yzTPath_(tsg, t).map(function (x) { return x.name; })).join(" › ") + " › " + (t.name || "（還沒有標題）"), grp: "標題：" + (c.name || "") }); }); });
  return out;
}
// 第 28 批：文字裡的圖：選好檔 → 縮小 → 上傳（檔名亂碼）→ cb({ url, fid, fname, ar, info })；不行 cb(null)
var ED_TEXT_PICS_MAX = 30;   // 一塊文字最多幾張圖（跟後端 YZ_TEXT_PICS_MAX 一樣）
function edImgUp(file, cb) {
  if (!file || !/^image\/(jpeg|png|gif|webp|bmp)$/.test(file.type || "")) { toast("這不是圖片檔（JPEG、PNG、GIF、WebP）"); cb(null); return; }
  shrinkImage(file, function (uri, info) {
    if (!uri) { toast(info && info.error || "讀不到這個檔案"); cb(null); return; }
    var prep = ocrPrep(file);   // 第 29 批：同時用原圖做「辨識專用」的清楚版
    uploadUri(uri, "圖片").then(function (r) {
      if (r.fid) ocrSrcPut(r.fid, prep);
      cb({ url: r.url, fid: r.fid, fname: r.fname, ar: _yzAR_(info.w, info.h), info: info });
      toast("圖片放好了（已縮小、檔名換成亂碼）");
    }, function (e) {
      cb(null);
      modal({ title: "❌ 這張圖沒有放進去", lines: [(e && e.message) || "上傳失敗", "請再放一次。一直失敗的話：截圖給開發者，或在 LINE 打「手冊圖片檢查」。"], buttons: [{ label: "知道了", cls: "sm pri" }] });
    });
  }, 1600);
}
// 「⤴ 併到上一塊」（第 28 批：文字、圖片併進上一塊文字。第 29 批：上一塊是圖片、表格也可以——上一塊先變成文字塊，兩塊放在一起；
// 表格也能併（變成文字裡的一張表格）；圖片也能併進上一塊階梯式內容（變成最後一行的圖））。不能併的（上一塊是動畫、藥品卡片…）就不顯示按鍵
var ED_TEXT_TBLS_MAX = 10;   // 一塊文字最多幾張表格（跟後端 YZ_TEXT_TBLS_MAX 一樣）
function edImgReady(b) { return !!(b && b.t === "img" && !b.draw && b.url && b.fid && String(b.url).indexOf("data:") !== 0); }   // 第 40 批：流程圖不能併到上一塊（畫的資料會不見）
function mergeKind(t, i) {   // ""＝不能併；"text"＝併進上一塊（上一塊是圖片、表格的話先變成文字塊）；"ladder"＝圖片變成上一塊階梯式內容的最後一行
  var b = t.blocks[i], pv = t.blocks[i - 1];
  if (!(i > 0 && pv && b) || !(b.t === "text" || edImgReady(b) || b.t === "table")) return "";
  if ((b.only || "") !== (pv.only || "")) return "";   // 第 41 批：一個只在 LINE、一個只在網頁（或都顯示）：不能併（併了就分不出來）
  if (pv.t === "text" || edImgReady(pv) || pv.t === "table") return "text";
  if (pv.t === "ladder" && edImgReady(b)) return "ladder";
  return "";
}
function mergeOk(t, i) { return !!mergeKind(t, i); }
function picOf(b) { var p = { url: b.url, fid: b.fid, fname: b.fname, ar: b.ar, cap: b.cap || "", info: b.info }; if (typeof b.ocr === "string") p.ocr = b.ocr; return p; }
function tblOf(b) { var o = { head: b.head !== false, rows: JSON.parse(JSON.stringify(b.rows && b.rows.length ? b.rows : [[""]])) }; if (b.w && b.w.length) o.w = b.w.slice(); if (b.mg && b.mg.length) o.mg = JSON.parse(JSON.stringify(b.mg)); return o; }
function toTextBlock(b) {   // 圖片、表格這一塊 → 只有一行的文字塊（[img=…]／[tbl=…]）；整塊縮排、換下一張照舊
  if (b.t === "text") return b;
  var o = { t: "text", v: "", pics: {}, tbls: {} }, id;
  if (b.t === "img") { id = rteNewPicId(o.pics); o.pics[id] = picOf(b); o.v = "[img=" + id + "]"; }
  else { id = rteNewPicId(o.tbls); o.tbls[id] = tblOf(b); o.v = "[tbl=" + id + "]"; }
  if (b.ind) o.ind = b.ind;
  if (b.brk) o.brk = true;
  return o;
}
function mergeTip(t, i) {
  var k = mergeKind(t, i), b = t.blocks[i], pv = t.blocks[i - 1];
  if (k === "ladder") return "這張圖變成上一塊階梯式內容的最後一行（掛在最後一條下面；圖說、圖片裡的字都帶著）";
  var what = b.t === "img" ? "這張圖" : b.t === "table" ? "這張表格" : "這一塊的文字（連同裡面的圖、表格）";
  var where = pv.t === "img" ? "跟上一塊的圖片放在同一塊（上一塊變成文字塊，圖照樣在）" : pv.t === "table" ? "跟上一塊的表格放在同一塊（上一塊變成文字塊，表格照樣在）" : "放進上一塊文字的最後面";
  return what + where + "；縮排照舊" + (b.t === "table" ? "。之後要改表格：按表格旁邊的「✏️ 編輯表格」" : "");
}
function mergeShift(v, d) {   // 每一行的縮排加 d 層（0～3）：整塊縮排不一樣的兩塊併在一起，看起來照舊
  if (!d) return v;
  return String(v || "").split("\n").map(function (ln) {
    if (!ln.trim()) return ln;
    var L = _yzRtParseLine_(ln), n = Math.max(0, Math.min(YZ_RT_MAXLV, (L.lv || 0) + d)), pre = "";
    for (var k = 0; k < n; k++) pre += "　";
    return pre + ln.replace(/^[ 　\t]*/, "");
  }).join("\n");
}
function mergeUp(t, i) {
  var kind = mergeKind(t, i);
  if (!kind) return;
  var b = t.blocks[i], pv0 = t.blocks[i - 1];
  if (kind === "ladder") {   // 圖 → 上一塊階梯式內容的最後一行（比最後一個文字行深一層）
    var its = pv0.items || (pv0.items = []), lv = 1;
    for (var q = its.length - 1; q >= 0; q--) if (its[q] && !its[q].img) { lv = its[q].lv || 1; break; }
    its.push({ lv: Math.min(5, lv + 1), img: picOf(b) });
    t.blocks.splice(i, 1);
    ED.ab = i - 1; renderForm(); changed();
    toast("併好了：圖變成上一塊階梯式內容的最後一行（⇤ ⇥ 可以調）");
    return;
  }
  var pv = toTextBlock(pv0), conv = pv !== pv0;
  var d = _yzBlockInd_(b) - _yzBlockInd_(pv), add, pics = {}, tbls = {}, pre = "", k;
  if (!pv.pics || typeof pv.pics !== "object") pv.pics = {};
  if (!pv.tbls || typeof pv.tbls !== "object") pv.tbls = {};
  for (k = 0; k < Math.max(0, Math.min(YZ_RT_MAXLV, d)); k++) pre += "　";
  if (b.t === "img") { var id = rteNewPicId(pv.pics); pics[id] = picOf(b); add = pre + "[img=" + id + "]"; }
  else if (b.t === "table") { var tid = rteNewPicId(pv.tbls); tbls[tid] = tblOf(b); add = pre + "[tbl=" + tid + "]"; }
  else {
    add = mergeShift(b.v, d);
    var bp = b.pics && typeof b.pics === "object" ? b.pics : {}, bt = b.tbls && typeof b.tbls === "object" ? b.tbls : {};
    _yzImgIds_(add).forEach(function (old) {   // 代號跟上一塊的一樣：換一個
      if (!bp[old]) return;
      var nid = old;
      if (pv.pics[nid] || pics[nid]) { nid = rteNewPicId(Object.assign({}, pv.pics, pics)); add = add.split("[img=" + old + "]").join("[img=" + nid + "]"); }
      pics[nid] = bp[old];
    });
    _yzTblIds_(add).forEach(function (old) {
      if (!bt[old]) return;
      var nid = old;
      if (pv.tbls[nid] || tbls[nid]) { nid = rteNewPicId(Object.assign({}, pv.tbls, tbls)); add = add.split("[tbl=" + old + "]").join("[tbl=" + nid + "]"); }
      tbls[nid] = bt[old];
    });
  }
  if (_yzImgIds_(pv.v).length + Object.keys(pics).length > ED_TEXT_PICS_MAX) { toast("一塊文字最多放 " + ED_TEXT_PICS_MAX + " 張圖：這一塊先不併"); return; }
  if (_yzTblIds_(pv.v).length + Object.keys(tbls).length > ED_TEXT_TBLS_MAX) { toast("一塊文字最多放 " + ED_TEXT_TBLS_MAX + " 張表格：這一塊先不併"); return; }
  Object.keys(pics).forEach(function (x) { pv.pics[x] = pics[x]; });
  Object.keys(tbls).forEach(function (x) { pv.tbls[x] = tbls[x]; });
  pv.v = String(pv.v || "").replace(/\s+$/, "") + (add.trim() ? "\n" + add : "");
  t.blocks[i - 1] = pv;
  t.blocks.splice(i, 1);
  ED.ab = i - 1; renderForm(); changed();
  var el = $("#edc2 .blk[data-i='" + (i - 1) + "']"); if (el && !window.__SHOT) el.scrollIntoView({ block: "center" });
  toast((conv ? "併好了：上一塊的" + (pv0.t === "img" ? "圖片" : "表格") + "和這一塊放在同一塊了" : b.t === "img" ? "併好了：圖放進上一塊文字的最後面" : b.t === "table" ? "併好了：表格放進上一塊文字的最後面（要改表格：按「✏️ 編輯表格」）" : "併好了：接到上一塊文字的最後面") + (b.brk ? "（這一塊的「換下一張」拿掉了）" : ""));
}
// 第 29 批：文字裡的表格 → 小視窗裡編輯（跟整塊的表格同一套工具）；「⤵ 拆出來」＝變回自己一整塊
function edTblModal(t, b, id, done) {
  var TB = b.tbls && b.tbls[id];
  if (!TB) return;
  var bx = h("div", { class: "modal", role: "dialog", "aria-modal": "true" }), shut = false;
  var close = function () { if (shut) return; shut = true; bx.remove(); if (done) done(); };
  var split = btn("⤵ 拆出來，變回自己一整塊", function () { shut = true; bx.remove(); edTblSplit(t, b, id); }, "sm");
  split.title = "這張表格拿出來，變成這一塊文字下面（或中間）自己一整塊的表格";
  bx.appendChild(h("div", { class: "dlg tbdlg" }, [h("h3", {}, ["▦ 編輯表格（在這一塊文字裡）"]), tableEditor(TB, t), h("div", { class: "dlg-b" }, [split, btn("好了", close, "sm pri")])]));
  document.body.appendChild(bx);
  bx.onkeydown = function (e) { if (e.key === "Escape") close(); };
  var f = $("input", bx); if (f) try { f.focus(); } catch (e) { /* 沒關係 */ }
}
function edTblSplit(t, b, id) {   // 文字從這張表格那一行切開：上面的字｜表格（自己一整塊）｜下面的字
  var bi = t.blocks.indexOf(b), TB = b.tbls && b.tbls[id];
  if (bi < 0 || !TB) return;
  var ls = String(b.v || "").split("\n"), at = -1;
  ls.forEach(function (ln, k) { if (at < 0 && new RegExp("^[ 　\\t]*\\[tbl=" + id + "\\]").test(ln)) at = k; });
  if (at < 0) return;
  var mk = function (v) { var o = { t: "text", v: v }; if (b.pics) o.pics = b.pics; if (b.tbls) o.tbls = b.tbls; if (b.ind) o.ind = b.ind; return o; };
  var before = ls.slice(0, at).join("\n"), after = ls.slice(at + 1).join("\n"), tb = Object.assign({ t: "table" }, tblOf(TB)), out = [];
  if (b.ind) tb.ind = b.ind;
  if (before.trim()) { var x = mk(before); if (b.brk) x.brk = true; out.push(x); } else if (b.brk) tb.brk = true;
  out.push(tb);
  if (after.trim()) out.push(mk(after));
  t.blocks.splice.apply(t.blocks, [bi, 1].concat(out));
  ED.ab = bi + (before.trim() ? 1 : 0); renderForm(); changed();
  toast("表格拆出來了，變回自己一整塊");
}
/* ── 第 32 批：整塊複製、貼上；整篇複製（只放記憶體，登出就丟掉；圖片用同一張，不會多傳一次）── */
var ED_CLIP = null;   // { blocks:[…], what:"文字" }
function edClipBlocks(t, idx) {
  var bs = idx.map(function (i) { return t.blocks[i]; }).filter(Boolean);
  if (!bs.length) return;
  ED_CLIP = { blocks: JSON.parse(JSON.stringify(bs)), what: bs.length === 1 ? (bs[0].draw ? "流程圖" : KIND_NAME[bs[0].t] || "內容") : bs.length + " 塊", from: t.name || "" };
  renderToolbar();
  toast("📋 複製好了（" + ED_CLIP.what + "）：到要放的標題，點一下某一塊，按最上面的「📌 貼上整塊」");
}
function edPasteBlocks() {
  if (!ED_CLIP || ED.cur.kind !== "title") return;
  var t = edTitle(ED.cur.id); if (!t) return;
  var at = (ED.ab === null || ED.ab === undefined) ? t.blocks.length : Math.min(t.blocks.length, ED.ab + 1);
  var add = JSON.parse(JSON.stringify(ED_CLIP.blocks));
  if (at === 0 && add[0]) delete add[0].brk;   // 第一塊不用「換下一張」
  Array.prototype.splice.apply(t.blocks, [at, 0].concat(add));
  ED.ab = at + add.length - 1; renderForm(); changed();
  var el = $("#edc2 .blk[data-i='" + at + "']"); if (el && !window.__SHOT) el.scrollIntoView({ block: "center" });
  toast("📌 貼上了（" + ED_CLIP.what + "）：放在第 " + (at + 1) + " 塊");
}
function edCopyTitle(t) {
  var sel = h("select", { class: "in", "aria-label": "複製到哪一章" });
  ED.chapters.forEach(function (c) { sel.appendChild(h("option", { value: c.id }, [(c.id === t.ch ? "（同一章）" : "") + (c.name || "（還沒有章名）")])); });
  sel.value = t.ch;
  var close = modal({ title: "📋 複製這一篇", lines: ["整篇（內容、圖片、表格、備註…）複製一份，標題後面加「（複製）」。放在哪一章："], buttons: [{ label: "取消", cls: "sm" }, { label: "📋 複製", cls: "sm pri", fn: function () {
    var to = sel.value || t.ch, nt = JSON.parse(JSON.stringify(t)), a = ED.titles[to] || (ED.titles[to] = []);
    nt.id = "t" + Date.now(); nt.ch = to; nt.name = (t.name || "") + "（複製）";
    // 第 43 批：同一章＝放在這一篇（和它的子標題）後面、同一層；別章＝放最後面、第 1 層（只複製這一篇，不含子標題）
    if (to === t.ch) { edTLvFix(a); var lvz = _yzTLvs_(a), iz = a.indexOf(t); if (lvz[iz] > 1) nt.lv = lvz[iz]; else delete nt.lv; a.splice(iz < 0 ? a.length : edTSpan(a, iz, lvz), 0, nt); }
    else { delete nt.lv; a.push(nt); }
    markDirty(); selectNode("title", nt.id);
    toast("📋 複製好了：「" + nt.name + "」（在「" + (edCh(to) || {}).name + "」）。改好標題就可以用");
  } }] });
  var dlg = $$(".modal .dlg-p").pop(); if (dlg) dlg.appendChild(sel);
  try { sel.focus(); } catch (e) { /* 沒關係 */ }
  return close;
}
function moveBlock(t, i, d) { var j = i + d; if (j < 0 || j >= t.blocks.length) return; var x = t.blocks[i]; t.blocks[i] = t.blocks[j]; t.blocks[j] = x; ED.ab = j; renderForm(); changed(); }
function addBlock(kind) {
  if (ED.cur.kind !== "title") return;
  if (kind === "link" && !drBackOk()) { modal({ title: "⚠ 還不能放網址連結", lines: ["藥戰手冊專案（Apps Script）的「01、02」還是舊的（第 40 批以前）：網址連結存了會不見。", "請先把第 40 批的 01、02 貼上，「部署 → 管理部署作業 → ✏️ → 新版本 → 部署」，再重新整理這一頁。"], buttons: [{ label: "知道了", cls: "sm pri" }] }); return; }
  if (kind === "draw" && !drBackOk()) { modal({ title: "⚠ 還不能畫流程圖", lines: ["藥戰手冊專案（Apps Script）的「02_藥戰手冊」還是舊的（第 40 批以前）：流程圖存了會變成一般的圖。", "請先把第 40 批的 02 貼上，「部署 → 管理部署作業 → ✏️ → 新版本 → 部署」，再重新整理這一頁。"], buttons: [{ label: "知道了", cls: "sm pri" }] }); return; }
  var t = edTitle(ED.cur.id); if (!t) return;
  var nb = kind === "text" ? { t: "text", v: "" } : kind === "ladder" ? { t: "ladder", style: "law", items: [{ lv: 1, v: "" }] } : kind === "table" ? { t: "table", head: true, rows: [["", ""], ["", ""]] } : kind === "drug" ? { t: "drug", items: [] } : kind === "anim" ? { t: "anim", kind: "file", url: "", poster: "", fmt: "", bytes: 0, w: 0, h: 0, frames: 0, dur: 0, ar: "4:3", cap: "", steps: [], sec: 2, loop: true } : kind === "draw" ? { t: "img", url: "", fid: "", cap: "", ar: "4:3", draw: drNew() } : kind === "link" ? { t: "link", items: [{ u: "", t: "", n: "" }] } : { t: "img", url: "", cap: "", ar: "4:3" };
  var at = (ED.ab === null || ED.ab === undefined) ? t.blocks.length : Math.min(t.blocks.length, ED.ab + 1);
  // 游標在某一個文字塊裡：表格／圖片／動畫／階梯式放在游標那一行的後面，文字從那裡切成上下兩塊（不用先自己拆）
  var cur = RTE.cur, cb = cur && cur.el && cur.el.closest ? cur.el.closest(".blk") : null, bi = cb ? +cb.getAttribute("data-i") : -1, tb = bi >= 0 ? t.blocks[bi] : null;
  if (kind === "img" && tb && tb.t === "text" && cur.cmd && cur.cmd.img) { cur.cmd.img(); return; }   // 第 28 批：游標在文字裡 → 圖直接放在文字裡（游標那一行下面），不用切成好幾塊
  if (kind !== "text" && tb && tb.t === "text") {
    var sp = cur.splitAtCaret(), hasB = !!sp.before.trim(), hasA = !!sp.after.trim();
    if (!hasB && !hasA) { t.blocks.splice(bi, 1, nb); at = bi; }                                              // 這個文字塊是空的：直接換成新的
    else if (hasB && !hasA) { tb.v = sp.before; t.blocks.splice(bi + 1, 0, nb); at = bi + 1; }                 // 游標在最後面：接在後面
    else if (!hasB && hasA) { tb.v = sp.after; t.blocks.splice(bi, 0, nb); at = bi; }                          // 游標在最前面：放在前面
    else { tb.v = sp.before; t.blocks.splice(bi + 1, 0, nb, { t: "text", v: sp.after }); at = bi + 1; }       // 游標在中間：切成兩塊文字，新的夾在中間
  } else t.blocks.splice(at, 0, nb);
  ED.ab = at; renderForm(); changed();
  var el = $("#edc2 .blk[data-i='" + at + "']");
  if (el) {
    if (!window.__SHOT) el.scrollIntoView({ block: "center" });
    if (el._rte) el._rte.focus(); else { var f = $("textarea,input:not([type=file])", el); if (f) f.focus(); }
  }
}

/* ───────── 第 40 批（一起做的）：網址連結（外部網站）─────────
   一列一個：顯示的字（可以不填＝用網站名稱）、網址（https:// 或 http:// 開頭；打 www. 開頭的會自動補 https://）、說明（可以不填）。最多 10 個。
   「↗ 試開」＝自己先點點看（電腦開小視窗）。讀的人：LINE 一個連結一個小框（點了用 LINE 的瀏覽器開）、網頁一樣的小框（電腦開小視窗、手機開新分頁）。 */
function linkEditor(b) {
  if (!Array.isArray(b.items) || !b.items.length) b.items = [{ u: "", t: "", n: "" }];
  var wrap = h("div", { class: "lke" }), list = h("div", { class: "lkl" });
  function paint() {
    list.innerHTML = "";
    b.items.forEach(function (x, k) {
      var tIn = h("input", { class: "in lk-t", value: x.t || "", maxlength: "40", placeholder: "顯示的字（例：食藥署 藥品查詢；不填＝網站名稱）", "aria-label": "顯示的字 " + (k + 1) });
      var uIn = h("input", { class: "in lk-u", value: x.u || "", maxlength: "1000", inputmode: "url", autocomplete: "off", spellcheck: "false", placeholder: "網址（https:// 開頭）", "aria-label": "網址 " + (k + 1) });
      var nIn = h("input", { class: "in lk-n", value: x.n || "", maxlength: "120", placeholder: "說明（可以不填）", "aria-label": "說明 " + (k + 1) });
      var msg = h("div", { class: "lk-m", role: "status" });
      // 第 43 批：開法：自動（看網址是不是檔案）／在手冊裡看（檔案：只能看）／開網頁（新視窗）
      var kSel = h("select", { class: "in lk-k", "aria-label": "開法 " + (k + 1), title: "讀的人點了怎麼開" }, [["", "開法：自動（看網址）"], ["file", "在手冊裡看（檔案，只能看）"], ["web", "開網頁（新視窗）"]].map(function (o) { return h("option", { value: o[0] }, [o[1]]); }));
      kSel.value = x.k === "file" || x.k === "web" ? x.k : "";
      var ico = h("span", { class: "lk-no", "aria-hidden": "true" }, ["🌐"]);
      var chk = function () {
        var raw = String(uIn.value || "").trim(), ok = _yzLinkFix_(raw), fk = ok ? _yzLinkFileKind_({ u: ok, k: x.k }) : "";
        msg.textContent = !raw ? "還沒填網址（沒填的不會出現在 LINE、網頁）" : !ok ? "⚠ 網址要 https:// 或 http:// 開頭，中間不能有空白" : fk ? "✓ " + YZ_FILE_ICO[fk] + " " + YZ_FILE_NAME[fk] + "：讀的人在手冊裡的小視窗看（只能看，不能下載、列印）" + (x.t ? "" : "（沒填顯示的字：用網站名稱）") : "✓ 網頁 " + _yzLinkHost_(ok) + "：讀的人開新視窗" + (x.t ? "" : "（沒填顯示的字：用網站名稱）");
        msg.className = "lk-m" + (raw && !ok ? " bad" : ok ? " ok" : "");
        ico.textContent = fk ? YZ_FILE_ICO[fk] : "🌐";
        tryB.disabled = !ok;
        tryB.textContent = fk ? "👁 試開" : "↗ 試開";
        tryB.title = fk ? "在手冊裡的小視窗先看看（後端拿得到嗎、轉得成 PDF 嗎）" : "自己先點點看（電腦開小視窗）";
      };
      var tryB = btn("↗ 試開", function () { var u = _yzLinkFix_(uIn.value); if (!u) return; var fk = _yzLinkFileKind_({ u: u, k: x.k }); if (fk) { fvOpen({ try: u, label: _yzLinkLabel_({ u: u, t: x.t }), kind: fk }); return; } if (!xlOpen(u)) window.open(u, "_blank", "noopener,noreferrer"); }, "sm lk-try");
      kSel.onchange = function () { if (kSel.value) x.k = kSel.value; else delete x.k; chk(); changed(); };
      tIn.oninput = function () { x.t = tIn.value; chk(); changed(); };
      uIn.oninput = function () { x.u = uIn.value.trim(); chk(); changed(); };
      uIn.onblur = function () { var raw = String(uIn.value || "").trim(); if (/^www\./i.test(raw)) { uIn.value = x.u = "https://" + raw; chk(); changed(); } };
      nIn.oninput = function () { x.n = nIn.value; changed(); };
      var del = btn("✕", function () { b.items.splice(k, 1); if (!b.items.length) b.items.push({ u: "", t: "", n: "" }); paint(); changed(); }, "sm bad");
      del.title = "刪掉這一個連結";
      var up = k > 0 ? btn("▲", function () { var y = b.items[k - 1]; b.items[k - 1] = x; b.items[k] = y; paint(); changed(); }, "sm") : null;
      if (up) up.title = "往上移";
      list.appendChild(h("div", { class: "lkrw" }, [ico, h("div", { class: "lk-f" }, [h("div", { class: "lk-r1" }, [tIn, uIn]), h("div", { class: "lk-r2" }, [nIn, kSel, tryB, up, del]), msg])]));
      chk();
    });
  }
  var add = btn("＋ 再加一個連結", function () { if (b.items.length >= YZ_LINK_MAX) { toast("一塊最多 " + YZ_LINK_MAX + " 個連結：請再加一塊「＋網址連結」"); return; } b.items.push({ u: "", t: "", n: "" }); paint(); changed(); var ins = list.querySelectorAll(".lk-u"); if (ins.length) ins[ins.length - 1].focus(); }, "sm");
  paint();
  wrap.appendChild(list);
  wrap.appendChild(h("div", { class: "lk-add" }, [add]));
  wrap.appendChild(hint("網頁：電腦開一個小視窗（手冊還在後面）、手機開新分頁、LINE 用 LINE 的瀏覽器打開。第 43 批：網址是檔案（Word、PDF、Excel、PPT、圖片；Google 文件、試算表、簡報、雲端硬碟的檔）→ 讀的人在手冊裡的小視窗看（只能看，不能下載、列印，有浮水印；LINE 點了開網頁的小視窗）。院內網路、SharePoint 這種要登入的網址後端拿不到：檔案請放雲端硬碟（分享給藥戰手冊的 Google 帳號就好，不用公開）。顯示的字、說明搜尋找得到；Word 匯出寫「名稱：網址」。"));
  return wrap;
}

/* ───────── 藥品卡片（第 29 批）：從補藥神器的藥品資料庫找藥放進來 ─────────
   CODE、商品名、中文名、學名都可以找（跟在補藥神器打字查一樣）。手冊裡只記 CODE（和當時的藥名：補藥神器找不到這支藥的時候顯示用）；
   藥品特徵、照片、注意、適應症…看的時候才從補藥神器拿最新的。不顯示位置。LINE：一支藥一行（收起來，點一下才打開藥品卡）；網頁：直接打開（三欄）。 */
var ED_DRUG_MAX = 30;   // 一塊最多幾支藥（跟後端 YZ_DRUG_MAX 一樣）
function drugEditor(t, b) {
  if (!Array.isArray(b.items)) b.items = [];
  var wrap = h("div", { class: "dge" });
  var q = h("input", { class: "in dgq", type: "search", placeholder: "找藥：打 CODE、商品名、中文名或學名（補藥神器的藥品資料庫）", "aria-label": "找藥", autocomplete: "off" });
  var res = h("div", { class: "dgr", role: "list", "aria-live": "polite" }), cnt = h("div", { class: "dgcnt" }), list = h("div", { class: "dgl", role: "list" });
  var seq = 0, tm = null, last = [], lastMore = false, lastKw = "";
  var has = function (c) { return b.items.some(function (x) { return x.code === c; }); };
  var row = function (d, tail) {
    return h("div", { class: "dgi", role: "listitem" }, [h("span", { class: "c" }, [d.code]),
      h("span", { class: "n" }, [h("b", {}, [d.brand || "—"]), d.chName ? h("span", { class: "z" }, [d.chName]) : null, d.generic ? h("span", { class: "g" }, [d.generic]) : null]), tail]);
  };
  function msg(t2) { res.innerHTML = ""; res.appendChild(h("div", { class: "dgmsg" }, [t2])); }
  function paintRes() {
    res.innerHTML = "";
    if (!lastKw) return;
    if (!last.length) { msg("補藥神器裡找不到「" + lastKw + "」"); return; }
    last.forEach(function (r) {
      var on = has(r.code);
      var add = btn(on ? "✓ 已放進來" : "＋放進來", function () {
        if (has(r.code)) return;
        if (b.items.length >= ED_DRUG_MAX) { toast("一塊藥品卡片最多放 " + ED_DRUG_MAX + " 支藥：請再加一塊「＋藥品」"); return; }
        b.items.push({ code: r.code, brand: r.brand || "", chName: r.chName || "" });
        changed(); paintList(); paintRes();
      }, on ? "sm" : "sm pri");
      if (on) add.disabled = true;
      res.appendChild(row(r, add));
    });
    if (lastMore) res.appendChild(h("div", { class: "dgmsg" }, ["還有更多：多打幾個字縮小範圍（最多列 30 筆）"]));
  }
  function find(now) {
    clearTimeout(tm);
    var kw = q.value.trim();
    if (!kw) { seq++; last = []; lastKw = ""; res.innerHTML = ""; return; }
    tm = setTimeout(function () {
      var my = ++seq;
      msg("找「" + kw + "」中…");
      call("hbDrugFind", [kw]).then(function (r) {
        if (my !== seq) return;
        if (r && r.st === "lock") { logout("expired"); return; }
        if (!r || !r.ok) { msg("⚠ " + (r && r.err || "找不到藥品資料")); return; }
        last = r.rows || []; lastMore = !!r.more; lastKw = kw; paintRes();
      }, function (e) { if (my === seq) msg("⚠ " + ((e && e.message) || "連不上，等一下再試")); });
    }, now ? 0 : 350);
  }
  q.addEventListener("input", function () { find(false); });
  q.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); find(true); } });
  function move(k, d) { var j = k + d; if (j < 0 || j >= b.items.length) return; var x = b.items.splice(k, 1)[0]; b.items.splice(j, 0, x); changed(); paintList(); }
  function paintList() {
    list.innerHTML = "";
    cnt.textContent = b.items.length ? "放進來的藥：" + b.items.length + " 支（LINE、網頁照這個順序；最多 " + ED_DRUG_MAX + " 支）" : "還沒有放藥：在上面找藥，按「＋放進來」";
    b.items.forEach(function (d, k) {
      var up = btn("▲", function () { move(k, -1); }), dn = btn("▼", function () { move(k, 1); });
      up.disabled = k === 0; dn.disabled = k === b.items.length - 1;
      up.setAttribute("aria-label", "往上"); dn.setAttribute("aria-label", "往下");
      var x = btn("✕", function () { b.items.splice(k, 1); changed(); paintList(); paintRes(); }, "sm bad");
      x.setAttribute("aria-label", "拿掉這支藥");
      list.appendChild(row(d, h("span", { class: "dgb" }, [up, dn, x])));
    });
  }
  wrap.appendChild(q); wrap.appendChild(res); wrap.appendChild(cnt); wrap.appendChild(list);
  wrap.appendChild(hint("LINE：一支藥一行（收起來），點一下才打開完整的藥品卡。網頁：直接打開，像補藥神器電腦版（藥品特徵｜適應症、注意｜照片）。不顯示位置。藥品的資料跟著補藥神器走（那邊改了，這裡也跟著變）。"));
  paintList();
  return wrap;
}

/* 階梯式內容：只存「第幾層」和「文字」，編號（第一條／一、／（一）…）是算出來的，加一行、搬一行，後面的編號自己跟著變。
   一行也可以是「圖片」：{ lv, img:{ url, cap, ar, info, fname } }。圖片行不佔編號，掛在它上面那一個文字行底下（預設比那一行深一層，⇤ ⇥ 可以調）。 */
function edMarks(b) {   // 編輯器每一行前面的編號；空白的行不會顯示出去，所以也不佔編號（跟 LINE、網頁一樣）→ null（畫成「—」）。圖片行、只縮排的行沒有記號（""）
  var idx = [], vis = [];
  _yzLadderNumberAll_(edHb());   // 「接續上一段」：前面的段落改了，這一段從第幾號開始也跟著變
  b.items.forEach(function (it, i) { if (_yzLadderShown_(it)) { idx.push(i); vis.push(it); } });
  var marks = _yzLadderMarks_(_yzLadderFix_(vis), b.style, b.n0), out = b.items.map(function () { return null; });
  idx.forEach(function (i, k) { out[i] = marks[k]; });
  return out;
}
function edJson() { return JSON.stringify(edHb(), function (k, v) { return k === "n0" ? undefined : v; }); }   // 要存的內容（n0＝算出來的起始號碼，不用存）
function ladderEditor(t, b) {
  if (!b.items) b.items = [];
  if (!YZ_LADDER_STYLES[b.style]) b.style = "law";
  var wrap = h("div", { class: "ladE" }), rowsBox = h("div", { class: "lrows" }), isImg = _yzLadderIsImg_;
  function subEnd(i) { if (isImg(b.items[i])) return i + 1; var lv = b.items[i].lv, j = i + 1; while (j < b.items.length && b.items[j].lv > lv) j++; return j; }   // 這一行（連同底下的子項）到哪裡結束；圖片行沒有子項
  function maxLv(i, j) { var m = 0; for (var k = i; k < j; k++) m = Math.max(m, b.items[k].lv); return m; }
  function prevTextLv(i) { for (var p = i - 1; p >= 0; p--) if (!isImg(b.items[p])) return b.items[p].lv; return 0; }   // 上面最近的「文字行」是第幾層（圖片行不算，跟 _yzLadderFix_ 一樣）
  function imgCount() { return b.items.filter(isImg).length; }
  function canShift(i, d) {
    var it = b.items, lv = it[i].lv, j = subEnd(i);
    if (d > 0) return lv <= prevTextLv(i) && maxLv(i, j) + 1 <= YZ_LADDER_MAX;
    return lv > 1;
  }
  function shift(i, d) { if (!canShift(i, d)) return false; for (var k = i, j = subEnd(i); k < j; k++) b.items[k].lv += d; return true; }
  function upStart(i) { var it = b.items, lv = it[i].lv, p = i - 1; while (p >= 0 && it[p].lv > lv) p--; return (p >= 0 && it[p].lv === lv) ? p : -1; }
  function canDown(i) { var j = subEnd(i); return j < b.items.length && b.items[j].lv === b.items[i].lv; }
  function moveUp(i) { var p = upStart(i); if (p < 0) return -1; var j = subEnd(i), seg = b.items.splice(i, j - i); Array.prototype.splice.apply(b.items, [p, 0].concat(seg)); return p; }
  function moveDown(i) { if (!canDown(i)) return -1; var j = subEnd(i), k = subEnd(j), seg = b.items.splice(i, j - i); Array.prototype.splice.apply(b.items, [i + (k - j), 0].concat(seg)); return i + (k - j); }
  function focusRow(i) {   // 文字行：游標放到最後面；圖片行：停在放圖的格子上（可以直接 Ctrl+V 貼圖）
    var row = rowsBox.children[i]; if (!row) return;
    var ta = $("textarea", row);
    if (ta) { ta.focus(); var n = ta.value.length; try { ta.setSelectionRange(n, n); } catch (e) { /* 沒關係 */ } }
    else { var dz = $(".drop", row); if (dz) dz.focus(); }
  }
  function after(i) { b.items = _yzLadderFix_(b.items); draw(); changed(); if (i !== undefined && i !== null) focusRow(i); }
  function addSibling(i) { var at = subEnd(i); b.items.splice(at, 0, { lv: b.items[i].lv, v: "" }); after(at); }
  function addChild(i) { if (isImg(b.items[i]) || b.items[i].lv >= YZ_LADDER_MAX) return; b.items.splice(i + 1, 0, { lv: b.items[i].lv + 1, v: "" }); after(i + 1); }
  function addImage(i) {   // 在這一行的正下方放一張圖：掛在這一行底下（比它深一層）；在圖片行上按，就接在那張圖後面（同一層）
    if (imgCount() >= YZ_LADDER_IMG_MAX) { toast("一段階梯式內容最多放 " + YZ_LADDER_IMG_MAX + " 張圖，再多請分成兩段"); return; }
    var cur = b.items[i], lv = isImg(cur) ? cur.lv : Math.min(cur.lv + 1, YZ_LADDER_MAX);
    b.items.splice(i + 1, 0, { lv: lv, img: { url: "", cap: "", ar: "4:3" } }); after(i + 1);
  }
  function delRow(i) { var j = subEnd(i); b.items.splice(i, j - i); if (!b.items.length) b.items.push({ lv: 1, v: "" }); after(Math.max(0, i - 1)); }
  function refreshMarks() { var m = edMarks(b); $$(".lmk", rowsBox).forEach(function (el, i) { if (b.items[i] && isImg(b.items[i])) return; el.textContent = m[i] === null ? "—" : m[i]; el.classList.toggle("empty", m[i] === null); }); stat(); }
  var statEl = h("div", { class: "hint" });
  function stat() {
    var r = _yzLadderRows_(b), mx = 0, ni = 0; r.items.forEach(function (it) { mx = Math.max(mx, it.lv); if (isImg(it)) ni++; });
    statEl.textContent = "共 " + (r.items.length - ni) + " 行文字" + (ni ? "、" + ni + " 張圖" : "") + "，最深 " + mx + " 層（最多 " + YZ_LADDER_MAX + " 層）。空白的行、還沒放圖的圖片列不會顯示，也不佔編號。LINE 上每往下一層，縮進去約 " + (YZ_LADDER_STEP[t.size || "giga"] || 14) + " px。";
  }
  function draw() {
    rowsBox.innerHTML = "";
    var marks = edMarks(b);
    b.items.forEach(function (it, i) {
      var hasKids = subEnd(i) > i + 1, isI = isImg(it);
      var ib = function (label, title, fn, off, cls) { var x = h("button", { class: "ib" + (cls ? " " + cls : ""), title: title, type: "button" }, [label]); if (off) x.disabled = true; x.onclick = fn; return x; };
      var armDel = function (title) { var x = h("button", { class: "ib bad", title: title, type: "button" }, ["✕"]); x.onclick = function () { if (x.dataset.arm) { delRow(i); return; } x.dataset.arm = "1"; x.textContent = "確定？"; setTimeout(function () { if (x.isConnected) { delete x.dataset.arm; x.textContent = "✕"; } }, 3000); }; return x; };
      var delb = isI ? (it.img.url ? armDel("刪除這張圖（要再按一次確認）") : ib("✕", "刪除這一列", function () { delRow(i); }, false, "bad"))
        : hasKids ? armDel("刪除這一行和底下的子項（要再按一次確認）")
        : ib("✕", "刪除這一行", function () { delRow(i); }, false, "bad");
      var btns = h("span", { class: "lbt" }, [
        ib("⇤", "往左一層（Shift+Tab）", function () { if (shift(i, -1)) after(i); }, !canShift(i, -1)),
        ib("⇥", "往右一層（Tab）", function () { if (shift(i, 1)) after(i); }, !canShift(i, 1)),
        ib("▲", "這一行（連同底下的子項）往上搬", function () { var p = moveUp(i); if (p >= 0) after(p); }, upStart(i) < 0),
        ib("▼", "這一行（連同底下的子項）往下搬", function () { var p = moveDown(i); if (p >= 0) after(p); }, !canDown(i)),
        ib("＋", "在下面新增一行（同一層）", function () { addSibling(i); }),
        ib("↳", isI ? "圖片底下不能再縮進一層" : "在下面新增一行（往右一層）", function () { addChild(i); }, isI || it.lv >= YZ_LADDER_MAX),
        ib("🖼", "在下面放一張圖片（掛在這一行底下）", function () { addImage(i); }, imgCount() >= YZ_LADDER_IMG_MAX, "pic"),
        delb
      ]);
      var ind = h("span", { class: "lind", style: "width:" + ((it.lv - 1) * 20) + "px" });
      var row;
      if (isI) {
        var im = it.img;
        var dz = dropZone({
          kind: "圖片",
          get: function () { return im.url; }, info: function () { return im.info; }, fname: function () { return im.fname; },
          set: function (r, info) { im.url = r.url; im.fid = r.fid; im.fname = r.fname; im.info = info; im.ar = _yzAR_(info.w, info.h); edOcrNew(im); changed(); stat(); },
          clear: function () { im.url = ""; im.fid = ""; im.info = null; delete im.ocr; changed(); stat(); ocrPaint(); },
          empty: "把圖拖進來　／　點這裡之後按 Ctrl+V 貼上"
        });
        var cap = h("input", { class: "in", value: im.cap || "", placeholder: "圖說（可以不填）" });
        cap.oninput = function () { im.cap = cap.value; changed(); };
        row = h("div", { class: "lrow limg lv" + it.lv }, [ind, h("span", { class: "lmk", title: "圖片：不佔編號" }, ["🖼"]), h("div", { class: "limgb" }, [dz.el, cap, ocrLine(im)]), btns]);
      } else {
        var ta = h("textarea", { class: "lta", rows: "1", placeholder: i === 0 ? "第一行（Tab 往右一層，Shift+Tab 往左，Enter 新增一行）" : "文字" });
        ta.value = it.v || "";
        var fit = function () { ta.style.height = "auto"; ta.style.height = Math.max(30, ta.scrollHeight) + "px"; };
        ta.oninput = function () { it.v = ta.value; fit(); changed(); refreshMarks(); };
        ta.onkeydown = function (e) {
          if (e.isComposing || e.keyCode === 229) return;
          if (e.key === "Tab") { e.preventDefault(); if (shift(i, e.shiftKey ? -1 : 1)) after(i); return; }
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addSibling(i); return; }
          if (e.key === "Backspace" && !ta.value && b.items.length > 1 && !hasKids) { e.preventDefault(); delRow(i); }
        };
        row = h("div", { class: "lrow lv" + it.lv }, [ind, h("span", { class: "lmk" + (marks[i] === null ? " empty" : "") }, [marks[i] === null ? "—" : marks[i]]), ta, btns]);
        setTimeout(fit, 0);
      }
      rowsBox.appendChild(row);
    });
    stat(); syncNum();
  }
  // 樣式
  var sel = h("select", { class: "in", style: "width:auto;max-width:100%" }, Object.keys(YZ_LADDER_STYLES).map(function (k) { return h("option", { value: k }, [YZ_LADDER_STYLES[k].name + "　" + YZ_LADDER_STYLES[k].ex]); }));
  sel.value = b.style; sel.onchange = function () { b.style = sel.value; draw(); changed(); };
  wrap.appendChild(h("div", { class: "ladtop" }, [h("span", { class: "muted" }, ["編號樣式"]), sel, mkEl(11)]));
  // 編號從哪裡開始：法條分成好幾個標題時（「總則」第一～六條，「藥師與民眾及病人」要從第七條開始），選「接續上一段」
  var numSel = h("select", { class: "in ladnumsel", style: "width:auto;max-width:100%" }, [
    h("option", { value: "" }, ["從頭開始"]), h("option", { value: "cont" }, ["接續上一段"]), h("option", { value: "set" }, ["自己指定從第幾號開始"])
  ]);
  var fromIn = h("input", { class: "in ladfrom", type: "number", min: "1", max: String(YZ_LADDER_FROM_MAX), step: "1", inputmode: "numeric", style: "width:6.5em", title: "從第幾號開始（1～" + YZ_LADDER_FROM_MAX + "）", "aria-label": "從第幾號開始" });
  var numRow = h("div", { class: "ladtop ladnum" }, [h("span", { class: "muted" }, ["編號從"]), numSel, fromIn]);
  var numInfo = h("div", { class: "hint ladni" });
  function syncNum() {   // 選單、號碼、說明跟著現在的設定（前面的段落改了、樣式換了，都要重算）
    var st = YZ_LADDER_STYLES[b.style] ? b.style : "law", q = _yzLadderNumberAll_(edHb(), b), first = _yzLadderNoText_(st, q.n0 + 1);
    wrap.classList.toggle("plain", st === "plain");
    numRow.style.display = _yzLadderNoNum_(st) ? "none" : "";
    numSel.value = b.num === "cont" || b.num === "set" ? b.num : "";
    numSel.options[0].textContent = "從頭開始（" + _yzLadderNoText_(st, 1) + "）";
    fromIn.style.display = b.num === "set" ? "" : "none";
    if (b.num === "set" && document.activeElement !== fromIn) fromIn.value = String(_yzLadderFrom_(b.from));
    var where = q.prev ? (q.prev.t === t ? "這個標題上面那一段" : "「" + (q.prev.t.name || "（還沒有標題）") + "」") : "";
    numInfo.style.display = st === "dot" ? "none" : "";
    numInfo.classList.toggle("on", !!b.num && st !== "plain");
    numInfo.textContent = st === "plain" ? "只縮排：每一行前面不加記號、不編號，只照層級往右縮（適合前言、說明文字）。"
      : b.num === "cont" ? (q.prev ? "這一段從「" + first + "」開始：接在" + where + "的「" + _yzLadderNoText_(q.prev.st, q.prev.last) + "」後面。前面的條文增減，這裡的號碼會自動跟著變。" : "這一章前面沒有別的「有編號」的段落可以接，所以從「" + first + "」開始。")
      : b.num === "set" ? "這一段從「" + first + "」開始（你指定的）。"
      : "這一段從「" + first + "」開始。同一部法規分在好幾個標題（例如「總則」第一～六條，下一個標題要從第七條開始）：選「接續上一段」。";
  }
  numSel.onchange = function () {
    var now = _yzLadderNumberAll_(edHb(), b).n0;   // 改成「自己指定」時，先填現在看到的號碼（畫面上的號碼不會突然跳掉）
    if (numSel.value === "cont") { b.num = "cont"; delete b.from; }
    else if (numSel.value === "set") { b.num = "set"; b.from = _yzLadderFrom_(now + 1); fromIn.value = String(b.from); }
    else { delete b.num; delete b.from; }
    syncNum(); refreshMarks(); changed();
  };
  fromIn.oninput = function () { var n = Math.floor(Number(fromIn.value)); if (!(n >= 1)) return; b.from = _yzLadderFrom_(n); syncNum(); refreshMarks(); changed(); };
  fromIn.onblur = function () { fromIn.value = String(_yzLadderFrom_(b.from)); };
  wrap.appendChild(numRow);
  wrap.appendChild(numInfo);
  ED.warners.push(function () { if (wrap.isConnected) { syncNum(); refreshMarks(); } });   // 同一個標題裡上面那一段改了：這一段的號碼、說明跟著變
  // 貼上整段條文（文字裡單獨一行的 ［圖］ 會變成一個空的圖片列，貼進來以後再放圖）
  var pta = h("textarea", { class: "ta", style: "min-height:96px", placeholder: "把條文從 Word 或 PDF 複製貼在這裡（行首有「第一條」「一、」「（一）」「1.」「(1)」都看得懂，編號會重新自動排）" });
  var pinfo = h("div", { class: "hint" }, ["貼上後，這裡會告訴你看懂了幾行。"]), parsed = null;
  pta.oninput = function () {
    var own = _yzLadderNoNum_(b.style) && !_yzLadderGuess_(pta.value);   // 圓點、只縮排的段落，貼的又是沒有編號的文字：照這一段的樣式讀（一行一項，縮排決定層級）
    parsed = _yzLadderParse_(pta.value, own ? b.style : "");
    var mx = 0, ni = 0; parsed.items.forEach(function (it) { mx = Math.max(mx, it.lv); if (isImg(it)) ni++; });
    pinfo.textContent = parsed.items.length ? "看懂了 " + (parsed.items.length - ni) + " 行" + (ni ? "＋" + ni + " 個圖片位置（貼進去以後，在那一列放圖）" : "") + "，最深 " + mx + " 層，樣式：" + YZ_LADDER_STYLES[parsed.style].name + "。" : "還沒有內容。";
  };
  var applyPaste = function (replace) {
    if (!parsed || !parsed.items.length) { toast("先貼上條文"); return; }
    var keep = replace ? [] : b.items.filter(_yzLadderShown_);
    b.items = _yzLadderFix_(keep.concat(parsed.items)); if (replace || !keep.length) b.style = parsed.style; sel.value = b.style;
    pta.value = ""; parsed = null; pinfo.textContent = "貼上了。"; draw(); changed(); toast("條文貼進來了，編號已重新自動排");
  };
  // 「取代全部」會把已經放好的圖也一起拿掉：有圖的時候，要再按一次確認
  var replBtn = btn("取代全部", function () {
    var n = b.items.filter(function (it) { return isImg(it) && it.img.url; }).length;
    if (n && !replBtn.dataset.arm) { replBtn.dataset.arm = "1"; replBtn.textContent = "確定？會刪掉現有的 " + n + " 張圖"; setTimeout(function () { if (replBtn.isConnected) { delete replBtn.dataset.arm; replBtn.textContent = "取代全部"; } }, 4000); return; }
    delete replBtn.dataset.arm; replBtn.textContent = "取代全部"; applyPaste(true);
  }, "sm pri");
  var det = h("details", { class: "ladpaste" }, [h("summary", {}, ["📋 貼上整段條文（從 Word／PDF 複製）"]), pta, pinfo, h("div", { style: "display:flex;gap:6px;margin-top:6px" }, [replBtn, btn("接在後面", function () { applyPaste(false); })])]);
  if (b.items.length <= 1 && !String((b.items[0] || {}).v || "").trim()) det.setAttribute("open", "");
  wrap.appendChild(det);
  wrap.appendChild(rowsBox);
  wrap.appendChild(statEl);
  draw();
  return wrap;
}

/* 表格 */
function parseTSV(tx) {
  var rows = tx.replace(/\r/g, "").replace(/\n+$/, "").split("\n").map(function (l) { return l.split("\t"); });
  var nc = 0; rows.forEach(function (r) { nc = Math.max(nc, r.length); });
  rows.forEach(function (r) { while (r.length < nc) r.push(""); });
  return rows;
}
/* ───────── 表格（第 29 批升級）─────────
   ・合併儲存格：在格子上按住拖過去（或點一格、再按住 Shift 點另一格）選好幾格 →「⊞ 合併儲存格」；點進合併的那一格 →「⊟ 取消合併」
   ・欄寬：拉表格最上面那排的「⇔」把手（拉了就變成「自己調」；按「欄寬：自動」回到自動）
   ・每一列左邊、每一欄上面的小按鍵：＋ 在下面（右邊）多一列（一欄）、✕ 刪掉這一列（欄）（有字的要按兩次）
   ・「🧹 刪掉空白的列和欄」：整列、整欄都沒有字的，一次刪掉
   資料：rows（每一格的字）、head（第一列是表頭）、w（欄寬比例；沒有＝自動）、mg（合併：[[列, 欄, 跨幾列, 跨幾欄], …]，字放左上角那一格） */
var TB_COL = "ABCDEFGHIJKL";
function tbFixMg(b) { var G = _yzTblGrid_(b), mg = G.ps.filter(function (p) { return p.rs * p.cs > 1; }).map(function (p) { return [p.r, p.c, p.rs, p.cs]; }); if (mg.length) b.mg = mg; else delete b.mg; return G; }
function tbPad(b) {   // 每一列一樣長；至少 1 列 1 欄；欄寬比例對不上就回到自動；合併的格子整理好（重疊、超出的拿掉）→ 欄數
  if (!Array.isArray(b.rows) || !b.rows.length) b.rows = [["", ""], ["", ""]];
  var nc = 1;
  b.rows.forEach(function (r, i) { if (!Array.isArray(r)) b.rows[i] = r = []; nc = Math.max(nc, r.length); });
  b.rows.forEach(function (r) { while (r.length < nc) r.push(""); });
  if (b.w && b.w.length !== nc) b.w = null;
  tbFixMg(b);
  return nc;
}
function tbRect(b, a, c) {   // 兩格 → 包住它們的長方形（碰到合併的格子：整塊包進來）{ r0, c0, r1, c1 }
  var G = _yzTblGrid_(b), r0 = Math.min(a.r, c.r), r1 = Math.max(a.r, c.r), c0 = Math.min(a.c, c.c), c1 = Math.max(a.c, c.c), grow = true, i, j, p;
  while (grow) {
    grow = false;
    for (i = r0; i <= r1; i++) for (j = c0; j <= c1; j++) {
      p = G.ps[G.at[i][j]];
      if (p.r < r0) { r0 = p.r; grow = true; }
      if (p.c < c0) { c0 = p.c; grow = true; }
      if (p.r + p.rs - 1 > r1) { r1 = p.r + p.rs - 1; grow = true; }
      if (p.c + p.cs - 1 > c1) { c1 = p.c + p.cs - 1; grow = true; }
    }
  }
  return { r0: r0, c0: c0, r1: r1, c1: c1 };
}
function tbMerge(b, R) {   // 合併：每一格的字照順序接起來（空白隔開）放左上角，其他格清空
  var G = _yzTblGrid_(b), txt = [], i, j, p;
  for (i = R.r0; i <= R.r1; i++) for (j = R.c0; j <= R.c1; j++) { p = G.ps[G.at[i][j]]; if (p.r === i && p.c === j && p.v.trim()) txt.push(p.v.trim()); }
  for (i = R.r0; i <= R.r1; i++) for (j = R.c0; j <= R.c1; j++) b.rows[i][j] = "";
  b.rows[R.r0][R.c0] = txt.join(" ");
  var keep = (b.mg || []).filter(function (m) { return m[0] > R.r1 || m[0] + m[2] - 1 < R.r0 || m[1] > R.c1 || m[1] + m[3] - 1 < R.c0; });   // 範圍外面的合併留著
  if ((R.r1 - R.r0 + 1) * (R.c1 - R.c0 + 1) > 1) keep.push([R.r0, R.c0, R.r1 - R.r0 + 1, R.c1 - R.c0 + 1]);
  b.mg = keep; tbFixMg(b);
}
function tbUnmerge(b, R) {   // 取消合併：範圍裡碰到的合併都拆開（字留在左上角那一格）→ 拆了幾個
  var n0 = (b.mg || []).length;
  b.mg = (b.mg || []).filter(function (m) { return m[0] > R.r1 || m[0] + m[2] - 1 < R.r0 || m[1] > R.c1 || m[1] + m[3] - 1 < R.c0; });
  var n = n0 - b.mg.length; tbFixMg(b); return n;
}
function tbInsRow(b, at) {   // 在第 at 列（0 起算）的位置插一列；插在合併的格子中間：合併的格子跟著變長
  var row = []; for (var j = 0; j < b.rows[0].length; j++) row.push("");
  b.rows.splice(at, 0, row);
  (b.mg || []).forEach(function (m) { if (at <= m[0]) m[0]++; else if (at < m[0] + m[2]) m[2]++; });
  tbFixMg(b);
}
function tbDelRow(b, k) {
  if (b.rows.length <= 1) return;
  (b.mg || []).forEach(function (m) {   // 刪的是合併那一格的第一列：字搬到下一列（合併的格子還在）
    if (k === m[0] && m[2] > 1 && !String(b.rows[k + 1][m[1]] || "").trim()) b.rows[k + 1][m[1]] = b.rows[k][m[1]];
  });
  b.rows.splice(k, 1);
  (b.mg || []).forEach(function (m) { if (k < m[0]) m[0]--; else if (k < m[0] + m[2]) m[2]--; });
  tbFixMg(b);
}
function tbInsCol(b, at) {
  b.rows.forEach(function (r) { r.splice(at, 0, ""); });
  (b.mg || []).forEach(function (m) { if (at <= m[1]) m[1]++; else if (at < m[1] + m[3]) m[3]++; });
  if (b.w) b.w.splice(at, 0, b.w[at - 1] !== undefined ? b.w[at - 1] : b.w[at] !== undefined ? b.w[at] : 1);   // 自己調的欄寬：新的一欄跟左邊那一欄一樣寬
  tbFixMg(b);
}
function tbDelCol(b, k) {
  if (b.rows[0].length <= 1) return;
  (b.mg || []).forEach(function (m) {
    if (k === m[1] && m[3] > 1 && !String(b.rows[m[0]][k + 1] || "").trim()) b.rows[m[0]][k + 1] = b.rows[m[0]][k];
  });
  b.rows.forEach(function (r) { r.splice(k, 1); });
  (b.mg || []).forEach(function (m) { if (k < m[1]) m[1]--; else if (k < m[1] + m[3]) m[3]--; });
  if (b.w) { b.w.splice(k, 1); if (b.w.length < 2) b.w = null; }
  tbFixMg(b);
}
function tbBlank(b) {   // 整列、整欄都沒有字的：{ rows, cols }（合併的格子有字：它蓋到的列、欄都算有字）
  var G = _yzTblGrid_(b), R = [], C = [], i, j, full;
  for (i = 0; i < G.nr; i++) { full = false; for (j = 0; j < G.nc && !full; j++) if (G.ps[G.at[i][j]].v.trim()) full = true; if (!full) R.push(i); }
  for (j = 0; j < G.nc; j++) { full = false; for (i = 0; i < G.nr && !full; i++) if (G.ps[G.at[i][j]].v.trim()) full = true; if (!full) C.push(j); }
  return { rows: R, cols: C };
}
function tbDelBlank(b) {   // 刪掉空白的列和欄（至少留 1 列 1 欄）→ 刪了幾個
  var x = tbBlank(b), n = 0, i;
  for (i = x.rows.length - 1; i >= 0; i--) if (b.rows.length > 1) { tbDelRow(b, x.rows[i]); n++; }
  x = tbBlank(b);
  for (i = x.cols.length - 1; i >= 0; i--) if (b.rows[0].length > 1) { tbDelCol(b, x.cols[i]); n++; }
  return n;
}
function tbMini(label, tip, fn, arm) {   // 列、欄旁邊的小按鍵（arm：有字的要按兩次；可以是函式，按的時候才看）
  var x = h("button", { class: "tbm", type: "button", title: tip, "aria-label": tip }, [label]);
  x.addEventListener("mousedown", function (e) { e.preventDefault(); e.stopPropagation(); });   // 不要搶走格子裡的游標、不要開始選格子
  x.onclick = function (e) {
    e.preventDefault(); e.stopPropagation();
    if (!(typeof arm === "function" ? arm() : arm) || x.dataset.arm) { fn(); return; }
    x.dataset.arm = "1"; x.textContent = "確定？"; x.classList.add("bad");
    setTimeout(function () { if (!x.isConnected) return; delete x.dataset.arm; x.textContent = label; x.classList.remove("bad"); }, 3000);
  };
  return x;
}
function tableEditor(b, t) {
  var wrap = h("div", { class: "tbe" }), warn = h("div", { class: "twarn" }), sel = null, anchor = null, drag = false, tbl = null, mgB = null, unB = null;
  function paintWarn() {
    warn.innerHTML = "";
    var bs = t.size || "giga", c = _yzTableCheck_(b, bs);
    if (c.nc < 2) return;
    var m = [];
    if (c.tooWide) m.push(["bad", "⚠ 這張表在 LINE「" + bs + "」卡片上放不下（可用寬度約 " + c.avail + " px，最少要 " + c.minTotal + " px）。可以：把卡片調大（最大是 giga）、少幾欄、字寫短一點，或改成兩張表。"]);
    else if (c.shrunk) m.push(["note", "ℹ 為了放得下，這張表在 LINE 上的字自動縮小了一號。"]);
    else m.push(["ok", "✓ 這張表在 LINE「" + bs + "」卡片上放得下。"]);
    if (c.manual && c.narrow.length) m.push(["warn", "⚠ 你自己調的欄寬裡，第 " + c.narrow.join("、") + " 欄太窄，英文或數字可能被硬拆開。建議改回「自動」。"]);
    m.push(["note", "網頁上：表格太寬時，外面會出現左右拉條（LINE 卡片沒辦法拉，只能擠）。"]);
    m.forEach(function (x) { warn.appendChild(h("div", { class: "tw " + x[0] }, [x[1]])); });
  }
  ED.warners.push(paintWarn);
  function pcts(nc) {   // 編輯器表格每一欄的寬（%）：自己調的照比例；自動的照 LINE 算出來的
    var ws = b.w && b.w.length === nc ? b.w.slice() : _yzTableFit_(b, t.size || "giga").flex.slice(0, nc), sum = 0;
    while (ws.length < nc) ws.push(1);
    ws.forEach(function (x) { sum += Number(x) || 1; });
    return ws.map(function (x) { return (Number(x) || 1) / (sum || 1) * 100; });
  }
  function selArea() { return sel ? (sel.r1 - sel.r0 + 1) * (sel.c1 - sel.c0 + 1) : 0; }
  function selHasMg() { return !!sel && (b.mg || []).some(function (m) { return !(m[0] > sel.r1 || m[0] + m[2] - 1 < sel.r0 || m[1] > sel.c1 || m[1] + m[3] - 1 < sel.c0); }); }
  function selIsOne() { if (!sel) return true; var G = _yzTblGrid_(b), p = G.ps[G.at[sel.r0][sel.c0]]; return p.r === sel.r0 && p.c === sel.c0 && p.r + p.rs - 1 === sel.r1 && p.c + p.cs - 1 === sel.c1; }
  function paintSel() {
    if (!tbl) return;
    Array.prototype.forEach.call(tbl.querySelectorAll("td[data-r]"), function (td) {
      var r = +td.getAttribute("data-r"), c = +td.getAttribute("data-c");
      td.classList.toggle("sel", !!sel && selArea() > 1 && r >= sel.r0 && r <= sel.r1 && c >= sel.c0 && c <= sel.c1);
    });
    if (mgB) { mgB.disabled = !sel || selIsOne(); mgB.title = mgB.disabled ? "先選好幾格：在格子上按住拖過去，或點一格、再按住 Shift 點另一格" : "把選好的 " + (sel.r1 - sel.r0 + 1) + " 列 × " + (sel.c1 - sel.c0 + 1) + " 欄合併成一格（字接起來放在左上角）"; }
    if (unB) unB.disabled = !selHasMg();
  }
  function cellDown(e, r, c) {
    if (e.button !== 0) return;
    if (e.shiftKey && anchor) { e.preventDefault(); sel = tbRect(b, anchor, { r: r, c: c }); paintSel(); return; }
    anchor = { r: r, c: c }; sel = tbRect(b, anchor, anchor); drag = true; paintSel();
  }
  function cellEnter(r, c) {
    if (!drag || !anchor || (anchor.r === r && anchor.c === c)) return;
    sel = tbRect(b, anchor, { r: r, c: c });
    try { if (document.activeElement && tbl.contains(document.activeElement)) document.activeElement.blur(); var ws = window.getSelection && window.getSelection(); if (ws) ws.removeAllRanges(); } catch (x) { /* 沒關係 */ }
    paintSel();
  }
  var upH = function () { drag = false; if (!wrap.isConnected) document.removeEventListener("mouseup", upH); };
  document.addEventListener("mouseup", upH);
  function gripStart(e, k) {   // 拉欄寬：左右兩欄一起變（加起來不變）
    e.preventDefault(); e.stopPropagation();
    var nc = b.rows[0].length;
    if (!(b.w && b.w.length === nc)) { var fl = _yzTableFit_(b, t.size || "giga").flex, base = fl.reduce(function (a, c) { return a + c; }, 0) / (fl.length || 1) || 1; b.w = fl.map(function (v) { return Math.max(0.1, Math.min(9, Math.round(v / base * 10) / 10)); }); }
    var x0 = e.clientX, wL = b.w[k], wR = b.w[k + 1], sum = 0, cols = tbl.querySelectorAll("col");
    b.w.forEach(function (x) { sum += x; });
    var tw = Math.max(60, tbl.getBoundingClientRect().width - tbl.rows[0].cells[0].getBoundingClientRect().width);
    var lo = Math.max(0.3, wL + wR - 9), hi = Math.min(9, wL + wR - 0.3);
    var mv = function (ev) {
      var a = Math.max(lo, Math.min(hi, wL + (ev.clientX - x0) / tw * sum));
      b.w[k] = a; b.w[k + 1] = wL + wR - a;
      var pc = pcts(nc); for (var i = 0; i < nc; i++) if (cols[i + 1]) cols[i + 1].style.width = pc[i].toFixed(2) + "%";
    };
    var up = function () {
      document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up);
      b.w = b.w.map(function (x) { return Math.max(0.1, Math.min(9, Math.round(x * 10) / 10)); });
      draw(); changed();
    };
    document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
  }
  function redo(fn) { return function () { fn(); sel = null; anchor = null; draw(); changed(); }; }
  function draw() {
    wrap.innerHTML = "";
    var nc = tbPad(b), rows = b.rows, G = _yzTblGrid_(b), manual = !!(b.w && b.w.length === nc), pc = pcts(nc), ci;
    var colHas = function (j) { return rows.some(function (r) { return String(r[j] || "").trim(); }); };
    tbl = h("table", { class: "gridT gridX" });
    var cg = h("colgroup", {}, [h("col", { class: "cg0" })]);
    pc.forEach(function (x) { cg.appendChild(h("col", { style: "width:" + x.toFixed(2) + "%" })); });
    tbl.appendChild(cg);
    var hr = h("tr", { class: "tbh" }, [h("th", { class: "tbc0" })]);   // 最上面：欄的名字（A、B、C…）、＋ ✕、拉欄寬的把手
    for (ci = 0; ci < nc; ci++) (function (ci) {
      var th = h("th", { class: "tbcol" }, [h("span", { class: "tbn" }, [TB_COL.charAt(ci) || String(ci + 1)]),
        tbMini("＋", "在右邊多一欄", redo(function () { tbInsCol(b, ci + 1); })),
        nc > 1 ? tbMini("✕", "刪掉這一欄（" + (TB_COL.charAt(ci) || ci + 1) + "）", redo(function () { tbDelCol(b, ci); }), function () { return colHas(ci); }) : null]);
      if (ci < nc - 1) {
        var gp = h("span", { class: "tbgrip", title: "按住左右拉，調這一欄和右邊那一欄的寬", role: "separator", "aria-orientation": "vertical" }, ["⇔"]);
        gp.addEventListener("pointerdown", function (e) { gripStart(e, ci); });
        th.appendChild(gp);
      }
      hr.appendChild(th);
    })(ci);
    tbl.appendChild(hr);
    rows.forEach(function (r, ri) {
      var tr = h("tr", { class: ri === 0 && b.head !== false ? "hd" : "", "data-ri": String(ri) });
      tr.appendChild(h("th", { class: "tbrow" }, [h("span", { class: "tbn" }, [String(ri + 1)]),
        tbMini("＋", "在下面多一列", redo(function () { tbInsRow(b, ri + 1); })),
        rows.length > 1 ? tbMini("✕", "刪掉這一列（第 " + (ri + 1) + " 列）", redo(function () { tbDelRow(b, ri); }), function () { return r.some(function (v) { return String(v || "").trim(); }); }) : null]));
      for (var cj = 0; cj < nc; cj++) {
        var p = G.ps[G.at[ri][cj]];
        if (p.r !== ri || p.c !== cj) continue;   // 被合併蓋住的格子
        (function (ci, p) {
          var inp = h("input", { value: r[ci] === undefined ? "" : r[ci], "aria-label": (TB_COL.charAt(ci) || ci + 1) + (ri + 1) + (p.rs * p.cs > 1 ? "（合併）" : "") });
          inp.oninput = function () { r[ci] = inp.value; changed(); };
          inp.onfocus = function () { if (!drag) { anchor = { r: ri, c: ci }; sel = tbRect(b, anchor, anchor); paintSel(); } };
          inp.onpaste = function (e) {
            var tx = (e.clipboardData && e.clipboardData.getData("text/plain")) || "";
            if (tx.indexOf("\t") >= 0 || /\n./.test(tx.replace(/\n+$/, ""))) { e.preventDefault(); b.rows = parseTSV(tx); b.w = null; delete b.mg; sel = null; draw(); changed(); toast("整張表貼上了（" + b.rows.length + " 列 × " + b.rows[0].length + " 欄）"); }
          };
          var td = h("td", { "data-r": String(ri), "data-c": String(ci), class: p.rs * p.cs > 1 ? "mg" : "" }, [inp]);
          if (p.rs > 1) td.rowSpan = p.rs;
          if (p.cs > 1) td.colSpan = p.cs;
          td.addEventListener("mousedown", function (e) { cellDown(e, ri, ci); });
          td.addEventListener("mouseenter", function () { cellEnter(ri, ci); });
          tr.appendChild(td);
        })(cj, p);
      }
      tbl.appendChild(tr);
    });
    wrap.appendChild(h("div", { class: "tscroll tbedit" }, [tbl]));
    // 工具列：合併、取消合併、刪掉空白的、多一列一欄、表頭
    mgB = btn("⊞ 合併儲存格", function () {
      if (!sel || selIsOne()) { toast("先選好幾格：在格子上按住拖過去，或點一格、再按住 Shift 點另一格"); return; }
      var a = { r: sel.r0, c: sel.c0 }; tbMerge(b, sel); anchor = a; sel = tbRect(b, a, a); draw(); changed(); toast("合併好了（字放在左上角那一格）");
    });
    unB = btn("⊟ 取消合併", function () { if (!sel) return; var n = tbUnmerge(b, sel); sel = null; anchor = null; draw(); changed(); toast(n ? "拆開了（字留在左上角那一格）" : "這裡沒有合併的格子"); });
    var hd = h("input", { type: "checkbox", checked: b.head !== false });
    hd.onchange = function () { b.head = hd.checked; draw(); changed(); };
    var blank = tbBlank(b), nb = (rows.length > 1 ? blank.rows.length : 0) + (nc > 1 ? blank.cols.length : 0);
    var clr = btn("🧹 刪掉空白的列和欄" + (nb ? "（" + nb + "）" : ""), function () { var n = tbDelBlank(b); sel = null; anchor = null; draw(); changed(); toast(n ? "刪掉了 " + n + " 個空白的列、欄" : "沒有整列、整欄都空白的"); });
    clr.disabled = !nb; clr.title = nb ? "整列、整欄都沒有字的，一次刪掉" : "沒有整列、整欄都空白的";
    wrap.appendChild(h("div", { class: "tb tbtools" }, [mgB, unB, clr,
      btn("＋列", redo(function () { tbInsRow(b, b.rows.length); })),
      btn("＋欄", redo(function () { tbInsCol(b, b.rows[0].length); })),
      h("label", { style: "margin-left:4px" }, [hd, " 第一列是表頭"]),
      h("span", { class: "muted", style: "margin-left:6px" }, [nc + " 欄 × " + rows.length + " 列" + (b.mg && b.mg.length ? "，合併 " + b.mg.length + " 處" : "")])
    ]));
    // 欄寬：自動（建議）／自己調（拉上面的 ⇔，或打比例）
    var seg = h("div", { class: "seg wseg" });
    [["auto", "欄寬：自動（建議）"], ["man", "自己調"]].forEach(function (pp) {
      var x = h("button", { class: (pp[0] === "man") === manual ? "on" : "", "data-w": pp[0] }, [pp[1]]);
      x.onclick = function () {
        if ((pp[0] === "man") === manual) return;
        if (pp[0] === "auto") b.w = null;
        else { var fl = _yzTableFit_(b, t.size || "giga").flex, base = fl.reduce(function (a, c) { return a + c; }, 0) / (fl.length || 1) || 1; b.w = fl.map(function (v) { return Math.max(0.1, Math.min(9, Math.round(v / base * 10) / 10)); }); }
        draw(); changed();
      };
      seg.appendChild(x);
    });
    var wr = h("div", { class: "wrow" }, [seg]);
    if (manual) {
      wr.appendChild(h("span", { class: "muted" }, ["每欄的比例："]));
      for (ci = 0; ci < nc; ci++) (function (ci) {
        var n = h("input", { type: "number", min: "0.1", max: "9", step: "0.1", value: String(b.w[ci] || 1), class: "wn", "aria-label": (TB_COL.charAt(ci) || ci + 1) + " 欄的比例" });
        n.oninput = function () { b.w[ci] = Math.max(0.1, Math.min(9, parseFloat(n.value) || 1)); var pc2 = pcts(nc), cols = tbl.querySelectorAll("col"); for (var i = 0; i < nc; i++) if (cols[i + 1]) cols[i + 1].style.width = pc2[i].toFixed(2) + "%"; changed(); };
        wr.appendChild(n);
      })(ci);
    }
    wrap.appendChild(wr);
    wrap.appendChild(warn);
    wrap.appendChild(hint("合併儲存格：在格子上按住拖過去（或點一格、再按住 Shift 點另一格）→「⊞ 合併儲存格」。欄寬：拉最上面那排的 ⇔。每一列左邊、每一欄上面有 ＋（多一列／欄）、✕（刪掉）。可以從 Excel、Word、網頁複製一整張表，點進任何一格按 Ctrl+V，整張就貼上了。"));
    paintWarn(); paintSel();
  }
  draw();
  return wrap;
}

/* ───────── 動畫 ─────────
 * 動畫檔不能重新壓縮（壓了就不會動了）。這裡只看檔頭，認出格式、尺寸、幾格、多長；
 * 第一格另外存成一張 JPEG（LINE 卡片放不下動畫時，顯示這一張）。檔名一樣換成亂碼。 */
function u16le(a, i) { return a[i] | (a[i + 1] << 8); }
function u16be(a, i) { return (a[i] << 8) | a[i + 1]; }
function u24le(a, i) { return a[i] | (a[i + 1] << 8) | (a[i + 2] << 16); }
function u32be(a, i) { return a[i] * 16777216 + ((a[i + 1] << 16) | (a[i + 2] << 8) | a[i + 3]); }
function u32le(a, i) { return a[i] + a[i + 1] * 256 + a[i + 2] * 65536 + a[i + 3] * 16777216; }
function ascii(a, i, n) { var s = ""; for (var k = 0; k < n && i + k < a.length; k++) s += String.fromCharCode(a[i + k]); return s; }
function sniffAnim(buf) {
  var a = new Uint8Array(buf), r = { fmt: "", animated: false, w: 0, h: 0, frames: 0, dur: 0 };
  if (a.length < 16) return r;
  var h6 = ascii(a, 0, 6), p, len, typ;
  if (h6 === "GIF87a" || h6 === "GIF89a") {
    r.fmt = "gif"; r.w = u16le(a, 6); r.h = u16le(a, 8);
    p = 13; if (a[10] & 0x80) p += 3 * (1 << ((a[10] & 7) + 1));
    while (p < a.length) {
      var t = a[p];
      if (t === 0x3B) break;
      if (t === 0x21) { if (a[p + 1] === 0xF9 && a[p + 2] === 4) r.dur += (u16le(a, p + 4) || 10) * 10; p += 2; while (p < a.length && a[p]) p += a[p] + 1; p++; continue; }
      if (t === 0x2C) { r.frames++; var pk = a[p + 9]; p += 10; if (pk & 0x80) p += 3 * (1 << ((pk & 7) + 1)); p++; while (p < a.length && a[p]) p += a[p] + 1; p++; continue; }
      break;
    }
    r.animated = r.frames > 1; return r;
  }
  if (a[0] === 0x89 && ascii(a, 1, 3) === "PNG") {
    r.fmt = "png"; p = 8;
    while (p + 8 <= a.length) {
      len = u32be(a, p); typ = ascii(a, p + 4, 4);
      if (typ === "IHDR") { r.w = u32be(a, p + 8); r.h = u32be(a, p + 12); }
      else if (typ === "acTL") { r.fmt = "apng"; r.frames = u32be(a, p + 8); }
      else if (typ === "fcTL") { var dd = u16be(a, p + 8 + 22) || 100; r.dur += Math.round(u16be(a, p + 8 + 20) * 1000 / dd); }
      else if (typ === "IEND") break;
      p += 12 + len;
    }
    r.animated = r.fmt === "apng" && r.frames > 1; return r;
  }
  if (ascii(a, 0, 4) === "RIFF" && ascii(a, 8, 4) === "WEBP") {
    r.fmt = "webp"; p = 12; var anim = false;
    while (p + 8 <= a.length) {
      typ = ascii(a, p, 4); len = u32le(a, p + 4);
      if (typ === "VP8X") { anim = !!(a[p + 8] & 2); r.w = 1 + u24le(a, p + 12); r.h = 1 + u24le(a, p + 15); }
      else if (typ === "ANMF") { r.frames++; r.dur += u24le(a, p + 8 + 12); }
      p += 8 + len + (len & 1);
    }
    r.animated = anim && r.frames > 1; return r;
  }
  return r;
}
function readAnimFile(blob, cb) {
  if (blob.size > ANIM_UP_MAX) { cb(null, { error: "檔案 " + _yzKbText_(blob.size) + "，超過上限 6 MB（Apps Script 一次收得下的大小）。請縮短秒數或縮小尺寸再傳。" }); return; }
  var fr = new FileReader();
  fr.onerror = function () { cb(null, { error: "讀不到這個檔案" }); };
  fr.onload = function () {
    var info = sniffAnim(fr.result);
    if (!info.fmt) { cb(null, { error: "這不是 GIF／APNG／WebP 動畫檔" }); return; }
    if (!info.animated) { cb(null, { error: "這個檔案只有一格，不會動。靜止的圖請用「＋圖片」" }); return; }
    var u8 = new Uint8Array(fr.result), bin = "", CH = 0x8000;
    for (var i = 0; i < u8.length; i += CH) bin += String.fromCharCode.apply(null, u8.subarray(i, i + CH));
    var uri = "data:" + (info.fmt === "gif" ? "image/gif" : info.fmt === "webp" ? "image/webp" : "image/png") + ";base64," + btoa(bin);
    var img = new Image();
    img.onload = function () {
      var w = info.w || img.naturalWidth || 1, hh = info.h || img.naturalHeight || 1, sc = Math.min(1, 1024 / Math.max(w, hh));
      var cv = document.createElement("canvas"); cv.width = Math.max(1, Math.round(w * sc)); cv.height = Math.max(1, Math.round(hh * sc));
      var g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
      info.poster = cv.toDataURL("image/jpeg", 0.85); info.w = w; info.h = hh; info.bytes = blob.size;
      cb(uri, info);
    };
    img.onerror = function () { cb(null, { error: "這個動畫檔打不開" }); };
    img.src = uri;
  };
  fr.readAsArrayBuffer(blob);
}
function animInfoText(b) {
  var p = [_yzFmtName_(b.fmt), _yzKbText_(b.bytes || 0)];
  if (b.w && b.h) p.push(b.w + "×" + b.h);
  if (b.frames > 1) p.push(b.frames + " 格");
  if (b.dur > 0) p.push((b.dur / 1000).toFixed(1) + " 秒");
  return p.join("・") + (b.demo ? "（示範檔：程式畫的，不是真的 " + _yzFmtName_(b.fmt) + "）" : "");
}
var ANIM_UP_MAX = 6 * 1024 * 1024;

function animEditor(t, b) {
  var wrap = h("div", { class: "animE" });
  var seg = h("div", { class: "seg wseg" });
  [["file", "動畫檔（GIF／APNG／WebP）"], ["steps", "分步動畫（幾張圖輪流）"]].forEach(function (p) {
    var x = h("button", { class: b.kind === p[0] ? "on" : "", "data-k": p[0], type: "button" }, [p[1]]);
    x.onclick = function () {
      if (b.kind === p[0]) return;
      b.kind = p[0];
      if (p[0] === "steps" && !(b.steps && b.steps.length)) b.steps = [{ url: "", cap: "", ar: "4:3" }, { url: "", cap: "", ar: "4:3" }];
      renderForm(); changed();
    };
    seg.appendChild(x);
  });
  wrap.appendChild(h("div", { class: "wrow" }, [seg, mkEl(17)]));
  if (b.kind === "steps") { animStepsEditor(wrap, b); return wrap; }

  var st = h("div", { class: "animst" });
  function paintSt() {
    st.innerHTML = "";
    if (!b.url) return;
    var why = _yzAnimWhy_(b, 0), mode = _yzAnimMode_(b, 0), m = [];
    if (mode === "play") m.push(["ok", "✓ LINE 卡片上：" + why.why + "。"]);
    else if (mode === "poster") m.push(["note", "ℹ LINE 卡片上：" + (YZ_CFG.animDirect ? why.why : "設定裡「動畫直接在 LINE 卡片上播放」是關的，所以只顯示第一格＋「▶ 在網頁看動畫」按鈕") + "。"]);
    else m.push(["note", "ℹ 設定裡「圖片直接顯示」是關的：LINE 卡片上連第一格都不顯示，只有「🎞 登入網頁看動畫」按鈕。"]);
    m.push(["note", "網頁上：會自動播放，可以暫停；手機有開「減少動態效果」的人，先停住、按「▶ 播放」才會動。"]);
    m.forEach(function (x) { st.appendChild(h("div", { class: "tw " + x[0] }, [x[1]])); });
  }
  var dz = dropZone({
    accept: "image/gif,image/png,image/webp",
    empty: "把動畫檔（GIF／APNG／WebP）拖進來　／　點下面選擇檔案",
    bad: "這不是 GIF／APNG／WebP 檔", done: "動畫放進來了（沒有重新壓縮，所以還是會動；存檔名稱改成亂碼）",
    ok: function (f) { return /^image\/(gif|png|webp)$/.test(f.type || "") || /\.(gif|png|apng|webp)$/i.test(f.name || ""); },
    reader: readAnimFile,
    get: function () { return b.url; }, shown: function () { return b.poster || b.url; },
    fnText: function () { return animInfoText(b) + "　存檔名稱（亂碼）：" + (b.fname || "—") + "　原檔名不保存"; },
    upload: function (uri, info) {   // 原檔（不重新壓縮，才會動）＋第一格（JPEG，LINE 卡片放不下動畫時用）
      var mime = info.fmt === "gif" ? "image/gif" : info.fmt === "webp" ? "image/webp" : "image/png";
      var u2 = uri.replace(/^data:[^;,]+;/, "data:" + mime + ";");
      return uploadUri(u2, "動畫").then(function (r1) {
        return uploadUri(info.poster, "動畫第一格").then(function (r2) {
          b.url = r1.raw; b.raw = r1.raw; b.fid = r1.fid; b.fname = r1.fname; b.poster = r2.url;
          b.fmt = info.fmt; b.bytes = info.bytes; b.w = info.w; b.h = info.h; b.frames = info.frames; b.dur = info.dur;
          b.ar = _yzAR_(info.w, info.h); b.demo = false; paintSt(); changed();
        });
      });
    },
    clear: function () { b.url = ""; b.raw = ""; b.fid = ""; b.fname = ""; b.poster = ""; b.fmt = ""; b.bytes = 0; b.w = 0; b.h = 0; b.frames = 0; b.dur = 0; b.demo = false; paintSt(); changed(); }
  });
  wrap.appendChild(dz.el);
  wrap.appendChild(st);
  var cap = h("input", { class: "in", value: b.cap || "", placeholder: "圖說（可以不填）", style: "margin-top:6px" });
  cap.oninput = function () { b.cap = cap.value; changed(); };
  wrap.appendChild(cap);
  wrap.appendChild(hint("要讓動畫在 LINE 卡片上自己動：存成 APNG、300 KB 以內、最長邊 1024 px 以內（可以縮短秒數、縮小尺寸、減少顏色）。GIF 和太大的檔，LINE 卡片只顯示第一格，旁邊放「▶ 在網頁看動畫」按鈕，網頁上照樣會動。"));
  wrap.appendChild(hint("⚠ 保密：有院內畫面的螢幕錄影，上傳前請先裁掉或遮住院名和病人資料（系統認不出來）；也不要拿去網路上的轉檔網站，內容會被送到外面。"));
  paintSt();
  return wrap;
}
function animStepsEditor(wrap, b) {
  var list = h("div", { class: "steplist" }), cnt = h("span", { class: "muted" }), add;
  function drawSteps() {
    list.innerHTML = "";
    b.steps.forEach(function (s, i) {
      var dz = dropZone({
        kind: "圖片",
        get: function () { return s.url; }, info: function () { return s.info; }, fname: function () { return s.fname; },
        empty: "把這一步的圖拖進來／點選擇檔案（也可以不放圖，只寫說明）",
        set: function (r, info) { s.url = r.url; s.fid = r.fid; s.fname = r.fname; s.info = info; s.ar = _yzAR_(info.w, info.h); edOcrNew(s); changed(); },
        clear: function () { s.url = ""; s.fid = ""; s.info = null; delete s.ocr; changed(); ocrPaint(); }
      });
      var ta = h("textarea", { class: "ta", rows: "2", placeholder: "這一步的說明（可以不填）" }); ta.value = s.cap || "";
      ta.oninput = function () { s.cap = ta.value; changed(); };
      var mv = function (d) { var j = i + d; if (j < 0 || j >= b.steps.length) return; var x = b.steps[i]; b.steps[i] = b.steps[j]; b.steps[j] = x; drawSteps(); changed(); };
      list.appendChild(h("div", { class: "steprow" }, [
        h("div", { class: "stepno" }, ["步驟 " + (i + 1)]),
        h("div", { class: "stepmain" }, [dz.el, ta, ocrLine(s)]),
        h("div", { class: "kbt" }, [btn("▲", function () { mv(-1); }), btn("▼", function () { mv(1); }), btn("✕", function () { b.steps.splice(i, 1); drawSteps(); changed(); }, "sm bad")])
      ]));
    });
    add.disabled = b.steps.length >= YZ_STEPS_MAX;
    cnt.textContent = b.steps.length + " 步（最多 " + YZ_STEPS_MAX + " 步）";
  }
  add = btn("＋新增一步", function () {
    if (b.steps.length >= YZ_STEPS_MAX) return;
    b.steps.push({ url: "", cap: "", ar: "4:3" }); drawSteps(); changed();
    var tas = $$(".steprow textarea", wrap); if (tas.length) tas[tas.length - 1].focus();
  });
  var sec = h("select", { class: "in", style: "width:auto" }, [1, 2, 3, 5].map(function (n) { return h("option", { value: String(n) }, ["每一步停 " + n + " 秒"]); }));
  sec.value = String(b.sec || 2); sec.onchange = function () { b.sec = +sec.value; changed(); };
  var lp = h("input", { type: "checkbox", checked: b.loop !== false });
  lp.onchange = function () { b.loop = lp.checked; changed(); };
  drawSteps();
  wrap.appendChild(list);
  wrap.appendChild(h("div", { class: "stepopt" }, [add, cnt, sec, h("label", {}, [lp, " 播完回到第一步（反覆播）"])]));
  wrap.appendChild(hint("LINE 上：每一步是一張卡片，左右滑著看（LINE 卡片沒辦法自己輪流播）。網頁上：自動輪播，可以暫停、上一步、下一步；手機有開「減少動態效果」的人先停在第一步。圖和檔名的處理跟「＋圖片」一樣（縮到 1600、轉 JPEG、檔名亂碼）。"));
}

/* ───────── 預覽：彈出視窗（可以拖、可以拉大、可以放到最大、可以關） ───────── */
function pvSync() {
  var w = $("#pvwin"); if (!w) return;
  var tab = $(".tab[aria-selected=true]");
  w.style.display = (tab && tab.getAttribute("data-t") === "edit" && PV.open) ? "flex" : "none";
  placePv();
}
function placePv() {
  var w = $("#pvwin"); if (!w || w.style.display === "none") return;   // 還沒顯示（在別的分頁）就先不排位置，等真的打開再排
  if (PV.max) { w.style.left = "12px"; w.style.top = "12px"; w.style.width = (innerWidth - 24) + "px"; w.style.height = (innerHeight - 24) + "px"; }
  else {
    var W = Math.min(PV.w, innerWidth - 16), H = Math.min(PV.h, innerHeight - 16);
    if (PV.x === null) {   // 第一次：放在最上面兩排工具列的下面（不蓋住格式按鍵），高度配合螢幕
      var tbw = $("#edtbw"), tabsH = ($("#hdr") || {}).offsetHeight || 58, top = tbw ? tabsH + tbw.offsetHeight + 8 : 110;
      PV.y = Math.max(110, Math.min(top, innerHeight - 380));
      PV.h = Math.min(PV.h, Math.max(360, innerHeight - PV.y - 12)); H = Math.min(PV.h, innerHeight - 16);
      PV.x = Math.max(8, innerWidth - W - 24);
    }
    PV.x = Math.min(Math.max(0, PV.x), Math.max(0, innerWidth - 80)); PV.y = Math.min(Math.max(0, PV.y), Math.max(0, innerHeight - 40));
    w.style.left = PV.x + "px"; w.style.top = PV.y + "px"; w.style.width = W + "px"; w.style.height = H + "px";
  }
  w.classList.toggle("max", PV.max);
}
function buildPvWin() {
  var old = $("#pvwin"); if (old) old.remove();
  var seg = h("div", { class: "seg", id: "pvseg" });
  [["line", "LINE 卡片"], ["web", "網頁"]].forEach(function (p) {
    var b = h("button", { class: ED.view === p[0] ? "on" : "", "data-v": p[0] }, [p[1]]);
    b.onclick = function () { ED.view = p[0]; $$("button", seg).forEach(function (x) { x.classList.toggle("on", x.getAttribute("data-v") === ED.view); }); renderSizeCtl(); refreshPreview(); };
    seg.appendChild(b);
  });
  var w = h("div", { id: "pvwin", class: "pvwin", role: "dialog", "aria-label": "預覽" }, [
    h("div", { class: "pvh", id: "pvh", title: "按住這一排可以拖動視窗" }, [
      h("b", {}, ["預覽"]), mkEl(16), h("span", { class: "muted pvsub" }, ["改一個字，這裡馬上跟著變"]), h("span", { class: "sp" }), seg,
      h("button", { class: "btn sm", id: "pvMax", title: "放到最大／還原" }, ["⛶"]), h("button", { class: "btn sm", id: "pvClose", title: "關閉預覽視窗（用最上面的 👁 可以再打開）" }, ["✕"])
    ]),
    h("div", { class: "pvc", id: "pvc" }, [h("div", { id: "pvsize" }), h("div", { id: "pvbody", style: "margin-top:8px" }), h("div", { id: "pvmeter", style: "margin-top:10px" })])
  ]);
  document.body.appendChild(w);
  $("#pvMax").onclick = function () { PV.max = !PV.max; placePv(); refreshPreview(); };
  $("#pvClose").onclick = function () { PV.open = false; pvSync(); renderToolbar(); };
  var hd = $("#pvh");
  hd.addEventListener("pointerdown", function (e) {
    if (PV.max || (e.target.closest && e.target.closest("button,select,input"))) return;
    var r = w.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
    try { hd.setPointerCapture(e.pointerId); } catch (x) { /* 沒關係 */ }
    var mv = function (ev) { PV.x = ev.clientX - dx; PV.y = ev.clientY - dy; placePv(); };
    var up = function () { hd.removeEventListener("pointermove", mv); hd.removeEventListener("pointerup", up); hd.removeEventListener("pointercancel", up); };
    hd.addEventListener("pointermove", mv); hd.addEventListener("pointerup", up); hd.addEventListener("pointercancel", up);
  });
  if (window.ResizeObserver) {
    var last = 0;
    new ResizeObserver(function () {
      if (PV.max || w.style.display === "none") return;
      if (w.offsetWidth < 100) return;
      PV.w = w.offsetWidth; PV.h = w.offsetHeight;
      cancelAnimationFrame(last); last = requestAnimationFrame(function () { refreshPreview(); });
    }).observe(w);
  }
  window.addEventListener("resize", placePv);
}
// 第 29 批：LINE 好幾張卡片的排法（標題的設定、預覽視窗都有；兩個是同一個設定）
function layDef() { return CFG && CFG.lineSwipe === false ? "page" : "swipe"; }
function layName(v) { return v === "page" ? "一頁一頁（往下排）" : "滑動式（左右滑）"; }
function laySeg(t, small) {
  var wrap = h("div", { class: "layw" + (small ? " sm" : "") }), info = h("div", { class: "hint layinfo" });
  var seg = h("div", { class: "seg layseg", role: "radiogroup", "aria-label": "LINE 好幾張卡片怎麼排" }), tm = null;
  var opts = [["", small ? "照設定" : "照設定（現在是「" + layName(layDef()) + "」）"], ["swipe", small ? "滑動式" : "滑動式（左右滑）"], ["page", small ? "一頁一頁" : "一頁一頁（往下排）"]];
  opts.forEach(function (p) {
    var x = h("button", { type: "button", "data-lay": p[0] || "def", role: "radio" }, [p[1]]);
    x.onclick = function () {
      if (p[0]) t.lay = p[0]; else delete t.lay;
      sync(); changed();
      if (!small) renderSizeCtl();
    };
    seg.appendChild(x);
  });
  function btns() { Array.prototype.forEach.call(seg.children, function (y) { var on = (y.getAttribute("data-lay") === "def" ? "" : y.getAttribute("data-lay")) === (t.lay || ""); y.classList.toggle("on", on); y.setAttribute("aria-checked", on ? "true" : "false"); }); }
  function sync() {
    btns();
    if (small) return;
    var r = null, lay = _yzLayOf_(t, CFG);
    try { r = lineCards(edChI(edCh(t.ch)), t, { hb: edHb(), size: t.size, lay: lay }); } catch (e) { r = null; }
    var n = r ? r.cards : 0;
    info.textContent = !r ? "" : n <= 1 ? "這個標題在 LINE 現在是 1 張卡片（只有 1 張的時候，兩種都一樣）。" :
      "這個標題在 LINE 現在是 " + n + " 張卡片 → " + (lay === "page" ? "一頁一頁：每張自己一則訊息，往下排" + (r.packed ? "（LINE 一次最多 5 則：第 5 則起放成左右滑）" : "") : "滑動式：合成一則，左右滑著看") + "。分步動畫一律左右滑。";
  }
  sync();
  wrap.appendChild(seg);
  if (!small) {
    wrap.appendChild(info);
    wrap.appendChild(hint("沒選的標題，照「管理 → 設定」裡的預設。想從某一塊開始放到下一張卡片：用那一塊右上角的「📄 換下一張」。"));
  }
  ED.warners.push(function () { if (!wrap.isConnected) return; btns(); clearTimeout(tm); tm = setTimeout(sync, small ? 0 : 400); });   // 按鍵馬上跟著變；「現在幾張」等停手再算
  return wrap;
}
function renderSizeCtl() {
  var box = $("#pvsize"); if (!box) return; box.innerHTML = "";
  if (ED.cur.kind === "map") {   // 目錄圖：LINE 卡片大小（決定每個地點在手機上有多大）／網頁寬度
    if (ED.view === "line") {
      box.appendChild(lbl("二", "LINE 卡片大小（目錄圖）", mk(6)));
      box.appendChild(h("div", { class: "ends" }, [h("span", {}, ["◂ LINE 最小"]), h("span", {}, ["LINE 最大 ▸"])]));
      box.appendChild(sizeSeg(ED.cat.size || "giga", function (s) { ED.cat.size = s; changed(); }));
      box.appendChild(hint("卡片越小，圖上的地點在手機上越小、越不好點；右邊「檢查」會用這個大小幫你算。"));
    } else {
      box.appendChild(lbl("二", "網頁目錄圖寬度", mk(6)));
      box.appendChild(rangeRow(320, 1200, ED.cat.web || 960, "px", function (v) { ED.cat.web = v; changed(); }));
    }
    return;
  }
  var isCh = ED.cur.kind === "ch", t = ED.cur.kind === "title" ? edTitle(ED.cur.id) : null;
  if (!isCh && !t) return;
  if (ED.view === "line") {
    box.appendChild(lbl("二", isCh ? "LINE 卡片大小（所有章元共用）" : "LINE 卡片大小", mk(6)));
    box.appendChild(h("div", { class: "ends" }, [h("span", {}, ["◂ LINE 最小"]), h("span", {}, ["LINE 最大 ▸"])]));
    box.appendChild(sizeSeg(isCh ? ED.cfg.chSize : (t.size || "giga"), function (s) {
      if (isCh) { ED.cfg.chSize = s; ED.chapters.forEach(function (x) { x.size = s; }); } else t.size = s;
      changed();
    }));
    if (!isCh) { box.appendChild(lbl("", "好幾張卡片怎麼排")); box.appendChild(laySeg(t, true)); }   // 第 29 批
  } else {
    box.appendChild(lbl("二", isCh ? "網頁章元卡片寬度（所有章元共用）" : "網頁內容寬度", mk(6)));
    var min = isCh ? 160 : 320, max = isCh ? 320 : 860, val = isCh ? ED.cfg.chWeb : (t.ww || 760);
    box.appendChild(rangeRow(min, max, val, "px", function (v) { if (isCh) ED.cfg.chWeb = v; else t.ww = v; changed(); }));
  }
}
function meterRow(label, bytes, cap) {
  var pct = bytes / cap * 100, cls = "meter" + (bytes > cap ? " over" : pct > 80 ? " warn" : "");
  return h("div", { class: "mrow" }, [h("span", {}, [label]), h("div", { class: cls }, [h("i", { style: "width:" + Math.min(100, pct).toFixed(0) + "%" })]), h("span", { class: "num" }, [kb(bytes) + " / " + kb(cap)])]);
}
function refreshPreview() {
  var body = $("#pvbody"), meter = $("#pvmeter"); if (!body) return;
  if (PV.pano) { PV.pano.destroy(); PV.pano = null; }   // 3D 目錄：重畫前先收掉
  body.innerHTML = ""; meter.innerHTML = "";
  var seg = $$("#pvseg button"); seg.forEach(function (x) { x.classList.toggle("on", x.getAttribute("data-v") === ED.view); });
  var pvw = $("#pvc").clientWidth || 380;
  var stackOf = function (bubbles) { var st = h("div", { class: "pvstack" }); bubbles.forEach(function (b) { st.appendChild(FlexView.render(b, {})); }); return h("div", { class: "pvwrap" }, [st]); };
  if (ED.cur.kind === "qz") { qePreview(body, meter); return; }   // 第 32 批：問卷、考試
  if (ED.cur.kind === "mq") {
    if (ED.view === "line") { body.appendChild(h("div", { class: "pvempty" }, ["LINE 沒有跑馬燈（只有網頁有）。", "切到上面的「網頁」看樣子。"])); return; }
    body.appendChild(h("div", { class: "mqpv", style: "padding:10px" }, [mqPreview(edMq())]));
    return;
  }
  if (ED.cur.kind === "map") {
    var cat = ED.cat, cw = cat.web || 760;
    if (!cat.img || !cat.on) {
      body.appendChild(h("div", { class: "pvempty" }, [!cat.img ? "還沒有目錄圖。" : "「開啟目錄圖」關掉了。", "這時候 LINE 的「🏠 首頁」和網頁的首頁，都會改回章元卡片。"]));
      return;
    }
    var pcat = _yzMapLive_(cat, edHb(), false);   // 預覽＝藥師看到的樣子（還沒有標題的章是🔒）
    if (ED.view === "line") {
      var lm = lineMap(pcat, edHb(), {});
      body.appendChild(h("div", { class: "pvwrap" }, [FlexView.render(lm.bubble, {})]));
      if (lm.split) {
        var lmn = lm.each.length;
        lm.each.forEach(function (by, k) { meter.appendChild(meterRow(_yzMapPartName_(k, lmn), by, YZ_BUBBLE_SAFE)); });
        meter.appendChild(meterRow((lmn === 3 ? "三張" : "兩張") + "一排（一則）", lm.bytes, YZ_MSG_SAFE));
        meter.appendChild(hint(lmn === 3 ? "圖很寬（寬是高的 " + YZ_MAP_WIDE3 + " 倍以上），所以 LINE 上切成左、中、右三張，左右滑著看（切開的地方剛好接上、不重疊；卡片標題寫「目錄｜左邊　■□□」）。每個按鍵照「圓點在哪一張」放到那一張；一張的東西放大約 1.5 倍，標籤比較不擠。切好的三張圖是自動做的，檔名一樣亂碼。"
          : "圖很寬，所以 LINE 上切成左右兩張，左右滑著看（切開的地方剛好接上、不重疊；卡片標題寫「目錄｜左半邊　■□」）。每個按鍵照「圓點在哪一半」放到那一張。切好的兩張圖是自動做的，檔名一樣亂碼。（寬是高的 " + YZ_MAP_WIDE3 + " 倍以上會切成三張。）"));
        if (_yzMapNeedCut_(cat)) meter.appendChild(hint("⚠ " + _yzMapCutWhy_(cat) + "，現在還是舊的切法：按「儲存」（或等自動存檔）就會重新切好。"));   // 第 38 批：張數一樣的，寫「切開的地方要改成不重疊」
      } else meter.appendChild(meterRow("這一張", lm.bytes, YZ_BUBBLE_SAFE));
      meter.appendChild(hint("每個地點＝透明的「物品框」＋「標籤方塊」（圖示＋名稱＋圓點），兩個都點得到。是照 LINE 官方規格畫的；手機上實際長相要實機確認（待實機確認）。LINE 沒有「滑過」、也沒有 3D，滑過、說明卡、拖曳轉動只有網頁有（切到「網頁」看）。「圖片直接顯示」關掉時，圖不放，改成每個地點一個按鈕。"));
    } else if (panoOk(cat) && edCatSrc()) {
      var pvb = h("div", { class: "pvpano" }); body.appendChild(pvb);
      var pw2 = webCatalogPano(pvb, pcat, edHb(), { img: edCatSrc(), onSpot: function (to) { var i3 = _yzMapToInfo_(to, edHb()); toast("（預覽：這裡會跳到　" + (i3.ok ? i3.name : "（找不到）") + "）"); } });
      if (pw2) PV.pano = pw2._api;
      meter.appendChild(hint("3D 環景：拖曳＝左右轉、上下看；滾輪（手機兩指）＝放大縮小；下面一排按鍵也可以。滑鼠移到按鍵或東西上：標籤變橘紅、畫面往那邊靠、出現說明卡；按說明卡（或再點一下）才進去。手機上：第一下＝選到（畫面轉過去），第二下＝進去。不支援 3D 的電腦，會自動改回平面的圖。"));
    } else {
      var mb = h("div", { class: "pvweb", style: "width:" + (cw + 26) + "px;max-width:none" }, [webCatalogMap(pcat, edHb(), { width: cw, onSpot: function (to) { var i2 = _yzMapToInfo_(to, edHb()); toast("（預覽：這裡會跳到　" + (i2.ok ? i2.name : "（找不到）") + "）"); } })]);
      var mz = Math.min(1, (pvw - 28) / (cw + 26)); if (mz < 1) mb.style.zoom = mz.toFixed(3);
      body.appendChild(h("div", { class: "pvwebwrap" }, [mb]));
      meter.appendChild(hint((cat.fx !== false ? "滑鼠移到標籤或東西上：標籤變橘紅、鏡頭靠近、底下出現說明卡；按說明卡（或再點一下）才進去。手機上：第一下＝選到，第二下＝進去。" : "動態效果關掉了：滑過只會讓標籤變色。") + (mz < 1 ? "（這裡縮小到 " + Math.round(mz * 100) + "% 顯示，實際寬度 " + cw + " px）" : "")));
    }
    return;
  }
  if (ED.cur.kind === "ch") {
    var c = edCh(ED.cur.id); if (!c) return;
    var n = (ED.titles[c.id] || []).length;
    if (ED.view === "line") {
      var lc = lineChapter(edChI(c), n);
      body.appendChild(h("div", { class: "pvwrap" }, [FlexView.render(lc.bubble, {})]));
      meter.appendChild(meterRow("這一張", lc.bytes, YZ_BUBBLE_SAFE));
      var fakeAll = ED.chapters.map(function (x) { return Object.assign({}, x, { img: _yzChBg_(x) ? fakeUrl(0) : "", bg: null }); });
      meter.appendChild(meterRow(ED.chapters.length + " 張一排", _yzBytes_(_yzChapterList_(fakeAll, edCounts())), YZ_MSG_SAFE));
      meter.appendChild(hint("LINE：一排最多 12 張、一則訊息不能超過 50 KB。"));
    } else body.appendChild(h("div", { class: "pvwebwrap" }, [webChapterCard(c, n, { width: ED.cfg.chWeb, hb: edHb() })]));
    return;
  }
  var t = edTitle(ED.cur.id); if (!t) return;
  var ch = edCh(t.ch), ts = ED.titles[ch.id], i = ts.indexOf(t);
  if (ED.view === "line") {
    var r = lineCards(edChI(ch), t, { hb: edHb(), size: t.size, lay: _yzLayOf_(t, CFG), dev: true, editUrl: YZ_CFG.webUrl + "?edit=1", prev: i > 0 ? "x" : null, next: i < ts.length - 1 ? "x" : null });
    body.appendChild(stackOf(r.bubbles));
    r.bytes.forEach(function (by, kk) {
      var car = r.kinds && r.kinds[kk] === "carousel", nn = car ? r.bubbles[kk].contents.length : 1;
      meter.appendChild(meterRow(car ? "第 " + (kk + 1) + " 則（" + nn + " 張，左右滑）" : "第 " + (kk + 1) + " 則（1 張）", by, car ? YZ_MSG_SAFE : YZ_BUBBLE_SAFE));
    });
    var tot2 = 0; r.bytes.forEach(function (x) { tot2 += x; });
    var nBrk = (t.blocks || []).filter(function (b, bi) { return bi > 0 && b.brk; }).length;
    meter.appendChild(hint("這個標題 ＝ " + r.cards + " 張卡片" + (r.cards > 1 ? (r.lay === "page" ? "（一頁一頁：每張自己一則" + (r.packed ? "；LINE 一次最多 5 則，第 5 則起左右滑" : "") + "）" : "（滑動式：左右滑）") : "") + "，" + r.bubbles.length + " 則訊息（共 " + kb(tot2) + "）。" + (nBrk ? "其中 " + nBrk + " 處是你按了「📄 換下一張」。" : "太擠的話，在要換到下一張的那一塊按「📄 換下一張」。") + "一張卡片的上限 LINE 是約 30 KB，我抓 27 KB 留空，超過也會自動拆成下一張。" + (r.bubbles.length > YZ_REPLY_MAX ? " ⚠ LINE 一次回覆最多 5 則訊息，第 6 則以後會被截掉：內容太多了，請把一部分分到別的標題。" : "")));
    if (YZ_SIZES.indexOf(t.size || "giga") < YZ_SIZES.indexOf("kilo")) meter.appendChild(hint("⚠ 小於 kilo 的卡片很窄，放表格或長文字會很擠（看上面預覽）。"));
    (t.blocks || []).forEach(function (b, bi) {
      if (b.t !== "table") return;
      var cc = _yzTableCheck_(b, t.size || "giga");
      if (cc.tooWide) meter.appendChild(h("div", { class: "tw bad" }, ["⚠ 第 " + (bi + 1) + " 塊（表格）在「" + (t.size || "giga") + "」放不下，欄位被擠到很窄（可用約 " + cc.avail + " px，最少要 " + cc.minTotal + " px）。"]));
    });
    if (r.anim) meter.appendChild(hint("🎞 這個標題有 " + r.anim + " 張會在 LINE 卡片上自己動的圖（LINE 規定一則訊息最多 " + YZ_ANIM_PER_MSG + " 張，多的會改成第一格＋按鈕）。"));
    var ni = (t.blocks || []).filter(function (b) { return b.t === "img" && b.url && !b.draw; }).length;   // 流程圖不算（存成 PNG）
    if (ni) meter.appendChild(hint("圖片 " + ni + " 張：存檔前會自動縮到最長邊 1600、轉成 JPEG（LINE 規定一張圖不能超過 1 MB）。卡片大小上限算的是網址，不是圖檔本身。"));
  } else {
    var wd = t.ww || 760;
    var art = webArticle(ch, t, { width: wd, onImg: lightbox, hb: edHb(), pv: true, onTitle: function () { toast("（預覽：這裡會跳到那個標題）"); }, onChapter: function () { toast("（預覽：這裡會跳到那一章）"); } });
    var box = h("div", { class: "pvweb" }, [art]);
    box.style.width = (wd + 26) + "px";
    var z = Math.min(1, (pvw - 28) / (wd + 26)); if (z < 1) box.style.zoom = z.toFixed(3);
    body.appendChild(h("div", { class: "pvwebwrap" }, [box]));
    if (z < 1) meter.appendChild(hint("這裡縮小到 " + Math.round(z * 100) + "% 顯示（實際寬度 " + wd + " px）。"));
    meter.appendChild(h("div", { style: "margin-top:6px" }, [btn("🔍 用實際大小看", function () { bigWebPreview(ch, t); })]));
  }
}
function bigWebPreview(ch, t) {
  var w = t.ww || 760;
  var box = h("div", { class: "pvweb", style: "width:" + (w + 26) + "px;max-width:none;max-height:none;margin:0 auto" }, [webArticle(ch, t, { width: w, onImg: lightbox, hb: edHb(), onTitle: function () { toast("（預覽：這裡會跳到那個標題）"); }, onChapter: function () { toast("（預覽：這裡會跳到那一章）"); } })]);
  var ov = h("div", { class: "bigov", onclick: function (e) { if (e.target === ov) ov.remove(); } }, [
    h("div", { class: "bigbar" }, [h("b", {}, ["網頁實際大小（內容寬 " + w + " px）"]), h("span", { style: "flex:1" }), btn("關閉", function () { ov.remove(); }, "sm pri")]),
    h("div", { class: "bigbody" }, [box])
  ]);
  document.body.appendChild(ov);
}
function renderEdit() { renderToolbar(); renderTree(); renderForm(); renderSizeCtl(); refreshPreview(); pvSync(); }
function gotoEdit(tid) { if (!ED) edReset(); if (edTitle(tid)) { ED.cur = { kind: "title", id: tid }; ED.mode = "ch"; ED.ab = null; } showTab("edit"); }
function edTitleExists(tid) { if (!ED) edReset(); return !!edTitle(tid); }
// 閒置登出時：還沒存的修改留在記憶體（不存進瀏覽器），重新驗證後接著編輯
function edKeep() { return { chapters: ED.chapters, titles: ED.titles, kws: ED.kws, cat: ED.cat, rev: ED.rev, cur: ED.cur, mode: ED.mode, cfg: ED.cfg, restore: ED.restore }; }
function edRestore(k) { edReset(); ED.chapters = k.chapters; ED.titles = k.titles; ED.kws = k.kws; ED.cat = k.cat; ED.rev = k.rev; ED.cfg = k.cfg; ED.dirty = true; ED.restore = k.restore || null; if (ED.restore) AS.pause = "restore"; edPick(k.cur, k.mode); asKick(); }
// 看的那邊拿到新的手冊（別人改了）：編輯器沒改東西就換成新的；有改就留著（存的時候會問要不要蓋掉）
function edBaseChanged() { if (!ED || ED.dirty || ED.saving || UPL) return; var cur = ED.cur, mode = ED.mode; edReset(); edPick(cur, mode); if (TAB === "edit") renderEdit(); }
// 目錄圖的圖（3D 預覽要用原始檔）：剛放進來還沒存的 → 瀏覽器裡那一份；手冊裡存的那一張 → 向後端拿
function edCatSrc() {
  var cat = ED.cat;
  if (ED.catLocal && ED.catLocal.fid === cat.fid) return ED.catLocal.url;
  if (HB && HB.cat && cat.fid && cat.fid === HB.cat.fid) return catBlob(HB.cat, function () { if (ED && ED.cur.kind === "map" && ED.view === "web") refreshPreview(); }) || "";
  return "";
}

function buildEditPane() {
  edReset();
  var pane = $("#pane-edit");
  pane.innerHTML = '<p class="sub">最上面一排是工具列（🕘 舊版本、儲存、新增內容，捲到哪裡都在）；左邊選章元／標題（或「🖼 目錄圖」）；中間填內容；預覽是浮動視窗。<b>有修改會自動儲存</b>（停手 3 秒就存，最上面的「自動存檔」可以關掉），存好 LINE 和網頁就看得到。</p>' +
    '<div class="edwrap"><div class="edtbw" id="edtbw"><div class="edtb" id="edtb"></div><div class="edfmt" id="edfmt"></div></div><div class="edgrid"><div class="c1" id="edc1"></div><div class="c2" id="edc2"></div></div></div>';
  RTE.cur = null; RTE.pop = null; RTE.bar = null;
  $("#edfmt").appendChild(rteBuildBar());
  buildPvWin();
  asInit();
  ED_OPENED = false;
  renderEdit();
}
// 第 28 批：第一次打開「✏️ 編輯」（不是一進網頁就做；只看手冊的時候不會跳出提醒、不會存檔）：
//   ① 還沒辨識的圖，在背景辨識；② 自動存檔開著、有章元背景或物品形狀還沒做（例如這一批「覆核」多亮電腦）：自動做好、存好（不用按「儲存」）
//   第 35 批：③ LINE 用的目錄圖還是舊的切法（很寬的圖改切三張）：一樣自動切好、存好
var ED_OPENED = false;
function edOnShow() {
  if (!ED || ED_OPENED) return;
  ED_OPENED = true;
  edOcrPump();
  setTimeout(function () { if (ED && TAB === "edit" && AS.on && !AS.pause && !ED.dirty && !ED.saving && !UPL && (edShapeNeed() || edBgTodo().length || _yzMapNeedCut_(ED.cat))) saveEd(false, true); }, 1500);   // 第 35 批：LINE 目錄圖要改切三張的，也自動切好、存好
  setTimeout(edClean, 6000);
}
// 第 31 批：每天第一次打開編輯器：在背景清掉超過 N 天的舊版本、沒在用的舊圖（換過的目錄圖、重做過的章元背景…）→ 雲端硬碟的垃圾桶
function edClean() {
  call("hbClean", []).then(function (r) {
    if (!r || !r.ok || (!r.ver && !r.img)) return;
    toast("🧹 清掉了" + (r.img ? " " + r.img + " 張沒在用的舊圖" : "") + (r.img && r.ver ? "、" : "") + (r.ver ? " " + r.ver + " 份舊版本" : "") + "（丟到雲端硬碟的垃圾桶，30 天內救得回來）");
  }, function () { /* 下次打開再清 */ });
}

/* ── 編輯的第三個分頁「🖼 目錄圖」：換圖、在圖上拖拉框出「可以點的地方」（LINE 卡片的畫法在 cards.js）── */
function edSpot(id) { var a = ED.cat.spots; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
// 選一個地點。不重畫整頁（拖拉到一半不能把畫面換掉）：只換框框的高亮、右邊的面板、左邊的清單
function mapPick(id) {
  ED.cur = { kind: "map", id: id || "" }; ED.mode = "map";
  if (ED.mapUi) { ED.mapUi.onPick(); renderTree(); } else renderEdit();
}
function mapAdd(cx, cy) {
  var cat = ED.cat, first = ED.chapters[0], w = 14, hh = 20;
  var x = cx === undefined ? 40 : Math.round(cx - w / 2), y = cy === undefined ? 35 : Math.round(cy - hh / 2);
  x = Math.max(0, Math.min(100 - w, x)); y = Math.max(0, Math.min(100 - hh, y));
  var s = { id: "p" + Date.now() + cat.spots.length, label: "新地點", to: first ? "c:" + first.id : "", x: x, y: y, w: w, h: hh, pos: "t", ico: "", desc: "", st: "" };
  cat.spots.push(s); markDirty(); ED.cur = { kind: "map", id: s.id }; ED.mode = "map"; renderEdit();
}
// 左邊清單的 ⚠／✖ 小記號：直接改，不重畫整個清單（重畫會讓「剛好在點清單」的那一下點不到）
function mapTreeBadges() {
  var chk = _yzMapCheck_(ED.cat, edHb());
  $$("#edc1 .spi").forEach(function (el) {
    var id = el.getAttribute("data-id"), lv = mapIssueLv(chk, id), b = $(".spw", el);
    if (!lv) { if (b) b.remove(); return; }
    if (!b) { b = h("span", { class: "spw" }); el.appendChild(b); }
    b.className = "spw " + lv; b.title = (chk.spots[id] || []).filter(function (x) { return x.lv !== "info"; }).map(function (x) { return x.msg; }).join("\n"); b.textContent = lv === "bad" ? "✖" : "⚠";
  });
}
function mapIssueLv(chk, id) { var a = chk.spots[id] || []; return a.some(function (x) { return x.lv === "bad"; }) ? "bad" : a.some(function (x) { return x.lv === "warn"; }) ? "warn" : ""; }   // 第 32 批：「說明」（info，例如 LINE 上自動換方向）不算問題

/* ── 左邊：地點清單 ── */
function renderMapTree(c1) {
  var cat = ED.cat, hb = edHb(), chk = _yzMapCheck_(cat, hb);
  c1.appendChild(h("div", { class: "chT kwi" + (!ED.cur.id ? " on" : ""), onclick: function () { mapPick(""); } }, ["🖼 " + (cat.title || "目錄圖") + "　（圖與設定）"]));
  c1.appendChild(lbl("", "圖上的地點（" + cat.spots.length + "　／　LINE 最多放 " + YZ_MAP_MAX + " 個）"));
  cat.spots.forEach(function (s, i) {
    var info = _yzMapToInfo_(s.to, hb), lv = mapIssueLv(chk, s.id), iss = (chk.spots[s.id] || []).map(function (x) { return x.msg; }).join("\n");
    c1.appendChild(h("div", { class: "chT kwi spi" + (ED.cur.id === s.id ? " on" : ""), "data-id": s.id, onclick: function () { mapPick(s.id); } }, [
      h("span", { class: "spn" }, [String(i + 1)]),
      h("span", { class: "spt" }, [(s.st === "lock" ? "🔒 " : s.ico ? s.ico + " " : "") + (s.label || "（沒有名稱）") + (s.st === "new" ? " 🔴" : ""), h("span", { class: "muted spto" }, [s.st === "lock" && !info.ok ? " → （尚未開放）" : " → " + (info.ok ? info.short : "找不到")])]),
      lv ? h("span", { class: "spw " + lv, title: iss }, [lv === "bad" ? "✖" : "⚠"]) : null
    ]));
  });
  if (!cat.spots.length) c1.appendChild(h("div", { class: "muted", style: "padding:6px 8px;font-size:12.5px" }, ["還沒有地點。按下面的「＋新增地點」，或在圖上快點兩下。"]));
  c1.appendChild(h("div", { style: "padding-top:8px" }, [btn("＋新增地點", function () { mapAdd(); })]));
}

/* ── 中間：圖、設定、拖拉框、這個地點的設定、檢查 ── */
function renderMapForm(f) {
  var cat = ED.cat, MIN = YZ_MAP_MIN_PCT, ui = { nums: null }; ED.mapUi = ui;
  f.appendChild(h("h3", { style: "font-size:16px" }, ["🖼 目錄圖", mkEl(25)]));
  f.appendChild(hint("LINE 和網頁的「首頁」（目錄）可以是一張實景圖（像你的「圖一」）：在圖上框出每一樣東西，每樣東西會有一個「標籤（圖示＋名稱）＋圓點」，點標籤或點東西，就進到那一章（或某一個標題）。網頁的首頁是整個畫面的 3D 環景（可以拖曳轉動、縮放）；LINE 上圖很寬就切成左右兩張（非常寬的切成左、中、右三張）。還沒有標題的章，藥師看到的是🔒（寫好第一個標題就自動打開）。"));

  // ① 圖
  f.appendChild(lbl("", "目錄圖片（圖片檔名自動換成亂碼）"));
  var dz = dropZone({
    max: 2000,
    get: function () { return cat.img; }, info: function () { return cat.info; }, fname: function () { return cat.fname; },
    empty: "把目錄圖拖進來　／　點這裡之後按 Ctrl+V 貼上",
    done: "目錄圖放好了（檔名換成亂碼；很寬的圖也切好了給 LINE 用：左右兩張，非常寬的左中右三張）。按「儲存」才會生效",
    upload: function (uri, info) {   // 原圖（最長邊 2000）＋很寬的話切好的兩張（或三張），一起上傳
      var had = !!cat.img;
      return uploadUri(uri, "目錄圖").then(function (r) {
        return catPartsUp(uri, info).then(function (parts) {
          cat.img = r.url; cat.fid = r.fid; cat.fname = r.fname; cat.info = info; cat.w = info.w; cat.h = info.h; cat.ar = _yzAR_(info.w, info.h); catPartsSet(cat, parts);
          if (!had) cat.on = true;   // 第一次放圖：順便打開「開啟目錄圖」（不想用再取消勾選）
          ED.catLocal = { fid: r.fid, url: uri };
          syncOn(); markDirty(); drawCanvas(); changed(); renderTree(); queueShape(edSpot(ED.cur.id));
        });
      });
    },
    clear: function () { cat.img = ""; cat.fid = ""; cat.info = null; cat.fname = ""; cat.parts = []; cat.parts3 = []; cat.on = false; syncOn(); markDirty(); drawCanvas(); changed(); renderTree(); }
  });
  var onBox = null;   // 「開啟目錄圖」那一格（放圖、移除圖的時候，勾勾跟著變）
  function syncOn() { var c = onBox && onBox.querySelector("input"); if (c) c.checked = !!cat.on; }
  f.appendChild(dz.el);
  f.appendChild(hint("換圖的時候，圖上框好的地點位置不會動（用的是「佔整張圖的幾 %」）；新的圖如果長寬比不一樣，請再檢查一下框的位置。手機（LINE）上圖只有約 340 px 寬，標籤很容易擠在一起：同一排的東西不要超過 4 個，或讓標籤一個放上面、一個放下面。圖裡面不要有醫院名稱、人臉、病人資料（檔名會換亂碼，但圖裡面的字不會動）——要用自己拍的照片，請先把這些蓋掉或模糊。"));

  // ② 設定
  function chkBox(label, get, set, note) {
    var c = h("input", { type: "checkbox" }); c.checked = !!get();
    c.onchange = function () { set(c.checked); c.checked = !!get(); drawCanvas(); changed(); };
    return h("label", { class: "mck" }, [c, h("span", {}, [h("b", {}, [label]), note ? h("span", { class: "muted mcn" }, ["　" + note]) : null])]);
  }
  onBox = chkBox("開啟目錄圖", function () { return cat.on; }, function (v) { if (v && !cat.img) { toast("先放一張目錄圖"); cat.on = false; return; } cat.on = v; }, "關掉：LINE 的「🏠 首頁」和網頁的首頁改回章元卡片");
  f.appendChild(h("div", { class: "mset" }, [
    onBox,
    chkBox("圖上顯示標籤（圖示＋名稱＋圓點）", function () { return cat.labels !== false; }, function (v) { cat.labels = v; }, "圖裡面已經有字的話，可以關掉（物品還是點得到）"),
    chkBox("網頁：3D 環景（拖曳轉動、上下看、縮放）", function () { return cat.p3d !== false; }, function (v) { cat.p3d = v; }, "圖很寬（像全景照）的時候最好看。電腦或手機不支援 3D 的時候，自動改回平面的圖"),
    chkBox("LINE：很寬的圖切成好幾張", function () { return cat.split !== false; }, function (v) { cat.split = v; if (v && cat.img && (!_yzMapSplitOn_(cat) || _yzMapNeedCut_(cat))) catPartsAgain(); }, "一張卡片會太矮、標籤擠在一起；寬是高的 " + YZ_MAP_WIDE + " 倍以上切成左右兩張、" + YZ_MAP_WIDE3 + " 倍以上切成左中右三張，左右滑著看（每兩張中間重疊一點）。圖不寬的時候沒有作用"),
    chkBox("網頁：圖淡一點（有按鍵的物品比較亮）", function () { return cat.dim !== false; }, function (v) { cat.dim = v; }, "整張圖的顏色淡一點，看起來比較不亂；框起來的物品留一半顏色。還沒開放（🔒）的章一直是淡的。LINE 的圖不變"),
    chkBox("網頁：滑過的動態效果", function () { return cat.fx !== false; }, function (v) { cat.fx = v; }, "滑到哪個按鍵，圖上那個物品就亮起來（手機：點一下）；還有標籤變色、畫面靠過去、底下的說明卡、飄浮光點、圓點光圈。只有網頁有，LINE 沒有「滑過」"),
    chkBox("圖下面加按鈕（備用）", function () { return !!cat.btns; }, function (v) { cat.btns = v; }, "每個地點一個按鈕。LINE 圖上的方塊萬一點不了，還有按鈕可以按" )
  ]));
  f.appendChild(h("div", { class: "msel2" }, [
    h("div", {}, [lbl("", "標題（卡片最上面的大字）"), (function () { var i = h("input", { class: "in", value: cat.title || "", maxlength: "20" }); i.oninput = function () { cat.title = i.value; renderTree(); changed(); }; return i; })()]),
    h("div", {}, [lbl("", "提示文字（標題下面的小字）"), (function () { var i = h("input", { class: "in", value: cat.hint || "", maxlength: "30" }); i.oninput = function () { cat.hint = i.value; changed(); }; return i; })()])
  ]));

  // ③ 拖拉
  f.appendChild(lbl("", "在圖上框出每一樣東西（虛線框＝物品框；圓點在框的正中間）", mk(26)));
  f.appendChild(hint("拖方框＝移動　拖四個角＝放大縮小　方向鍵＝微調 1%（Shift＋方向鍵＝調大小；加按 Alt＝一次 5%）　在圖上空白處快點兩下＝新增。標籤會擺在圓點的上／下／左／右（在下面「這個地點的設定」選）。"));
  var cv = h("div", { class: "mcv", id: "mcv" });
  f.appendChild(cv);
  var pn = h("div", { class: "mpanel", id: "mpanel" });
  f.appendChild(pn);
  var ck = h("div", { class: "mchk", id: "mchk" });
  f.appendChild(ck);

  function arStage() { return $(".catstage", cv); }
  function paintBox(bx, s) {
    bx.style.left = s.x + "%"; bx.style.top = s.y + "%"; bx.style.width = s.w + "%"; bx.style.height = s.h + "%";
    bx.className = bx.className.replace(/\b(pos|st)-\w+\b/g, "").replace(/\s+/g, " ").trim() + " pos-" + _yzMapPos_(s.pos) + (_yzMapSt_(s.st) ? " st-" + _yzMapSt_(s.st) : "");
  }
  function updateChip(bx, s) {   // 換掉圓點和標籤（名稱、圖示、狀態改了的時候）
    $$(".sp-dot, .sp-tag", bx).forEach(function (x) { x.remove(); });
    var first = $(".hnd", bx), n = _yzMapNorm_(s);
    webSpotTag(n, cat, false).forEach(function (k) { bx.insertBefore(k, first); });
    bx.setAttribute("aria-label", "地點 " + (cat.spots.indexOf(s) + 1) + "：" + (s.label || "沒有名稱"));
  }
  function spotBox(s, i) {
    var bx = h("div", { class: "mbx mspot" + (ED.cur.id === s.id ? " sel" : ""), "data-id": s.id, tabindex: "0", role: "button" });
    bx.appendChild(h("span", { class: "nn" }, [String(i + 1)]));
    ["nw", "ne", "sw", "se"].forEach(function (k) { bx.appendChild(h("i", { class: "hnd " + k, "data-h": k })); });
    paintBox(bx, s); updateChip(bx, s);
    return bx;
  }
  function drawCanvas() {
    cv.innerHTML = "";
    if (!cat.img) { cv.appendChild(h("div", { class: "muted", style: "padding:46px 12px;text-align:center;line-height:1.5" }, ["還沒有圖。先在上面放一張圖，才能在圖上框地點。"])); return; }
    var stage = h("div", { class: "catstage", style: "aspect-ratio:" + arCss(cat.ar) }, [h("img", { src: cat.img, alt: "", draggable: "false" })]);
    cat.spots.forEach(function (s, i) { stage.appendChild(spotBox(s, i)); });
    cv.appendChild(stage);
    markIssues(); shapeSvg();
  }
  function markIssues() {
    var chk = _yzMapCheck_(cat, edHb());
    $$(".mbx", cv).forEach(function (bx) { var lv = mapIssueLv(chk, bx.getAttribute("data-id")); bx.classList.toggle("bad", lv === "bad"); bx.classList.toggle("warn", lv === "warn"); });
    mapTreeBadges();
  }
  function paintSel() { $$(".mbx", cv).forEach(function (bx) { bx.classList.toggle("sel", bx.getAttribute("data-id") === ED.cur.id); }); shapeSvg(); }
  // 物品的外框（綠色）：自動找到的形狀；選到的那個比較明顯。點選的位置：小十字
  function shapeSvg() {
    var st = arStage(); if (!st) return;
    $$(".mshp, .mpick", st).forEach(function (x) { x.remove(); });
    var ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "mshp"); svg.setAttribute("viewBox", "0 0 100 100"); svg.setAttribute("preserveAspectRatio", "none"); svg.setAttribute("aria-hidden", "true");
    cat.spots.forEach(function (s) {
      if (s.lit === "box" || !s.shape || s.shape.k !== shKey(cat, s)) return;   // 還沒找、或框／圖換過（舊的不畫）
      (s.shape.r || []).forEach(function (r) {
        var pg = document.createElementNS(ns, "polygon"), pts = [];
        for (var k = 0; k + 1 < r.length; k += 2) pts.push(r[k] + "," + r[k + 1]);
        pg.setAttribute("points", pts.join(" ")); if (s.id === ED.cur.id) pg.setAttribute("class", "on");
        svg.appendChild(pg);
      });
    });
    st.insertBefore(svg, $(".mbx", st));
    var sel = edSpot(ED.cur.id);
    if (sel && sel.lit !== "box" && Array.isArray(sel.pick)) st.appendChild(h("i", { class: "mpick", style: "left:" + sel.pick[0] + "%;top:" + sel.pick[1] + "%", title: "只亮這一樣" }));
  }
  var shT = 0;
  function shapeStat(s, how) {   // 這個地點設定裡的那一行狀態
    var el = $("#shpStat", pn); if (!el || !s || ED.cur.id !== s.id) return;
    var ok = s.shape && s.shape.k === shKey(cat, s), n = ok ? (s.shape.r || []).length : -1, nm = ok && s.shape.nm ? s.shape.nm : "";
    el.className = "shpst" + (how === "busy" ? " busy" : n > 0 && s.lit !== "box" ? " ok" : "");
    el.textContent = s.lit === "box" ? "滑到時亮整個框（框裡的背景也會亮）。" : how === "busy" ? "⏳ 找物品中…" : how === "noimg" ? "拿不到目錄圖的原始檔，按「儲存」時再找。" :
      nm ? "✅ 自動找到「" + nm + "」（圖上綠色的外框）：滑到時整個物品都會亮，不用設定。" :
      n > 0 ? "✅ 找到 " + n + " 樣物品（圖上綠色的外框）：滑到時只亮外框裡面" + (Array.isArray(s.pick) ? "（你點的那一樣）" : "") + "。" :
      n === 0 ? "框裡找不到物品：滑到時亮整個框。可以把框調整一下，或點一下要亮的物品。" : "按「儲存」時會自動找。";
  }
  function queueShape(s, fast) {   // 選到、框動了、點選了：等一下（不要一邊拖一邊算）再找這一個
    clearTimeout(shT);
    if (!s) return;
    if (!shNeed(cat, s)) { shapeStat(s); return; }
    shapeStat(s, "busy");
    shT = setTimeout(function () {
      edCatImg().then(function (img) {
        if (!edSpot(s.id) || !shNeed(cat, s)) { shapeStat(s); return; }
        edShapeOne(img, s); markDirty(); shapeSvg(); shapeStat(s); refreshPreview();
      }, function () { shapeStat(s, "noimg"); });
    }, fast ? 40 : 450);
  }
  // 點選要亮的物品：在框裡點一下（這時候點圖不會拖框）
  cv.addEventListener("pointerdown", function (e) {
    var s = edSpot(ui.picking || ""); if (!s) return;
    var stage = arStage(); if (!stage) return;
    e.preventDefault(); e.stopImmediatePropagation();
    var rc = stage.getBoundingClientRect(), x = (e.clientX - rc.left) / rc.width * 100, y = (e.clientY - rc.top) / rc.height * 100;
    if (x < s.x || x > s.x + s.w || y < s.y || y > s.y + s.h) { toast("要點在這個地點的框裡面"); return; }
    s.pick = [Math.round(x * 10) / 10, Math.round(y * 10) / 10]; ui.picking = null; cv.classList.remove("picking");
    changed(); shapeSvg(); drawPanel(); queueShape(s, true);
  }, true);

  // 很寬的圖：切好的不見了（之前關掉過「切成好幾張」）、或切法換了（第 35 批：很寬的改切三張）→ 用原始檔重新切、上傳
  function catPartsAgain() {
    toast("切圖中…");
    catSrcP().then(function (src) { return catPartsUp(src, { w: cat.w, h: cat.h }); }).then(function (parts) { catPartsSet(cat, parts); markDirty(); drawCanvas(); changed(); toast(parts.length === 3 ? "切好了（左中右三張）" : parts.length ? "切好了（左右兩張）" : "圖不夠寬，不用切"); }, function (e) { toast("❌ " + (e && e.message || "切圖失敗") + "（要重新切圖：請重新放一次目錄圖）"); });
  }

  // 拖拉：移動、四個角放大縮小
  var raf = 0;
  function softChanged() { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; changed(); markIssues(); }); }
  function apply(mode, st, dx, dy, s) {
    var X = st.x, Y = st.y, W = st.w, H = st.h, r = Math.round;
    if (mode === "move") { s.x = Math.max(0, Math.min(100 - W, r(X + dx))); s.y = Math.max(0, Math.min(100 - H, r(Y + dy))); s.w = W; s.h = H; return; }
    var x0 = X, y0 = Y, x1 = X + W, y1 = Y + H;
    if (mode === "nw" || mode === "sw") x0 = Math.max(0, Math.min(x1 - MIN, r(X + dx)));
    if (mode === "ne" || mode === "se") x1 = Math.min(100, Math.max(x0 + MIN, r(X + W + dx)));
    if (mode === "nw" || mode === "ne") y0 = Math.max(0, Math.min(y1 - MIN, r(Y + dy)));
    if (mode === "sw" || mode === "se") y1 = Math.min(100, Math.max(y0 + MIN, r(Y + H + dy)));
    s.x = x0; s.y = y0; s.w = x1 - x0; s.h = y1 - y0;
  }
  cv.addEventListener("pointerdown", function (e) {
    var bx = e.target.closest && e.target.closest(".mbx"); if (!bx) return;
    var s = edSpot(bx.getAttribute("data-id")); if (!s) return;
    e.preventDefault();
    var hn = e.target.closest(".hnd"), mode = hn ? hn.getAttribute("data-h") : "move";
    if (ED.cur.id !== s.id) mapPick(s.id);
    try { bx.focus({ preventScroll: true }); } catch (x) { /* 沒關係 */ }
    var rc = arStage().getBoundingClientRect(), st = { x: s.x, y: s.y, w: s.w, h: s.h }, px = e.clientX, py = e.clientY;
    try { bx.setPointerCapture(e.pointerId); } catch (x2) { /* 沒關係 */ }
    function mv(ev) {
      apply(mode, st, (ev.clientX - px) / rc.width * 100, (ev.clientY - py) / rc.height * 100, s);
      paintBox(bx, s); syncNums(); softChanged();
    }
    function up() {
      bx.removeEventListener("pointermove", mv); bx.removeEventListener("pointerup", up); bx.removeEventListener("pointercancel", up);
      if (s.x !== st.x || s.y !== st.y || s.w !== st.w || s.h !== st.h) { pickInBox(s); changed(); markIssues(); renderTree(); shapeSvg(); queueShape(s); }
    }
    bx.addEventListener("pointermove", mv); bx.addEventListener("pointerup", up); bx.addEventListener("pointercancel", up);
  });
  cv.addEventListener("keydown", function (e) {
    var bx = e.target.closest && e.target.closest(".mbx"); if (!bx || e.target !== bx) return;
    var s = edSpot(bx.getAttribute("data-id")); if (!s) return;
    var d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]; if (!d) return;
    e.preventDefault();
    var step = e.altKey ? 5 : 1, st = { x: s.x, y: s.y, w: s.w, h: s.h };
    if (e.shiftKey) { s.w = Math.max(MIN, Math.min(100 - s.x, s.w + d[0] * step)); s.h = Math.max(MIN, Math.min(100 - s.y, s.h + d[1] * step)); }
    else { s.x = Math.max(0, Math.min(100 - s.w, s.x + d[0] * step)); s.y = Math.max(0, Math.min(100 - s.h, s.y + d[1] * step)); }
    paintBox(bx, s); syncNums(); pickInBox(s); changed(); markIssues(); renderTree(); shapeSvg(); queueShape(s);
  });
  function pickInBox(s) { if (Array.isArray(s.pick) && (s.pick[0] < s.x || s.pick[0] > s.x + s.w || s.pick[1] < s.y || s.pick[1] > s.y + s.h)) s.pick = null; }   // 框移走了，點選的位置不在框裡：不算數
  cv.addEventListener("dblclick", function (e) {
    if (e.target.closest && e.target.closest(".mbx")) return;
    var stage = arStage(); if (!stage) return;
    var rc = stage.getBoundingClientRect(); if (e.clientX < rc.left || e.clientX > rc.right || e.clientY < rc.top || e.clientY > rc.bottom) return;
    mapAdd((e.clientX - rc.left) / rc.width * 100, (e.clientY - rc.top) / rc.height * 100);
  });
  cv.addEventListener("pointerdown", function (e) { if (!(e.target.closest && e.target.closest(".mbx")) && ED.cur.id) { /* 點空白處＝不選任何一個 */ mapPick(""); } });

  // 這個地點的設定
  function syncNums() {
    var s = edSpot(ED.cur.id); if (!s || !ui.nums) return;
    ["x", "y", "w", "h"].forEach(function (k) { if (document.activeElement !== ui.nums[k]) ui.nums[k].value = String(s[k]); });
    var px = YZ_BUBBLE_PX[cat.size || "giga"] || 340, ar = String(cat.ar || "20:13").split(":"), ih = px * (Number(ar[1]) || 13) / (Number(ar[0]) || 20);
    if (ui.nums.px) ui.nums.px.textContent = "在「" + (cat.size || "giga") + "」卡片上約 " + Math.round(s.w / 100 * px) + "×" + Math.round(s.h / 100 * ih) + " px";
  }
  function targetSelect(s) {
    var sel = h("select", { class: "in", "aria-label": "連到哪裡" }), ok = _yzMapToInfo_(s.to, edHb()).ok, lock = s.st === "lock";
    if (lock) sel.appendChild(h("option", { value: "-" }, ["（先不連：尚未開放）"]));
    else if (!ok) sel.appendChild(h("option", { value: "", selected: "selected" }, ["（找不到，請重新選一個）"]));
    var qg = h("optgroup", { label: "📋 問卷" });   // 第 32 批：連到問卷清單（藥師點了看到開放中的問卷、考試）
    qg.appendChild(h("option", { value: "q:all" }, ["問卷（清單）"]));
    sel.appendChild(qg);
    ED.chapters.forEach(function (c) {
      var g = h("optgroup", { label: c.name || "（還沒有章名）" });
      g.appendChild(h("option", { value: "c:" + c.id }, ["整章：" + (c.name || "")]));
      (ED.titles[c.id] || []).forEach(function (t) { g.appendChild(h("option", { value: "t:" + t.id }, ["　標題：" + (t.name || "（還沒有標題）")])); });
      sel.appendChild(g);
    });
    if (ok) sel.value = s.to; else if (lock) sel.value = "-";
    sel.onchange = function () { if (!sel.value) return; s.to = sel.value === "-" ? "" : sel.value; renderTree(); changed(); markIssues(); };
    return sel;
  }
  function refreshBox(s) { var bx = $('.mbx[data-id="' + s.id + '"]', cv); if (bx) { paintBox(bx, s); updateChip(bx, s); } }
  function seg2(opts, cur, onPick) {   // 一排按鈕選一個
    var g = h("div", { class: "seg" });
    opts.forEach(function (p) {
      var b = h("button", { type: "button", class: cur === p[0] ? "on" : "", "data-p": p[0] }, [p[1]]);
      b.onclick = function () { $$("button", g).forEach(function (x) { x.classList.toggle("on", x === b); }); onPick(p[0]); };
      g.appendChild(b);
    });
    return g;
  }
  var ICONS = ["💊", "💧", "🧊", "📞", "📋", "🚨", "🗂️", "💉", "📦", "🧾", "♻️", "❓"];
  function drawPanel() {
    pn.innerHTML = ""; ui.nums = null;
    var s = edSpot(ED.cur.id);
    if (!s) { pn.appendChild(h("div", { class: "muted", style: "padding:8px 2px" }, ["點圖上的一個方框（或左邊清單的一個地點），就能在這裡改它的名稱、圖示、說明、狀態、標籤方向、連到哪裡、位置和大小。"])); return; }
    var i = cat.spots.indexOf(s);
    function touched(tree) { refreshBox(s); if (tree) renderTree(); changed(); markIssues(); }
    pn.appendChild(h("div", { class: "mph" }, [h("span", { class: "spn" }, [String(i + 1)]), h("b", {}, ["這個地點的設定"])]));
    // 名稱、圖示
    var nm = h("input", { class: "in", value: s.label || "", maxlength: "20", "aria-label": "地點名稱" });
    nm.oninput = function () { s.label = nm.value; touched(true); };
    var ic = h("input", { class: "in", value: s.ico || "", maxlength: "8", "aria-label": "圖示（一個表情符號）", style: "width:5.5em;text-align:center" });
    ic.oninput = function () { s.ico = ic.value.replace(/\s/g, ""); touched(true); };
    var picks = h("div", { class: "icopick" }, ICONS.map(function (e) { return h("button", { type: "button", title: "用 " + e, onclick: function () { s.ico = e; ic.value = e; touched(true); } }, [e]); }).concat([h("button", { type: "button", title: "不要圖示", onclick: function () { s.ico = ""; ic.value = ""; touched(true); } }, ["無"])]));
    pn.appendChild(h("div", { class: "mgrid" }, [
      h("div", {}, [lbl("", "名稱（標籤上的字；4 個字最剛好）"), nm]),
      h("div", {}, [lbl("", "圖示（標籤前面的小符號，可以不放）"), h("div", { style: "display:flex;gap:6px;align-items:center;flex-wrap:wrap" }, [ic, picks])])
    ]));
    // 說明
    var ds = h("input", { class: "in", value: s.desc || "", maxlength: "30", "aria-label": "一句話說明", placeholder: "例：錠劑怎麼調、怎麼核對" });
    ds.oninput = function () { s.desc = ds.value; changed(); markIssues(); };
    pn.appendChild(h("div", {}, [lbl("", "一句話說明（網頁上滑過去時，底下說明卡的那一句；LINE 沒有「滑過」，所以 LINE 上不放）"), ds]));
    // 狀態、標籤方向
    var stSeg = seg2([["", "一般"], ["lock", "🔒 尚未開放"], ["new", "🔴 新"]], _yzMapSt_(s.st), function (v) { s.st = v; touched(true); drawPanel(); });
    var posSeg = seg2([["t", "上"], ["b", "下"], ["l", "左"], ["r", "右"]], _yzMapPos_(s.pos), function (v) { s.pos = v; touched(false); });
    pn.appendChild(h("div", { class: "mgrid" }, [
      h("div", {}, [lbl("", "狀態"), stSeg, h("div", { class: "muted", style: "font-size:12px;margin-top:3px" }, [s.st === "lock" ? "🔒 標籤變灰色；點了只會說「還在整理」，不會進到那一章。" : s.st === "new" ? "🔴 標籤上多一顆紅點，提醒大家有新東西。" : "一般：點了就進到那一章。"])]),
      h("div", {}, [lbl("", "標籤放在圓點的"), posSeg])
    ]));
    // 連到哪裡、位置大小
    pn.appendChild(h("div", { class: "mgrid" }, [h("div", {}, [lbl("", "點了連到哪裡" + (s.st === "lock" ? "（尚未開放：可以先不選）" : "")), targetSelect(s)]), h("div", {}, [lbl("", "物品框的位置和大小（佔整張圖的 %）"), (function () {
      var wrap = h("div", { class: "mnums" }); ui.nums = {};
      [["x", "左"], ["y", "上"], ["w", "寬"], ["h", "高"]].forEach(function (p) {
        var inp = h("input", { class: "in", type: "number", min: "0", max: "100", step: "1", value: String(s[p[0]]), "aria-label": p[1] + "（%）" });
        ui.nums[p[0]] = inp;
        inp.oninput = function () {
          var v = Math.round(Number(inp.value)); if (!isFinite(v)) return;
          if (p[0] === "x") s.x = Math.max(0, Math.min(100 - MIN, v)); else if (p[0] === "y") s.y = Math.max(0, Math.min(100 - MIN, v));
          else if (p[0] === "w") s.w = Math.max(MIN, Math.min(100, v)); else s.h = Math.max(MIN, Math.min(100, v));
          var bx = $('.mbx[data-id="' + s.id + '"]', cv); if (bx) paintBox(bx, s);
          syncNums(); pickInBox(s); changed(); markIssues(); shapeSvg(); queueShape(s);
        };
        inp.onchange = function () { inp.value = String(s[p[0]]); mapTreeBadges(); };
        wrap.appendChild(h("label", { class: "mnum" }, [h("span", {}, [p[1]]), inp]));
      });
      return wrap;
    })(), (function () { ui.nums.px = h("div", { class: "muted", style: "font-size:12px;margin-top:3px" }); return ui.nums.px; })()])]));
    // 滑到時亮哪裡（第 26 批）
    var litSeg = seg2([["", "自動找物品"], ["box", "整個框"]], s.lit === "box" ? "box" : "", function (v) { s.lit = v; if (v === "box") { s.shape = null; ui.picking = null; cv.classList.remove("picking"); } changed(); shapeSvg(); drawPanel(); queueShape(s, true); });
    var pickRow = s.lit === "box" ? null : h("div", { class: "mpickrow" }, [
      btn(ui.picking === s.id ? "取消點選" : "👆 點一下要亮的物品", function () {
        ui.picking = ui.picking === s.id ? null : s.id; cv.classList.toggle("picking", !!ui.picking); drawPanel();
        if (ui.picking) toast("在圖上這個地點的框裡，點一下要亮的那一樣");
      }, "sm" + (ui.picking === s.id ? " pri" : "")),
      Array.isArray(s.pick) ? btn("框裡的都亮（不指定）", function () { s.pick = null; changed(); shapeSvg(); drawPanel(); queueShape(s, true); }, "sm") : null
    ]);
    pn.appendChild(h("div", { class: "mlit" }, [
      lbl("", "滑到這個地點時，圖上亮哪裡（網頁）"), litSeg,
      h("div", { id: "shpStat", class: "shpst" }, [""]),
      pickRow,
      h("div", { class: "muted", style: "font-size:12px;margin-top:4px;line-height:1.5" }, [s.lit === "box" ? "整個框都亮（框裡的背景也亮）。" : "不用設定：程式自動找出這個按鍵的物品，整個物品都會亮（例如藥師法規＝整本書），背景不亮。找得不對才需要：按「👆 點一下要亮的物品」再點圖上那一樣，或改成「整個框」。LINE 不受影響。"])
    ]));
    pn.appendChild(h("div", { style: "display:flex;gap:6px;flex-wrap:wrap;margin-top:10px" }, [
      btn("複製這個地點", function () {
        var c = clone(s); c.id = "p" + Date.now() + cat.spots.length; c.x = Math.min(100 - c.w, c.x + 3); c.y = Math.min(100 - c.h, c.y + 3); c.label = (s.label || "") + "2";
        cat.spots.push(c); markDirty(); ED.cur = { kind: "map", id: c.id }; renderEdit();
      }),
      confirmBtn("刪除這個地點", function () { var k = cat.spots.indexOf(s); cat.spots.splice(k, 1); markDirty(); ED.cur = { kind: "map", id: "" }; renderEdit(); })
    ]));
    syncNums(); shapeStat(s);
  }
  function drawChecks() {
    var r = _yzMapCheck_(cat, edHb()); ck.innerHTML = "";
    ck.appendChild(h("div", { class: "lbl" }, ["檢查（用「" + (cat.size || "giga") + "」卡片、圖寬約 " + r.px + " px 算）"]));
    var infos = r.general.filter(function (g) { return g.lv === "info"; });
    var oneMi = function (g) { return h("div", { class: "mi " + g.lv }, [h("span", { class: "mic" }, [g.lv === "bad" ? "✖" : g.lv === "info" ? "ℹ️" : "⚠"]), h("span", {}, [g.msg])]); };
    var spotInfos = [];   // 第 32 批：每個地點的「說明」（例如 LINE 上太擠、標籤自動換方向）
    cat.spots.forEach(function (s, i) { (r.spots[s.id] || []).forEach(function (x) { if (x.lv === "info") spotInfos.push({ lv: "info", msg: "第 " + (i + 1) + " 個「" + (s.label || "沒有名稱") + "」：" + x.msg }); }); });
    if (!r.bad && !r.warn) {
      ck.appendChild(h("div", { class: "mok" }, ["✅ 沒有問題：每個地點都點得到、連得到，標籤放得下，章元都有地方點。"]));
      if (infos.length || spotInfos.length) ck.appendChild(h("div", { class: "mlist" }, infos.concat(spotInfos).map(oneMi)));
      return;
    }
    var box = h("div", { class: "mlist" });
    r.general.forEach(function (g) { box.appendChild(oneMi(g)); });
    cat.spots.forEach(function (s, i) {
      (r.spots[s.id] || []).forEach(function (x) {
        box.appendChild(h("div", { class: "mi " + x.lv + " go", onclick: function () { mapPick(s.id); } }, [h("span", { class: "mic" }, [x.lv === "bad" ? "✖" : x.lv === "info" ? "ℹ️" : "⚠"]), h("span", {}, [h("b", {}, ["第 " + (i + 1) + " 個「" + (s.label || "沒有名稱") + "」："]), x.msg])]));
      });
    });
    ck.appendChild(box);
  }
  ui.onPick = function () { if (ui.picking && ui.picking !== ED.cur.id) { ui.picking = null; cv.classList.remove("picking"); } paintSel(); drawPanel(); queueShape(edSpot(ED.cur.id)); };
  ED.warners.push(drawChecks);
  drawCanvas(); drawPanel(); drawChecks(); queueShape(edSpot(ED.cur.id));
}

/* ── 算「這張卡片多大」用的：圖片網址換成跟真的一樣長的 Drive 網址（預覽裡的圖是內嵌的，網址太長會誤判） ───────── */
var FAKE_PREFIX = "https://drive.google.com/thumbnail?id=1AbCdEfGhIjKlMnOpQrStUvWxYz";
function fakeUrl(i) { return FAKE_PREFIX + ("00000" + i).slice(-5) + "&sz=w1000"; }
function unfake(node, blocks) {
  if (!node || typeof node !== "object") return node;
  if (Array.isArray(node)) { node.forEach(function (x) { unfake(x, blocks); }); return node; }
  if (node.type === "image" && typeof node.url === "string" && node.url.indexOf(FAKE_PREFIX) === 0) {
    // 網址尾巴的數字 ＝ 第幾個內容塊 ×100 ＋ 第幾張圖（0＝主圖、1＝動畫的第一格、10 起＝分步動畫的第幾步、50 起＝階梯式內容裡的第幾張圖）
    var code = parseInt(node.url.slice(FAKE_PREFIX.length, FAKE_PREFIX.length + 5), 10), bi = Math.floor(code / 100), j = code % 100, b = blocks && blocks[bi], u = null;
    if (b) {
      if (j >= 50) { var li = b.t === "ladder" ? _yzLadderImgs_(b)[j - 50] : null; u = li && li.img ? li.img.url : null; }   // 50 起＝階梯式內容裡的第幾張圖
      else if (j === 0) u = b.draw && drPvOf(b) ? drPvOf(b).full : b.url; else if (j === 1) u = b.poster; else if (j === 2) u = drPvOf(b) ? drPvOf(b).line : (b.draw && b.draw.line ? b.draw.line.url : null); else if (b.steps && b.steps[j - 10]) u = b.steps[j - 10].url;   // 2＝流程圖 LINE 用的那張（第 40 批）
    }
    if (u) node.url = u;
  }
  for (var k in node) if (node[k] && typeof node[k] === "object") unfake(node[k], blocks);
  return node;
}
function lineCards(ch, t, opts) {
  _yzLadderNumberAll_(edHb());   // 條文「接續上一段」的起始號碼先算好（下面複製出來的內容塊也會帶著）
  var fb = (t.blocks || []).map(function (b, i) {
    if (b.t === "img" && b.draw) {   // 第 40 批：流程圖（改過還沒畫成圖片的：瀏覽器先畫一張預覽）
      var pv = drPv(b), lu = pv ? pv.line : b.draw.line && b.draw.line.url;
      if (!pv && !b.url) return b;
      return Object.assign({}, b, { url: fakeUrl(i * 100), ar: pv ? pv.ar : b.ar, draw: Object.assign({}, b.draw, { line: lu ? { url: fakeUrl(i * 100 + 2), ar: pv ? pv.lar : b.draw.line.ar } : null }) });
    }
    if (b.t === "img" && b.url) return Object.assign({}, b, { url: fakeUrl(i * 100) });
    if (b.t === "anim") {
      if (b.kind === "steps") return Object.assign({}, b, { steps: (b.steps || []).map(function (st, j) { return st && st.url ? Object.assign({}, st, { url: fakeUrl(i * 100 + 10 + j) }) : st; }) });
      return Object.assign({}, b, { url: b.url ? fakeUrl(i * 100) : "", poster: b.poster ? fakeUrl(i * 100 + 1) : "" });
    }
    if (b.t === "ladder" && (b.items || []).some(_yzLadderIsImg_)) {   // 階梯式裡的圖片行：照順序編 50、51…（跟 _yzLadderImgs_ 的順序一樣）
      var k = 0;
      return Object.assign({}, b, { items: b.items.map(function (it) { return _yzLadderIsImg_(it) && it.img.url ? Object.assign({}, it, { img: Object.assign({}, it.img, { url: fakeUrl(i * 100 + 50 + (k++)) }) }) : it; }) });
    }
    return b;
  });
  var tsx = (ED && ED.titles && ED.titles[t.ch]) || [], pth = tsx.indexOf(t) >= 0 ? _yzTPath_(tsx, t).map(function (x) { return x.name; }) : [];   // 第 43 批：上層標題
  var r = _yzContentBubbles_(ch, t, fb, t.note, Object.assign({ hb: HB, path: pth }, opts));
  if (!(opts && opts.keepFake)) r.bubbles.forEach(function (b) { unfake(b, t.blocks); });   // keepFake：給檢查程式用，保留「跟真的一樣長的 Drive 網址」
  return r;
}
function lineChapter(ch, n) {
  var fc = Object.assign({}, ch, { img: _yzChBg_(ch) ? fakeUrl(0) : "", bg: null });
  var bytes = _yzBytes_(_yzChapterBubble_(fc, n));
  var b = _yzChapterBubble_(ch, n);
  return { bubble: b, bytes: bytes };
}
// 目錄圖卡片：算大小時圖片網址換成跟真的一樣長的 Drive 網址（預覽裡的圖是內嵌的，網址太長會誤判）
function lineMap(cat, hb, over) {   // 很寬的圖切成左右兩張的時候，bubble 是「一排兩張」（carousel），bytes 是兩張合起來
  var c = Object.assign({}, cat, over || {});
  var fk = function (pt) { return Object.assign({}, pt, { img: pt.img ? fakeUrl(0) : "" }); };
  var fake = Object.assign({}, c, { img: c.img ? fakeUrl(0) : "", parts: (c.parts || []).map(fk), parts3: (c.parts3 || []).map(fk) });
  var home = _yzMapHome_(c, hb);
  return { bubble: home, bytes: _yzBytes_(_yzMapHome_(fake, hb)), split: home.type === "carousel", each: home.type === "carousel" ? _yzMapHome_(fake, hb).contents.map(_yzBytes_) : null };
}
function chapterListBytes() {
  var chs = HB.chapters.map(function (c) { return Object.assign({}, c, { img: fakeUrl(0) }); });
  return _yzBytes_(_yzChapterList_(chs, counts()));
}


// 第 35 批：切好的放回去：三張放 parts3、兩張放 parts（另一個清空；退回第 34 批的程式時，舊程式看不到三張 → LINE 照舊一整張，不會切錯）
function catPartsSet(cat, list) { var o = _yzMapWithParts_(cat, list); cat.parts = o.parts; cat.parts3 = o.parts3; }
/* ── 很寬的目錄圖：切成左右兩張（LINE 用）；第 35 批：寬是高的 2.6 倍以上切成三張。第 38 批：切開的地方不重疊（兩張 0～50、50～100 %；三張 0～33.33、33.33～66.67、66.67～100 %，三張一樣寬）。
   每張寬不超過 1024 px，上傳（檔名一樣亂碼）。src 要是瀏覽器裡的圖（data: 或 blob: 網址）：Google 的圖片網址畫進畫布後讀不出像素 */
function catPartsUp(src, info) {
  var ar = info && info.w && info.h ? info.w / info.h : 0;
  if (ar && ar < YZ_MAP_WIDE) return Promise.resolve([]);
  return new Promise(function (ok, bad) {
    var img = new Image();
    img.onload = function () {
      var W = img.naturalWidth || 1, H = img.naturalHeight || 1;
      if (W / H < YZ_MAP_WIDE) { ok([]); return; }
      try {
        var cuts = _yzMapCutsFor_(W / H).map(function (c) {
          var x0 = Math.round(W * c[0] / 100), x1 = Math.round(W * c[1] / 100), k = Math.min(1, 1024 / Math.max(1, x1 - x0)), cv = document.createElement("canvas");
          cv.width = Math.max(1, Math.round((x1 - x0) * k)); cv.height = Math.max(1, Math.round(H * k));
          var g = cv.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, x0, 0, x1 - x0, H, 0, 0, cv.width, cv.height);
          return { uri: cv.toDataURL("image/jpeg", 0.86), x0: c[0], x1: c[1], w: cv.width, h: cv.height };
        });
      } catch (e) { bad(new Error("切圖失敗")); return; }
      Promise.all(cuts.map(function (p) { return uploadUri(p.uri, "目錄圖半張").then(function (r) { return { img: r.url, fid: r.fid, fname: r.fname, x0: p.x0, x1: p.x1, w: p.w, h: p.h }; }); })).then(ok, bad);
    };
    img.onerror = function () { bad(new Error("讀不到這張圖，沒辦法切")); };
    img.src = src;
  });
}

/* ════════ draw.js ════════ */
/* ───────── 流程圖（第 40 批：編輯器自由畫）─────────
   方框、圓角框、判斷（菱形）、開始／結束、橢圓、說明框、只有字；從框旁邊的藍點拉到另一個框＝箭頭（箭頭上可以寫「是／否」）。
   每個框可以選顏色（黑框白底、藍、黃、紅、綠、紫、灰）；框裡的字用文字塊的格式（紅字、粗體、螢光筆、編號…，上面的格式列都能用）。
   畫面＝SVG（框、箭頭）＋框裡的字用 HTML（foreignObject）。存檔時把同一份 SVG 畫成 PNG（整張、LINE 用的沒有說明框的那一張），上傳到手冊的雲端資料夾（檔名亂碼）。
   PNG 裡另外存一份畫的資料（tEXt「yzdraw」）：退回舊版本、在舊的編輯器存過檔（draw 被拿掉，只剩圖）→ 換回來以後可以「🔀 還原成流程圖」。
   資料格式見 cards.js 的「流程圖」。 */
var DR_FONT = "'Noto Sans TC','Noto Sans CJK TC','PingFang TC','Microsoft JhengHei','Heiti TC',system-ui,sans-serif";
var DR_FS = 15, DR_LH = 1.45, DR_GRID = 10, DR_ARROW = "#2F6FD6", DR_PAD = 16, DR_HIST = 80;
var DR_DEF = { box: [200, 64], round: [200, 64], dia: [180, 100], pill: [180, 56], oval: [180, 76], note: [260, 160], txt: [180, 40] };
var DR_ADD = [["box", "▭ 方框"], ["round", "▢ 圓角框"], ["dia", "◇ 判斷"], ["pill", "⬭ 開始／結束"], ["oval", "◯ 橢圓"], ["note", "📝 說明框"], ["txt", "T 只有字"]];
var DRW_Z = new WeakMap(), DRW_AT = new WeakMap();   // 每一張流程圖：畫布放大多少；上一次畫成圖的時間
var DRW = { act: null };   // 正在畫的那一張（自動存檔先不重畫它的圖，停手或離開了再畫）

function drEsc(s) { return String(s === null || s === undefined ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function drSnap(v) { return Math.round(v / DR_GRID) * DR_GRID; }
function drShape(d, id) { var a = (d && d.s) || []; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
function drLink(d, id) { var a = (d && d.l) || []; for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i]; return null; }
function drNewId(d, p) { var ids = {}, n = 1; ((d.s || []).concat(d.l || [])).forEach(function (x) { ids[x.id] = 1; }); while (ids[p + n]) n++; return p + n; }
function drNew() {   // 新的流程圖：先放「開始 → 第一步」（看得出怎麼用）
  return { v: 1, W: 640, H: 300, s: [{ id: "s1", k: "pill", x: 220, y: 30, w: 200, h: 56, v: "開始" }, { id: "s2", k: "box", x: 200, y: 140, w: 240, h: 64, v: "第一步（連點兩下改字）" }], l: [{ id: "l1", a: "s1", b: "s2" }] };
}
function drState(d) { return JSON.stringify({ W: d.W, H: d.H, s: d.s, l: d.l }); }   // 復原／重做存的那一份
function drSig(d) {   // 畫出來的樣子有關的（跟後端整理過的一樣：欄位順序、字數、頭尾空白都不影響）
  var tx = function (v, n) { return String(v === null || v === undefined ? "" : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").slice(0, n); };
  return JSON.stringify([(d.s || []).map(function (s) { var a = [s.id, s.k, Math.round(s.x), Math.round(s.y), Math.round(s.w), Math.round(s.h), s.c || "", s.al || "", tx(s.v, 2000)]; if (s.ds) a.push(s.ds); return a; }),   // 第 41 批的欄位有用到才放（以前畫好的指紋不變，不用重畫）
    (d.l || []).map(function (l) { var a = [l.id, l.a, l.b, tx(l.t, 30).replace(/[\r\n]+/g, " ").trim(), l.st || "", l.ah || ""]; if (l.ds || l.lw || l.lc) a.push(l.ds || "", l.lw || "", l.lc || ""); return a; })]);
}
function drHash(d) { var s = drSig(d), x = 0x811c9dc5; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return ("0000000" + x.toString(16)).slice(-8); }
function drBackOk() { var m = /v(\d+)\.(\d+)/.exec(BACKV || ""); return !m || +m[1] > 12 || (+m[1] === 12 && +m[2] >= 7); }   // 後端是第 40 批（12.7）以上（看不出來就當作可以）
function drDirty(b) { return !!(b && b.draw) && (!b.url || b.draw.h !== drHash(b.draw)); }   // 要重新畫成圖
function drFit(d) {   // 畫布＝所有框的右下角再留一點空（最小 600 × 300）
  var W = 0, H = 0;
  (d.s || []).forEach(function (s) { W = Math.max(W, s.x + s.w); H = Math.max(H, s.y + s.h); });
  d.W = Math.max(600, Math.ceil((W + 40) / 10) * 10); d.H = Math.max(300, Math.ceil((H + 40) / 10) * 10);
}

/* ── 框裡的字：格式文字 → HTML（樣式都寫在裡面：畫成圖的時候網頁的 CSS 用不到）── */
function drRunsHtml(runs) {   // 第 41 批：文字框（[x=…]）：連在一起、框一樣的那幾段包成一個框
  return _yzRtBoxGroups_(runs).map(function (g) {
    var inner = drRunsHtml1(g.runs), css = g.x ? _yzRtBoxCss_(g.x, g.runs) : "";
    return css ? '<span style="' + css + '">' + inner + "</span>" : inner;
  }).join("");
}
function drRunsHtml1(runs) {
  return (runs || []).map(function (r) {
    var t = r.fx ? (_yzFxLinear_(r.t) || r.t) : r.t, st = [], dec = (r.u ? "underline " : "") + (r.s ? "line-through" : "");
    if (r.b) st.push("font-weight:700");
    if (r.i || r.fx) st.push("font-style:italic");
    if (dec) st.push("text-decoration:" + dec.trim());
    if (r.c && YZ_RT_COLORS[r.c]) st.push("color:" + YZ_RT_COLORS[r.c]);
    var zz = _yzRtSz_(r.z); if (zz) st.push("font-size:" + zz.em + "em");
    if (r.m && YZ_RT_MARKS[r.m]) st.push("background:" + YZ_RT_MARKS[r.m].bg + ";border-radius:2px;padding:0 1px");
    return st.length ? '<span style="' + st.join(";") + '">' + drEsc(t) + "</span>" : drEsc(t);
  }).join("");
}
function drTextHtml(v) {
  var out = "";
  _yzParseLines_(v).forEach(function (L) {
    var ml = L.lv ? "margin-left:" + (L.lv * 1.2) + "em;" : "";
    if (L.k === "gap") { out += '<div style="height:.6em"></div>'; return; }
    if (L.k === "hr") { out += '<div style="' + ml + 'margin:.3em 0;border-top:1px solid currentColor;opacity:.4"></div>'; return; }
    if (L.k === "go" || L.k === "img" || L.k === "tbl") return;
    var rs = drRunsHtml(L.runs);
    if (L.k === "item") out += '<div style="' + ml + 'display:flex;gap:.3em;text-align:left"><span style="flex:none">' + drEsc(L.mark) + '</span><span style="flex:1;min-width:0">' + rs + "</span></div>";
    else if (L.k === "head") { var H = YZ_RT_HEAD["h" + L.h] || YZ_RT_HEAD.h4; out += '<div style="' + ml + "font-weight:700;font-size:" + H.em + 'em;line-height:1.3">' + rs + "</div>"; }
    else if (L.k === "box") { var T = _yzRtTone_(L.tone); out += '<div style="' + ml + "background:" + T.bg + ";border:1px solid " + T.bd + ";color:" + T.ink + ';border-radius:4px;padding:.1em .4em;margin:.15em 0;text-align:left">' + (T.icon ? drEsc(T.icon) + " " : "") + rs + "</div>"; }
    else if (L.k === "quote") out += '<div style="' + ml + 'border-left:3px solid #CBD5E1;padding-left:.5em;color:#475569;text-align:left">' + rs + "</div>";
    else out += '<div style="' + ml + '">' + rs + "</div>";
  });
  return out;
}

/* ── 形狀、箭頭的位置 ── */
function drBox(s) { return { x: s.x, y: s.y, w: s.w, h: s.h, cx: s.x + s.w / 2, cy: s.y + s.h / 2 }; }
function drEdge(s, px, py) {   // 從框的中心往 (px, py) 走，碰到框邊的那一點（菱形、橢圓照形狀）
  var b = drBox(s), dx = px - b.cx, dy = py - b.cy, hw = b.w / 2, hh = b.h / 2, t;
  if (!dx && !dy) return { x: b.cx, y: b.cy };
  if (s.k === "dia") t = 1 / (Math.abs(dx) / hw + Math.abs(dy) / hh);
  else if (s.k === "oval") t = 1 / Math.sqrt(dx * dx / (hw * hw) + dy * dy / (hh * hh));
  else t = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity);
  return { x: b.cx + dx * t, y: b.cy + dy * t };
}
function drEdgeV(s, x, down) {   // 直的線（x 不變）碰到框的下邊（down）或上邊
  var b = drBox(s), hw = b.w / 2, hh = b.h / 2, dx = Math.abs(x - b.cx), off = hh;
  if (s.k === "dia") off = dx < hw ? hh * (1 - dx / hw) : 0;
  else if (s.k === "oval") off = dx < hw ? hh * Math.sqrt(1 - dx * dx / (hw * hw)) : 0;
  return b.cy + (down ? off : -off);
}
function drEdgeH(s, y, right) {   // 橫的線（y 不變）碰到框的右邊（right）或左邊
  var b = drBox(s), hw = b.w / 2, hh = b.h / 2, dy = Math.abs(y - b.cy), off = hw;
  if (s.k === "dia") off = dy < hh ? hw * (1 - dy / hh) : 0;
  else if (s.k === "oval") off = dy < hh ? hw * Math.sqrt(1 - dy * dy / (hh * hh)) : 0;
  return b.cx + (right ? off : -off);
}
// 一條箭頭的路線 [{x,y}…]：起點在 a 的邊上、終點在 b 的邊上。auto＝上下（或左右）對得到就直直的，不然先橫再直
function drRoute(d, l) {
  var A = drShape(d, l.a), B = drShape(d, l.b);
  if (!A || !B || A === B) return null;
  var a = drBox(A), b = drBox(B), st = l.st || "auto", dn = b.cy > a.cy, rt = b.cx > a.cx;
  if (st === "line") return [drEdge(A, b.cx, b.cy), drEdge(B, a.cx, a.cy)];
  var ox0 = Math.max(a.x, b.x), ox1 = Math.min(a.x + a.w, b.x + b.w), oy0 = Math.max(a.y, b.y), oy1 = Math.min(a.y + a.h, b.y + b.h);
  var sepY = b.y >= a.y + a.h || a.y >= b.y + b.h, sepX = b.x >= a.x + a.w || a.x >= b.x + b.w;
  if ((st === "auto" || Math.abs(a.cx - b.cx) < 4) && ox1 - ox0 >= 16 && sepY) {   // 上下對得到：直直的
    var x = Math.abs(a.cx - b.cx) < 4 ? a.cx : Math.max(ox0 + 8, Math.min(ox1 - 8, (a.cx + b.cx) / 2));
    return [{ x: x, y: drEdgeV(A, x, dn) }, { x: x, y: drEdgeV(B, x, !dn) }];
  }
  if ((st === "auto" || Math.abs(a.cy - b.cy) < 4) && oy1 - oy0 >= 16 && sepX) {   // 左右對得到：橫的
    var y = Math.abs(a.cy - b.cy) < 4 ? a.cy : Math.max(oy0 + 8, Math.min(oy1 - 8, (a.cy + b.cy) / 2));
    return [{ x: drEdgeH(A, y, rt), y: y }, { x: drEdgeH(B, y, !rt), y: y }];
  }
  if (st === "vh") return [{ x: a.cx, y: drEdgeV(A, a.cx, dn) }, { x: a.cx, y: b.cy }, { x: drEdgeH(B, b.cy, !rt), y: b.cy }];   // 先直再橫
  return [{ x: drEdgeH(A, a.cy, rt), y: a.cy }, { x: b.cx, y: a.cy }, { x: b.cx, y: drEdgeV(B, b.cx, !dn) }];   // 先橫再直
}
function drLabelBox(l, pts) {   // 箭頭上的字放哪裡：第一段的中間（直的：放在線的右邊；橫的：放在線的上面）
  var t = String(l.t || "").trim();
  if (!t || !pts) return null;
  var p = pts[0], q = pts[1], mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2, w = Math.min(220, 14 + t.length * 14), hh = 22;
  if (Math.abs(p.x - q.x) < 1) return { x: mx + 6, y: my - hh / 2, w: w, h: hh, al: "left", t: t };
  if (Math.abs(p.y - q.y) < 1) return { x: mx - w / 2, y: my - hh - 3, w: w, h: hh, al: "center", t: t };
  return { x: mx - w / 2, y: my - hh / 2, w: w, h: hh, al: "center", t: t };
}
function drHead(p, q, sz) {   // 箭頭的三角形（尖端在 p，從 q 那邊過來）
  var dx = p.x - q.x, dy = p.y - q.y, L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L, w = sz * 0.5, bx = p.x - ux * sz, by = p.y - uy * sz;
  return [p.x, p.y, bx - uy * w, by + ux * w, bx + uy * w, by - ux * w].map(function (v) { return Math.round(v * 10) / 10; }).join(" ");
}
function drPull(p, q, n) { var dx = p.x - q.x, dy = p.y - q.y, L = Math.sqrt(dx * dx + dy * dy) || 1; return { x: p.x - dx / L * n, y: p.y - dy / L * n }; }   // p 往 q 拉回 n（線畫到箭頭底下，不會戳出尖端）
function drTextArea(s) {   // 框裡放字的範圍（菱形、橢圓、膠囊照形狀縮小）
  var p = s.k === "txt" ? 4 : 10, x = s.x + p, y = s.y + p, w = s.w - 2 * p, hh = s.h - 2 * p;
  if (s.k === "dia") { x = s.x + s.w * 0.2; y = s.y + s.h * 0.2; w = s.w * 0.6; hh = s.h * 0.6; }
  else if (s.k === "oval") { x = s.x + s.w * 0.14; y = s.y + s.h * 0.13; w = s.w * 0.72; hh = s.h * 0.74; }
  else if (s.k === "pill") { var r = Math.min(s.h, s.w) / 2; x = s.x + r * 0.55; w = s.w - r * 1.1; }
  return { x: Math.round(x), y: Math.round(y), w: Math.max(10, Math.round(w)), h: Math.max(10, Math.round(hh)) };
}
function drDash(ds, w) {   // 第 41 批：虛線、點線、長虛線 → SVG 的 stroke-dasharray（照線的粗細等比例）
  var D = YZ_DRAW_DASH[_yzDrawOpt_(YZ_DRAW_DASH, ds)];
  return D && D.arr ? ' stroke-dasharray="' + D.arr.map(function (v) { return Math.round(v * w / 2 * 10) / 10; }).join(" ") + '"' + (D.cap ? ' stroke-linecap="' + D.cap + '"' : "") : "";
}
function drLineSt(l) {   // 第 41 批：一條箭頭的顏色、粗細、虛線、箭頭的頭多大
  var w = YZ_DRAW_LW[_yzDrawOpt_(YZ_DRAW_LW, l.lw)].w;
  return { w: w, c: YZ_DRAW_LC[_yzDrawOpt_(YZ_DRAW_LC, l.lc)].c, dash: drDash(l.ds, w), head: Math.round(7 + 2 * w) };
}
function drOutline(s, T) {
  if (s.k === "txt") return "";   // 只有字：沒有框
  var sw = s.k === "note" ? 1.5 : 2, a = ' fill="' + T.bg + '" stroke="' + T.bd + '" stroke-width="' + sw + '"' + drDash(s.ds, sw), cx = s.x + s.w / 2, cy = s.y + s.h / 2;
  if (s.k === "dia") return '<polygon points="' + [cx, s.y, s.x + s.w, cy, cx, s.y + s.h, s.x, cy].join(" ") + '" stroke-linejoin="round"' + a + "/>";
  if (s.k === "oval") return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + s.w / 2 + '" ry="' + s.h / 2 + '"' + a + "/>";
  var rx = s.k === "round" ? Math.min(14, s.h / 3) : s.k === "pill" ? Math.min(s.h, s.w) / 2 : s.k === "note" ? 3 : 0;
  return '<rect x="' + s.x + '" y="' + s.y + '" width="' + s.w + '" height="' + s.h + '" rx="' + rx + '"' + a + "/>";
}
function drTextFo(s, edit) {
  var A = drTextArea(s), T = _yzDrawTone_(s.c), al = s.al || (s.k === "note" ? "l" : "c"), html = drTextHtml(s.v);
  if (!html && edit) html = '<div style="color:#9AA5B1;font-size:13px">（連點兩下打字）</div>';
  return '<foreignObject x="' + A.x + '" y="' + A.y + '" width="' + A.w + '" height="' + A.h + '"><div xmlns="http://www.w3.org/1999/xhtml" data-t="' + drEsc(s.id) + '" style="box-sizing:border-box;width:' + A.w + "px;height:" + A.h +
    "px;display:flex;flex-direction:column;justify-content:" + (s.k === "note" ? "flex-start" : "center") + ";overflow:hidden;font-family:" + DR_FONT + ";font-size:" + DR_FS + "px;line-height:" + DR_LH + ";color:" + T.ink +
    ";text-align:" + (al === "l" ? "left" : al === "r" ? "right" : "center") + ';word-break:break-word;overflow-wrap:anywhere"><div>' + html + "</div></div></foreignObject>";
}
// 整張流程圖 → SVG。o：{ notes:false＝不畫說明框（LINE 用的那一張）, crop:只留畫了東西的範圍, edit:編輯器（沒有字的框寫提示、沒有白底） }
// 回傳 { body:SVG 裡面的東西, x, y, w, h:範圍 }
function drSvg(d, o) {
  o = o || {};
  var ss = (d.s || []).filter(function (s) { return o.notes !== false || s.k !== "note"; }), has = {}, out = [], labs = [], x0 = 0, y0 = 0, x1 = d.W, y1 = d.H;
  ss.forEach(function (s) { has[s.id] = 1; });
  var ls = (d.l || []).filter(function (l) { return has[l.a] && has[l.b] && l.a !== l.b; });
  var routes = ls.map(function (l) { return drRoute(d, l); });
  if (o.crop) {   // 只留畫了東西的範圍（四邊各留一點空）
    x0 = Infinity; y0 = Infinity; x1 = -Infinity; y1 = -Infinity;
    var grow = function (x, y, w, hh) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + w); y1 = Math.max(y1, y + hh); };
    ss.forEach(function (s) { grow(s.x, s.y, s.w, s.h); });
    routes.forEach(function (p, i) { if (!p) return; p.forEach(function (q) { grow(q.x, q.y, 0, 0); }); var lb = drLabelBox(ls[i], p); if (lb) grow(lb.x, lb.y, lb.w, lb.h); });
    if (x0 === Infinity) { x0 = 0; y0 = 0; x1 = 200; y1 = 120; }
    x0 = Math.floor(x0 - DR_PAD); y0 = Math.floor(y0 - DR_PAD); x1 = Math.ceil(x1 + DR_PAD); y1 = Math.ceil(y1 + DR_PAD);
  }
  if (!o.edit) out.push('<rect x="' + x0 + '" y="' + y0 + '" width="' + (x1 - x0) + '" height="' + (y1 - y0) + '" fill="#FFFFFF"/>');
  ls.forEach(function (l, i) {   // 箭頭（畫在框的下面）
    var p = routes[i]; if (!p) return;
    var ah = l.ah || "end", L = drLineSt(l), sz = L.head, pts = p.map(function (q) { return { x: q.x, y: q.y }; });
    var tip = ah === "end" || ah === "both", tail = ah === "start" || ah === "both";   // 第 41 批：start＝指到前面那個框
    if (tip) pts[pts.length - 1] = drPull(p[p.length - 1], p[p.length - 2], sz * 0.8);
    if (tail) pts[0] = drPull(p[0], p[1], sz * 0.8);
    out.push('<polyline data-l="' + drEsc(l.id) + '" points="' + pts.map(function (q) { return Math.round(q.x * 10) / 10 + "," + Math.round(q.y * 10) / 10; }).join(" ") + '" fill="none" stroke="' + L.c + '" stroke-width="' + L.w + '"' + L.dash + ' stroke-linejoin="round"/>');
    if (tip) out.push('<polygon points="' + drHead(p[p.length - 1], p[p.length - 2], sz) + '" fill="' + L.c + '"/>');
    if (tail) out.push('<polygon points="' + drHead(p[0], p[1], sz) + '" fill="' + L.c + '"/>');
    var lb = drLabelBox(l, p); if (lb) labs.push(lb);
  });
  ss.forEach(function (s) { out.push('<g data-s="' + drEsc(s.id) + '">' + drOutline(s, _yzDrawTone_(s.c)) + drTextFo(s, o.edit) + "</g>"); });
  labs.forEach(function (lb) {   // 箭頭上的字（白底，蓋在線上面）
    out.push('<foreignObject x="' + Math.round(lb.x) + '" y="' + Math.round(lb.y) + '" width="' + Math.round(lb.w) + '" height="' + lb.h + '"><div xmlns="http://www.w3.org/1999/xhtml" style="text-align:' + lb.al + ";font-family:" + DR_FONT + ";font-size:14px;line-height:" + lb.h + 'px;white-space:nowrap"><span style="background:#FFFFFF;color:#1F2328;font-weight:700;padding:0 3px">' + drEsc(lb.t) + "</span></div></foreignObject>");
  });
  return { body: out.join(""), x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
function drSvgDoc(r, sc) { return '<svg xmlns="http://www.w3.org/2000/svg" width="' + Math.round(r.w * sc) + '" height="' + Math.round(r.h * sc) + '" viewBox="' + r.x + " " + r.y + " " + r.w + " " + r.h + '">' + r.body + "</svg>"; }

/* ── 畫成 PNG（裡面另外存一份畫的資料）── */
function drPngPut(u8, key, text) {   // 在 PNG 最後（IEND 前面）放一段 tEXt
  var data = new TextEncoder().encode(key + "\u0000" + text), c = new Uint8Array(12 + data.length), dv = new DataView(c.buffer);
  dv.setUint32(0, data.length); c.set([0x74, 0x45, 0x58, 0x74], 4); c.set(data, 8); dv.setUint32(8 + data.length, exCrc(c.subarray(4, 8 + data.length)));
  var at = u8.length - 12, out = new Uint8Array(u8.length + c.length);
  out.set(u8.subarray(0, at)); out.set(c, at); out.set(u8.subarray(at), at + c.length);
  return out;
}
function drPngGet(u8, key) {   // PNG 裡的 tEXt（找不到＝""）
  if (!u8 || u8.length < 20 || u8[1] !== 0x50 || u8[2] !== 0x4E || u8[3] !== 0x47) return "";
  var dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength), i = 8;
  while (i + 12 <= u8.length) {
    var n = dv.getUint32(i), ty = String.fromCharCode(u8[i + 4], u8[i + 5], u8[i + 6], u8[i + 7]);
    if (ty === "tEXt") {
      var s = new TextDecoder("latin1").decode(u8.subarray(i + 8, i + 8 + n)), z = s.indexOf("\u0000");
      if (z > 0 && s.slice(0, z) === key) return s.slice(z + 1);
    }
    if (ty === "IEND") break;
    i += 12 + n;
  }
  return "";
}
function drB64(s) { return btoa(unescape(encodeURIComponent(s))); }
function drUnB64(s) { return decodeURIComponent(escape(atob(s))); }
// 一張流程圖 → PNG 的 data URI。notes：要不要畫說明框
function drPng(d, notes) {   // → { uri, w, h（PNG 的大小）, lw, lh（畫布上的大小：網頁照這個大小顯示，字跟畫的時候一樣大）, bytes }
  var r = drSvg(d, { notes: notes, crop: true }), sc = Math.min(2, 4000 / Math.max(r.w, r.h));
  var svg = drSvgDoc(r, sc), W = Math.round(r.w * sc), H = Math.round(r.h * sc);
  return new Promise(function (ok, no) {
    var im = new Image();
    im.onload = function () {
      var cv = document.createElement("canvas"); cv.width = W; cv.height = H;
      var cx = cv.getContext("2d"); cx.fillStyle = "#FFFFFF"; cx.fillRect(0, 0, W, H);
      try { cx.drawImage(im, 0, 0, W, H); cv.toBlob(function (bl) {
        if (!bl) { no(new Error("流程圖畫不成圖片")); return; }
        bl.arrayBuffer().then(function (ab) {
          var u8 = drPngPut(new Uint8Array(ab), "yzdraw", drB64(JSON.stringify({ v: 1, W: d.W, H: d.H, s: d.s, l: d.l })));
          var fr = new FileReader();
          fr.onload = function () { ok({ uri: String(fr.result), w: W, h: H, lw: Math.round(r.w), lh: Math.round(r.h), bytes: u8.length }); };
          fr.onerror = function () { no(new Error("流程圖畫不成圖片")); };
          fr.readAsDataURL(new Blob([u8], { type: "image/png" }));
        }, no);
      }, "image/png"); } catch (e) { no(new Error("這個瀏覽器不能把流程圖存成圖片（請用 Chrome 或 Edge）")); }
    };
    im.onerror = function () { no(new Error("流程圖畫不出來")); };
    im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}
// 存檔前：改過的流程圖畫成 PNG、上傳（整張＋LINE 用的那張）。auto＝自動存檔：正在畫的那一張，一分鐘內畫過就先不畫（停手、離開了再畫）
function edDrawTodo(auto) {
  var out = [], wait = 0;
  if (!ED) return out;
  ED.chapters.forEach(function (c) { (ED.titles[c.id] || []).forEach(function (t) { (t.blocks || []).forEach(function (b) {
    if (!drDirty(b)) return;
    var left = 60e3 - (Date.now() - (DRW_AT.get(b.draw) || 0));
    if (auto && DRW.act === b.draw && left > 0) { wait = Math.max(wait, left); return; }
    out.push(b);
  }); }); });
  if (auto) {   // 自動存檔先跳過的：一分鐘後再自動存一次（那時候就會畫成圖）
    clearTimeout(DRW.retry);
    if (wait) DRW.retry = setTimeout(function () { if (ED && edDrawNeed() && !ED.dirty) markDirty(); }, wait + 1e3);
  }
  return out;
}
function edDrawNeed() { return ED ? edDrawTodo(false).length : 0; }
function edDrawMake(list, onStep) {
  var i = 0;
  var one = function (b) {
    var d = b.draw, key = drHash(d), notes = _yzDrawNotes_(d).length > 0;
    DRW_AT.set(d, Date.now());
    return drPng(d, true).then(function (p) { return uploadUri(p.uri, "圖片").then(function (r) { return { p: p, r: r }; }); }).then(function (A) {
      if (!notes) return { A: A, L: null };
      return drPng(d, false).then(function (p) { return uploadUri(p.uri, "圖片").then(function (r) { return { A: A, L: { p: p, r: r } }; }); });
    }).then(function (x) {
      if (drHash(d) !== key) return;   // 畫的時候又改了：下次存檔再畫
      b.url = x.A.r.url; b.fid = x.A.r.fid; b.fname = x.A.r.fname; b.ar = _yzAR_(x.A.p.w, x.A.p.h); b.info = { w: x.A.p.w, h: x.A.p.h, bytes: x.A.p.bytes, ow: x.A.p.lw, oh: x.A.p.lh };   // ow／oh：畫布上的大小（網頁照這個大小顯示）
      b.ocr = _yzDrawLines_(d).join("\n").slice(0, 2000);   // 舊程式搜尋、圖片裡的字的統計用（新的搜尋直接看每個框）
      if (x.L) d.line = { url: x.L.r.url, fid: x.L.r.fid, ar: _yzAR_(x.L.p.w, x.L.p.h) }; else delete d.line;
      d.h = key;
    });
  };
  var next = function () {
    if (i >= list.length) return Promise.resolve();
    if (onStep) onStep(i, list.length);
    return one(list[i++]).then(next);
  };
  return next();
}
// 預覽（編輯器右邊的 LINE／網頁預覽）：改過、還沒畫成圖片的流程圖，先在瀏覽器畫一張（畫好再重畫預覽）。沒改過＝null（用存好的圖）
var DRW_PV = new WeakMap();
function drPvOf(b) { var c = b && b.draw && drDirty(b) ? DRW_PV.get(b.draw) : null; return c && c.full ? c : null; }
function drPv(b) {
  if (!b || !b.draw || !drDirty(b)) return null;
  var d = b.draw, k = drHash(d), c = DRW_PV.get(d);
  if (c && (c.k === k || c.busy)) return c.full ? c : null;
  var job = { k: k, busy: true, full: c && c.full, line: c && c.line, ar: c && c.ar, lar: c && c.lar };
  DRW_PV.set(d, job);
  var notes = _yzDrawNotes_(d).length > 0;
  Promise.all([drPng(d, true), notes ? drPng(d, false) : Promise.resolve(null)]).then(function (r) {
    job.full = r[0].uri; job.ar = _yzAR_(r[0].w, r[0].h); job.lw = r[0].lw; job.line = r[1] ? r[1].uri : null; job.lar = r[1] ? _yzAR_(r[1].w, r[1].h) : null; job.busy = false;
    if (drHash(d) !== k) job.k = "";   // 畫的時候又改了：下次再畫
    if (ED && typeof refreshPreview === "function") refreshPreview();
  }, function () { job.busy = false; job.k = ""; });
  return job.full ? job : null;
}
// 圖（PNG）裡存的畫的資料 → 還原成流程圖（退回舊版本被拿掉的時候）
function drRecover(b, done) {
  if (!b || !b.fid) { toast("這張圖還沒有上傳好"); return; }
  call("hbPicData", [b.fid]).then(function (r) {
    if (r && r.st === "lock") { logout("expired"); return; }
    if (!r || !r.ok) { toast("拿不到這張圖：" + ((r && r.err) || "後端沒有回答")); return; }
    var b64 = String(r.b64 || ""), u8 = null;
    try { var bin = atob(b64); u8 = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); } catch (e) { u8 = null; }
    var tx = u8 ? drPngGet(u8, "yzdraw") : "", d = null;
    try { d = tx ? JSON.parse(drUnB64(tx)) : null; } catch (e) { d = null; }
    if (!d || !Array.isArray(d.s)) { toast("這張圖不是用流程圖畫的（找不到畫的資料）"); return; }
    b.draw = { v: 1, W: d.W, H: d.H, s: d.s, l: Array.isArray(d.l) ? d.l : [] };
    drFit(b.draw);
    toast("🔀 還原好了：可以用流程圖編輯器改了（存檔時會重新畫成圖）");
    if (done) done();
  }, function (e) { toast("拿不到這張圖：" + ((e && e.message) || "")); });
}

/* ───────── 編輯器：一張流程圖 ───────── */
function drawEditor(t, b) {
  var d = b.draw;
  if (!Array.isArray(d.s)) d.s = [];
  if (!Array.isArray(d.l)) d.l = [];
  drFit(d);
  var S = { sel: [], ls: null, hov: null, mode: null, drag: null, guides: [], linkMode: false, linkFrom: null, txt: null, hist: [drState(d)], hi: 0, z: DRW_Z.get(d) || 1, over: {} }, hadZ = !!DRW_Z.get(d);
  var uid = "drw" + Math.random().toString(36).slice(2, 8);
  var root = h("div", { class: "drw" }), bar1 = h("div", { class: "drw-bar" }), bar2 = h("div", { class: "drw-bar drw-ctx" });
  var view = h("div", { class: "drw-view" }), stage = h("div", { class: "drw-stage", tabindex: "0", role: "application", "aria-label": "流程圖畫布：拖曳框移動、拉框旁邊的藍點連箭頭、連點兩下改字、Delete 刪除" });
  var txt = h("div", { class: "drw-txt" }), foot = h("div", { class: "drw-foot" }), svg = null, gDia = null, gOv = null, gBg = null;
  txt.hidden = true;
  view.appendChild(stage);
  [bar1, view, bar2, txt, foot].forEach(function (x) { root.appendChild(x); });   // 選了什麼才出現的那一排放在畫布下面（換內容時畫布不會跳）

  var shape = function (id) { return drShape(d, id); };
  var link = function (id) { return drLink(d, id); };
  var act = function () { DRW.act = d; };
  // ── 畫面 ──
  function sw() { return d.W + 240; }
  function sh() { return d.H + 200; }
  function paintAll() {
    var W = sw(), H = sh();
    stage.innerHTML = '<svg class="drw-svg" xmlns="http://www.w3.org/2000/svg" width="' + Math.round(W * S.z) + '" height="' + Math.round(H * S.z) + '" viewBox="0 0 ' + W + " " + H + '">' +
      '<defs><pattern id="' + uid + '" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#C9D3DD"/></pattern></defs>' +
      '<rect class="bg" width="' + W + '" height="' + H + '" fill="url(#' + uid + ')"/><g class="dia"></g><g class="ov"></g></svg>';
    svg = stage.firstChild; gBg = svg.querySelector(".bg"); gDia = svg.querySelector(".dia"); gOv = svg.querySelector(".ov");
    paintDia(); paintOv();
  }
  function resizeSvg() {
    if (!svg) return;
    var W = sw(), H = sh();
    svg.setAttribute("width", Math.round(W * S.z)); svg.setAttribute("height", Math.round(H * S.z)); svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    gBg.setAttribute("width", W); gBg.setAttribute("height", H);
  }
  function paintDia() {
    if (!gDia) return;
    gDia.innerHTML = drSvg(d, { edit: true }).body;
    S.over = {};
    Array.prototype.forEach.call(gDia.querySelectorAll("[data-t]"), function (el) { var c = el.firstChild; if (c && c.offsetHeight > el.clientHeight + 2) S.over[el.getAttribute("data-t")] = c.offsetHeight; });
    paintFoot();
  }
  function hs() { return 8 / S.z; }
  function handles(s) {   // 8 個拉大小的點
    var x = s.x, y = s.y, w = s.w, hh = s.h;
    return { nw: [x, y], n: [x + w / 2, y], ne: [x + w, y], e: [x + w, y + hh / 2], se: [x + w, y + hh], s: [x + w / 2, y + hh], sw: [x, y + hh], w: [x, y + hh / 2] };
  }
  function dots(s) { return { t: [s.x + s.w / 2, s.y], r: [s.x + s.w, s.y + s.h / 2], b: [s.x + s.w / 2, s.y + s.h], l: [s.x, s.y + s.h / 2] }; }
  function paintOv() {
    if (!gOv) return;
    var o = "", k = hs();
    Object.keys(S.over).forEach(function (id) { var s = shape(id); if (s) o += '<rect x="' + (s.x - 3) + '" y="' + (s.y - 3) + '" width="' + (s.w + 6) + '" height="' + (s.h + 6) + '" fill="none" stroke="#D93025" stroke-width="' + 2 / S.z + '" stroke-dasharray="' + 6 / S.z + " " + 4 / S.z + '"/>'; });
    S.guides.forEach(function (g) { o += '<line x1="' + g[0] + '" y1="' + g[1] + '" x2="' + g[2] + '" y2="' + g[3] + '" stroke="#E8590C" stroke-width="' + 1.2 / S.z + '" stroke-dasharray="' + 5 / S.z + " " + 3 / S.z + '"/>'; });
    if (S.ls) { var l = link(S.ls), p = l && drRoute(d, l); if (p) o += '<polyline points="' + p.map(function (q) { return q.x + "," + q.y; }).join(" ") + '" fill="none" stroke="#0B7A75" stroke-width="' + 7 / S.z + '" stroke-opacity=".35" stroke-linejoin="round"/>'; }
    S.sel.forEach(function (id) { var s = shape(id); if (s) o += '<rect x="' + (s.x - 4 / S.z) + '" y="' + (s.y - 4 / S.z) + '" width="' + (s.w + 8 / S.z) + '" height="' + (s.h + 8 / S.z) + '" fill="none" stroke="#0B7A75" stroke-width="' + 1.6 / S.z + '" stroke-dasharray="' + 5 / S.z + " " + 3 / S.z + '"/>'; });
    if (S.linkFrom) { var lf = shape(S.linkFrom); if (lf) o += '<rect x="' + (lf.x - 5) + '" y="' + (lf.y - 5) + '" width="' + (lf.w + 10) + '" height="' + (lf.h + 10) + '" fill="none" stroke="' + DR_ARROW + '" stroke-width="' + 3 / S.z + '"/>'; }
    if (S.sel.length === 1 && S.mode !== "link") { var s1 = shape(S.sel[0]); if (s1) { var H = handles(s1); Object.keys(H).forEach(function (n) { o += '<rect class="hd" data-h="' + n + '" x="' + (H[n][0] - k / 2) + '" y="' + (H[n][1] - k / 2) + '" width="' + k + '" height="' + k + '" fill="#FFFFFF" stroke="#0B7A75" stroke-width="' + 1.5 / S.z + '"/>'; }); } }
    var cs = S.hov && S.mode !== "move" && S.mode !== "resize" ? shape(S.hov) : null;
    if (cs) { var D = dots(cs); Object.keys(D).forEach(function (n) { o += '<circle class="dt" cx="' + D[n][0] + '" cy="' + D[n][1] + '" r="' + 6 / S.z + '" fill="' + DR_ARROW + '" stroke="#FFFFFF" stroke-width="' + 2 / S.z + '"/>'; }); }
    if (S.mode === "band" && S.drag) { var B = band(); o += '<rect x="' + B.x + '" y="' + B.y + '" width="' + B.w + '" height="' + B.h + '" fill="rgba(11,122,117,.08)" stroke="#0B7A75" stroke-width="' + 1 / S.z + '" stroke-dasharray="' + 4 / S.z + '"/>'; }
    if (S.mode === "link" && S.drag) {
      var tg = S.drag.to ? shape(S.drag.to) : null, p0 = S.drag.p0, p1 = S.drag.p;
      if (tg) o += '<rect x="' + (tg.x - 5) + '" y="' + (tg.y - 5) + '" width="' + (tg.w + 10) + '" height="' + (tg.h + 10) + '" fill="none" stroke="' + DR_ARROW + '" stroke-width="' + 3 / S.z + '"/>';
      o += '<line x1="' + p0.x + '" y1="' + p0.y + '" x2="' + p1.x + '" y2="' + p1.y + '" stroke="' + DR_ARROW + '" stroke-width="' + 2 / S.z + '" stroke-dasharray="' + 6 / S.z + " " + 4 / S.z + '"/>';
    }
    gOv.innerHTML = o;
  }
  function paintFoot() {
    var n = Object.keys(S.over).length, dirty = drDirty(b);
    foot.innerHTML = "";
    foot.appendChild(h("span", { class: "muted" }, ["框 " + d.s.length + " 個、箭頭 " + d.l.length + " 條"]));
    foot.appendChild(h("span", { class: dirty ? "drw-st warn" : "drw-st ok" }, [dirty ? "🖼 改過了：存檔時會重新畫成圖（LINE、網頁、Word 用）" : "🖼 LINE、網頁、Word 用的圖：已經是最新的"]));
    if (n) foot.appendChild(h("span", { class: "drw-st bad" }, ["⚠ 有 " + n + " 個框的字放不下（紅色虛線）：把框拉大一點，或少一點字"]));
    if (!drBackOk()) foot.appendChild(h("span", { class: "drw-st bad" }, ["⚠ 藥戰手冊專案的 02 還是舊的（第 40 批以前）：流程圖存了會變成一般的圖。請先換 02、部署新版本"]));
  }
  // ── 位置換算、點到什麼 ──
  function pt(e) { var r = svg.getBoundingClientRect(); return { x: (e.clientX - r.left) / S.z, y: (e.clientY - r.top) / S.z }; }
  function inShape(s, p, pad) {
    pad = pad || 0;
    if (p.x < s.x - pad || p.x > s.x + s.w + pad || p.y < s.y - pad || p.y > s.y + s.h + pad) return false;
    var dx = Math.abs(p.x - (s.x + s.w / 2)), dy = Math.abs(p.y - (s.y + s.h / 2)), hw = s.w / 2 + pad, hh = s.h / 2 + pad;
    if (s.k === "dia") return dx / hw + dy / hh <= 1.02;
    if (s.k === "oval") return dx * dx / (hw * hw) + dy * dy / (hh * hh) <= 1.04;
    return true;
  }
  function hitShape(p, pad) { for (var i = d.s.length - 1; i >= 0; i--) if (inShape(d.s[i], p, pad)) return d.s[i].id; return null; }
  function segDist(p, a, c) { var dx = c.x - a.x, dy = c.y - a.y, L = dx * dx + dy * dy, t = L ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L)) : 0, x = a.x + t * dx - p.x, y = a.y + t * dy - p.y; return Math.sqrt(x * x + y * y); }
  function hitLink(p) {
    var best = null, bd = 7 / S.z;
    d.l.forEach(function (l) { var r = drRoute(d, l); if (!r) return; for (var i = 1; i < r.length; i++) { var x = segDist(p, r[i - 1], r[i]); if (x < bd) { bd = x; best = l.id; } } });
    return best;
  }
  function hitHandle(p) {
    if (S.sel.length !== 1) return null;
    var s = shape(S.sel[0]); if (!s) return null;
    var H = handles(s), k = hs() * 0.9, hit = null;
    Object.keys(H).forEach(function (n) { if (Math.abs(p.x - H[n][0]) <= k && Math.abs(p.y - H[n][1]) <= k) hit = n; });
    return hit;
  }
  function hitDot(p) {
    var s = S.hov ? shape(S.hov) : null; if (!s) return null;
    var D = dots(s), r = 9 / S.z, hit = null;
    Object.keys(D).forEach(function (n) { var dx = p.x - D[n][0], dy = p.y - D[n][1]; if (dx * dx + dy * dy <= r * r) hit = { id: s.id, p: { x: D[n][0], y: D[n][1] } }; });
    return hit;
  }
  function band() { var a = S.drag.p0, c = S.drag.p; return { x: Math.min(a.x, c.x), y: Math.min(a.y, c.y), w: Math.abs(a.x - c.x), h: Math.abs(a.y - c.y) }; }
  // ── 復原／重做 ──
  function push() {
    drFit(d);
    var k = drState(d);
    if (k === S.hist[S.hi]) { paintFoot(); return; }
    S.hist = S.hist.slice(0, S.hi + 1); S.hist.push(k);
    if (S.hist.length > DR_HIST) S.hist.shift();
    S.hi = S.hist.length - 1;
    resizeSvg(); paintFoot(); syncCtx();
    changed();
  }
  function load(k) {
    var o = JSON.parse(k); d.W = o.W; d.H = o.H; d.s = o.s; d.l = o.l;
    S.sel = S.sel.filter(function (id) { return shape(id); }); if (S.ls && !link(S.ls)) S.ls = null;
    if (S.txt) closeText("nopush");   // 復原／重做：下面改字的框先關掉（字照復原後的）
    resizeSvg(); paintDia(); paintOv(); syncCtx(); changed();
  }
  function undo() { if (S.hi > 0) { S.hi--; load(S.hist[S.hi]); } }
  function redo() { if (S.hi < S.hist.length - 1) { S.hi++; load(S.hist[S.hi]); } }
  // ── 加框、刪除、複製 ──
  function overlaps(s) { return d.s.some(function (o) { return o !== s && s.x < o.x + o.w && s.x + s.w > o.x && s.y < o.y + o.h && s.y + s.h > o.y; }); }
  function addShape(k, at) {
    var z = DR_DEF[k] || DR_DEF.box, s = { id: drNewId(d, "s"), k: k, x: 0, y: 0, w: z[0], h: z[1], v: "" }, from = null;
    if (k === "note") s.al = "l";
    var one = S.sel.length === 1 ? shape(S.sel[0]) : null, maxR = 0, maxB = 0, minT = Infinity;
    d.s.forEach(function (o) { if (o.k !== "note") { maxR = Math.max(maxR, o.x + o.w); minT = Math.min(minT, o.y); } maxB = Math.max(maxB, o.y + o.h); });
    if (at) { s.x = drSnap(at.x - s.w / 2); s.y = drSnap(at.y - s.h / 2); }
    else if (one && k !== "note" && one.k !== "note") { s.x = drSnap(one.x + one.w / 2 - s.w / 2); s.y = drSnap(one.y + one.h + 50); from = one; }   // 選著一個框：接在它下面，自動連箭頭
    else if (k === "note") { s.x = drSnap(maxR + 50); s.y = drSnap(minT === Infinity ? 30 : minT); }
    else { s.x = drSnap(Math.max(30, (d.W - s.w) / 2)); s.y = drSnap(d.s.length ? maxB + 50 : 30); }
    s.x = Math.max(0, s.x); s.y = Math.max(0, s.y);
    for (var n = 0; n < 40 && overlaps(s); n++) s.y += k === "note" ? s.h + 20 : 30;   // 不要疊在別的框上
    d.s.push(s);
    if (from) d.l.push({ id: drNewId(d, "l"), a: from.id, b: s.id });
    S.sel = [s.id]; S.ls = null;
    drFit(d); resizeSvg(); paintDia(); paintOv(); push();
    openText(s.id);
  }
  function delSel() {
    if (S.ls) { d.l = d.l.filter(function (l) { return l.id !== S.ls; }); S.ls = null; }
    else if (S.sel.length) {
      var del = {}; S.sel.forEach(function (id) { del[id] = 1; });
      d.s = d.s.filter(function (s) { return !del[s.id]; }); d.l = d.l.filter(function (l) { return !del[l.a] && !del[l.b]; });
      if (S.txt && del[S.txt.id]) closeText(true);
      S.sel = []; S.hov = null;
    } else return;
    paintDia(); paintOv(); push();
  }
  function dupSel() {
    if (!S.sel.length) return;
    var map = {}, add = [];
    S.sel.forEach(function (id) { var s = shape(id); if (!s) return; var c = JSON.parse(JSON.stringify(s)); c.id = drNewId({ s: d.s.concat(add), l: d.l }, "s"); c.x += 30; c.y += 30; map[id] = c.id; add.push(c); });
    d.s = d.s.concat(add);
    d.l.filter(function (l) { return map[l.a] && map[l.b]; }).forEach(function (l) { var c = JSON.parse(JSON.stringify(l)); c.id = drNewId(d, "l"); c.a = map[l.a]; c.b = map[l.b]; d.l.push(c); });
    S.sel = add.map(function (s) { return s.id; }); S.ls = null;
    paintDia(); paintOv(); push();
  }
  function setOn(f) { S.sel.forEach(function (id) { var s = shape(id); if (s) f(s); }); paintDia(); paintOv(); push(); }
  function align(how) {   // 好幾個框：對齊、平均分配
    var ss = S.sel.map(shape).filter(Boolean); if (ss.length < 2) return;
    var x0 = Math.min.apply(null, ss.map(function (s) { return s.x; })), x1 = Math.max.apply(null, ss.map(function (s) { return s.x + s.w; }));
    var y0 = Math.min.apply(null, ss.map(function (s) { return s.y; })), y1 = Math.max.apply(null, ss.map(function (s) { return s.y + s.h; }));
    if (how === "l") ss.forEach(function (s) { s.x = x0; });
    else if (how === "r") ss.forEach(function (s) { s.x = x1 - s.w; });
    else if (how === "c") { var cx = ss[0].x + ss[0].w / 2; ss.forEach(function (s) { s.x = drSnap(cx - s.w / 2); }); }
    else if (how === "t") ss.forEach(function (s) { s.y = y0; });
    else if (how === "b") ss.forEach(function (s) { s.y = y1 - s.h; });
    else if (how === "m") { var cy = ss[0].y + ss[0].h / 2; ss.forEach(function (s) { s.y = drSnap(cy - s.h / 2); }); }
    else if (how === "dv" || how === "dh") {   // 平均分配（框和框中間的空一樣大）
      var v = how === "dv", srt = ss.slice().sort(function (a, c) { return v ? a.y - c.y : a.x - c.x; }), tot = 0;
      srt.forEach(function (s) { tot += v ? s.h : s.w; });
      var gap = ((v ? y1 - y0 : x1 - x0) - tot) / (srt.length - 1), at = v ? y0 : x0;
      srt.forEach(function (s) { if (v) { s.y = Math.round(at); at += s.h + gap; } else { s.x = Math.round(at); at += s.w + gap; } });
    }
    ss.forEach(function (s) { s.x = Math.max(0, s.x); s.y = Math.max(0, s.y); });
    paintDia(); paintOv(); push();
  }
  // ── 框裡的字（下面的格式文字框；上面的格式列都能用）──
  function openText(id) {
    var s = shape(id); if (!s) return;
    closeText();
    var r = rteCreate({ value: s.v || "", lite: true, onChange: function (v) { s.v = v; paintDia(); if (grow(s)) paintDia(); paintOv(); clearTimeout(S.txt && S.txt.tm); if (S.txt) S.txt.tm = setTimeout(function () { changed(); }, 600); } });
    S.txt = { id: id, rte: r, v0: s.v || "" };
    txt.innerHTML = "";
    txt.appendChild(h("div", { class: "drw-txth" }, [h("b", {}, ["✏️ " + (YZ_DRAW_KIND_NAME[s.k] || "框") + "裡的字"]), h("span", { class: "muted" }, ["　上面「字」「整行」兩排的按鍵都可以用（粗體、紅字、螢光筆、編號、標題…）；框會自己長高"]), h("span", { class: "sp" }), btn("完成", function () { closeText(); stage.focus({ preventScroll: true }); }, "sm pri")]));
    txt.appendChild(r.el);
    txt.hidden = false;
    S.sel = [id]; S.ls = null; paintOv(); syncCtx();
    setTimeout(function () { r.focus(); }, 0);
  }
  function closeText(how) {   // how："nopush"＝不留復原紀錄（復原／重做的時候）
    if (!S.txt) return;
    var x = S.txt; S.txt = null; clearTimeout(x.tm);
    txt.hidden = true; txt.innerHTML = "";
    var s = shape(x.id);
    if (how !== "nopush" && s && (s.v || "") !== x.v0) push(); else paintFoot();
    if (RTE.cur === x.rte) { RTE.cur = null; rteBarSync(); }
  }
  function grow(s) {   // 字放不下：框自己長高（菱形、橢圓照比例多長一點）。長高了＝true
    var el = gDia && gDia.querySelector('[data-t="' + s.id + '"]');
    if (!el || !el.firstChild) return false;
    var need = el.firstChild.offsetHeight, have = el.clientHeight;
    if (need <= have + 1) return false;
    var A = drTextArea(s), k = (A.h || 1) / s.h, add = Math.ceil((need - have) / Math.max(0.3, k));
    s.h = Math.min(2000, drSnap(s.h + add + 9));
    drFit(d); resizeSvg();
    return true;
  }
  // ── 上面兩排按鍵 ──
  function tbtn(label, tip, fn, cls) { var x = h("button", { class: "btn sm" + (cls ? " " + cls : ""), type: "button", title: tip }, [label]); x.addEventListener("mousedown", function (e) { e.preventDefault(); }); x.onclick = function () { act(); fn(); }; return x; }
  function zoomTo(z) { S.z = Math.max(0.3, Math.min(2.5, z)); DRW_Z.set(d, S.z); resizeSvg(); paintOv(); zl.textContent = Math.round(S.z * 100) + "%"; }
  function fitZoom() { var w = view.clientWidth - 4; if (w > 50) zoomTo(Math.min(1, w / (d.W + 30))); }
  var zl = h("span", { class: "drw-z" }, ["100%"]);
  var lkBtn = tbtn("🔗 連線", "連箭頭：先點一個框，再點要連到的框（也可以直接從框旁邊的藍點拉到另一個框）", function () { S.linkMode = !S.linkMode; S.linkFrom = null; lkBtn.classList.toggle("on", S.linkMode); paintOv(); syncCtx(); });
  var fullBtn = tbtn("⛶ 放大畫", "整個畫面都拿來畫（上面的格式列還在）；再按一次回來", function () { setFull(!root.classList.contains("full")); });
  var undoB = tbtn("↶", "復原（Ctrl+Z）", undo), redoB = tbtn("↷", "重做（Ctrl+Y）", redo);
  bar1.appendChild(h("span", { class: "drw-lab" }, ["新增"]));
  DR_ADD.forEach(function (x) { bar1.appendChild(tbtn(x[1], x[0] === "note" ? "說明框：放旁邊的補充說明（LINE 上會放在下一張卡片）" : "新增一個" + YZ_DRAW_KIND_NAME[x[0]] + "（選著一個框的話：接在它下面、自動連箭頭）", function () { addShape(x[0]); }, "drw-add")); });
  bar1.appendChild(lkBtn);
  bar1.appendChild(h("span", { class: "sp" }));
  [undoB, redoB, tbtn("−", "縮小", function () { zoomTo(S.z / 1.2); }), zl, tbtn("＋", "放大", function () { zoomTo(S.z * 1.2); }), tbtn("符合寬度", "整張放進這一塊的寬度", fitZoom), fullBtn].forEach(function (x) { bar1.appendChild(x); });
  function syncCtx() {
    bar2.innerHTML = "";
    undoB.disabled = S.hi <= 0; redoB.disabled = S.hi >= S.hist.length - 1;
    var ss = S.sel.map(shape).filter(Boolean), l = S.ls ? link(S.ls) : null;
    if (S.linkMode) { bar2.appendChild(h("span", { class: "drw-hint" }, [S.linkFrom ? "🔗 再點要連到的那個框（點空白的地方取消）" : "🔗 先點箭頭從哪個框出發"])); return; }
    if (l) {
      var rs = h("select", { class: "in sm drw-rs", title: "箭頭怎麼走" }, [["", "自動（直的、橫的、轉一個彎）"], ["line", "直線（斜的也可以）"], ["hv", "先橫再直"], ["vh", "先直再橫"]].map(function (o) { return h("option", { value: o[0] }, [o[1]]); }));
      rs.value = l.st || ""; rs.onchange = function () { act(); if (rs.value) l.st = rs.value; else delete l.st; paintDia(); paintOv(); push(); };
      var ah = h("select", { class: "in sm drw-ah", title: "箭頭的頭" }, [["", "→ 指到後面那個框"], ["start", "← 指到前面那個框"], ["both", "↔ 兩邊都有"], ["none", "— 沒有箭頭"]].map(function (o) { return h("option", { value: o[0] }, [o[1]]); }));
      ah.value = l.ah || ""; ah.onchange = function () { if (ah.value === "start" && !bk41Ok()) { ah.value = l.ah || ""; bk41Warn("箭頭指到前面那個框"); return; } act(); if (ah.value) l.ah = ah.value; else delete l.ah; paintDia(); paintOv(); push(); };
      // 第 41 批：線條（實線、虛線、點線、長虛線）、粗細、顏色（後端 02 還是舊的：存了會不見 → 先提醒）
      var setL = function (k, v) { if (v && !bk41Ok()) { bk41Warn("連線的樣式（虛線、粗細、顏色）"); syncCtx(); return; } act(); if (v) l[k] = v; else delete l[k]; paintDia(); paintOv(); push(); syncCtx(); };
      var ds = h("select", { class: "in sm drw-ds", title: "線條：實線、虛線、點線、長虛線", "aria-label": "線條" }, YZ_DRAW_DASH_ORDER.map(function (k) { return h("option", { value: k }, [{ "": "━ 實線", dash: "╍ 虛線", dot: "┈ 點線", long: "━ ━ 長虛線" }[k]]); }));
      ds.value = _yzDrawOpt_(YZ_DRAW_DASH, l.ds); ds.onchange = function () { setL("ds", ds.value); };
      var lw = h("select", { class: "in sm drw-lw", title: "線的粗細", "aria-label": "粗細" }, YZ_DRAW_LW_ORDER.map(function (k) { return h("option", { value: k }, [YZ_DRAW_LW[k].label + (k ? "" : "（預設）")]); }));
      lw.value = _yzDrawOpt_(YZ_DRAW_LW, l.lw); lw.onchange = function () { setL("lw", lw.value); };
      var lcw = h("span", { class: "drw-lcs", role: "group", "aria-label": "線的顏色" });
      YZ_DRAW_LC_ORDER.forEach(function (k) {
        var C = YZ_DRAW_LC[k], on = _yzDrawOpt_(YZ_DRAW_LC, l.lc) === k;
        var x = tbtn("", "線的顏色：" + C.label + (k ? "" : "（預設）"), function () { setL("lc", k); }, "drw-lc" + (on ? " on" : ""));
        x.setAttribute("data-lc", k); x.setAttribute("aria-label", "線的顏色：" + C.label); x.setAttribute("aria-pressed", on ? "true" : "false");
        x.appendChild(h("i", { style: "background:" + C.c }));
        lcw.appendChild(x);
      });
      var lt = h("input", { class: "in sm drw-lt", value: l.t || "", maxlength: "30", placeholder: "箭頭上的字（例如：是、否）", "aria-label": "箭頭上的字" });
      lt.oninput = function () { act(); if (lt.value.trim()) l.t = lt.value; else delete l.t; paintDia(); paintOv(); };
      lt.onchange = function () { var v = lt.value.replace(/[\r\n]+/g, " ").trim().slice(0, 30); if (v) l.t = v; else delete l.t; lt.value = v; paintDia(); paintOv(); push(); };
      lt.onkeydown = function (e) { if (e.key === "Enter") { e.preventDefault(); lt.blur(); } };
      [h("span", { class: "drw-lab" }, ["箭頭"]), rs, ah, ds, lw, lcw, lt, tbtn("⇄ 反過來", "箭頭換方向", function () { var x = l.a; l.a = l.b; l.b = x; paintDia(); paintOv(); push(); }), tbtn("🗑 刪除", "刪掉這條箭頭（Delete）", delSel, "bad")].forEach(function (x) { bar2.appendChild(x); });
      return;
    }
    if (!ss.length) { bar2.appendChild(h("span", { class: "drw-hint" }, ["點一下框＝選起來；拖曳＝移動；拉右下角的白點＝改大小；滑到框上會有藍點，從藍點拉到另一個框＝箭頭；連點兩下＝打字；連點兩下空白的地方＝新增方框。Shift＋點＝多選。"])); return; }
    bar2.appendChild(h("span", { class: "drw-lab" }, [ss.length > 1 ? "選了 " + ss.length + " 個" : YZ_DRAW_KIND_NAME[ss[0].k]]));
    var cw = h("span", { class: "drw-cols" });
    YZ_DRAW_COLORS.forEach(function (c) {
      var T = _yzDrawTone_(c), on = ss.every(function (s) { return (s.c || "") === c; });
      var x = tbtn(T.label, "框的顏色：" + T.label, function () { setOn(function (s) { if (c) s.c = c; else delete s.c; }); }, "drw-col" + (on ? " on" : ""));
      x.style.background = T.bg; x.style.borderColor = T.bd; x.style.color = T.ink;
      cw.appendChild(x);
    });
    bar2.appendChild(cw);
    var ks = h("select", { class: "in sm", title: "形狀" }, YZ_DRAW_KINDS.map(function (k) { return h("option", { value: k }, [YZ_DRAW_KIND_NAME[k]]); }));
    ks.value = ss.every(function (s) { return s.k === ss[0].k; }) ? ss[0].k : "";
    ks.onchange = function () { act(); setOn(function (s) { s.k = ks.value; }); };
    bar2.appendChild(ks);
    var al = h("select", { class: "in sm", title: "框裡的字靠哪邊" }, [["c", "字置中"], ["l", "字靠左"], ["r", "字靠右"]].map(function (o) { return h("option", { value: o[0] }, [o[1]]); }));
    al.value = ss[0].al || (ss[0].k === "note" ? "l" : "c");
    al.onchange = function () { act(); setOn(function (s) { s.al = al.value; }); };
    bar2.appendChild(al);
    if (ss.some(function (s) { return s.k !== "txt"; })) {   // 第 41 批：框線（實線、虛線、點線、長虛線）；「只有字」沒有框
      var fd = h("select", { class: "in sm drw-fds", title: "框線：實線、虛線、點線、長虛線", "aria-label": "框線" }, YZ_DRAW_DASH_ORDER.map(function (k) { return h("option", { value: k }, [{ "": "框線：實線", dash: "框線：虛線", dot: "框線：點線", long: "框線：長虛線" }[k]]); }));
      fd.value = ss.every(function (s) { return _yzDrawOpt_(YZ_DRAW_DASH, s.ds) === _yzDrawOpt_(YZ_DRAW_DASH, ss[0].ds); }) ? _yzDrawOpt_(YZ_DRAW_DASH, ss[0].ds) : "";
      fd.onchange = function () { if (fd.value && !bk41Ok()) { bk41Warn("框線（虛線、點線）"); syncCtx(); return; } act(); setOn(function (s) { if (fd.value && s.k !== "txt") s.ds = fd.value; else delete s.ds; }); };
      bar2.appendChild(fd);
    }
    if (ss.length === 1) bar2.appendChild(tbtn("✏️ 改字", "改框裡的字（也可以連點兩下框）", function () { openText(ss[0].id); }));
    if (ss.length > 1) {
      var am = h("select", { class: "in sm", title: "對齊、平均分配" }, [["", "對齊…"], ["c", "直的一排（置中對齊）"], ["l", "靠左對齊"], ["r", "靠右對齊"], ["m", "橫的一排（置中對齊）"], ["t", "靠上對齊"], ["b", "靠下對齊"], ["dv", "上下平均分配"], ["dh", "左右平均分配"]].map(function (o) { return h("option", { value: o[0] }, [o[1]]); }));
      am.onchange = function () { act(); var v = am.value; am.value = ""; if (v) align(v); };
      bar2.appendChild(am);
    }
    bar2.appendChild(tbtn("⧉ 複製", "複製選起來的框（連同它們中間的箭頭；Ctrl+D）", dupSel));
    bar2.appendChild(tbtn("🗑 刪除", "刪掉選起來的框（連到它的箭頭也一起刪；Delete）", delSel, "bad"));
  }
  // ── 放大畫（整個畫面；上面的格式列還在）──
  function setFull(on) {
    root.classList.toggle("full", on);
    fullBtn.classList.toggle("on", on);
    fullBtn.textContent = on ? "⛶ 回到原本大小" : "⛶ 放大畫";
    if (on) { var tw = document.getElementById("edtbw"), top = tw ? Math.max(0, tw.getBoundingClientRect().bottom) : 0; root.style.top = Math.round(top) + "px"; document.body.classList.add("drw-noscroll"); }
    else { root.style.top = ""; document.body.classList.remove("drw-noscroll"); }
    setTimeout(fitZoom, 30);
  }
  // ── 滑鼠／手指 ──
  var raf = 0;
  function later() { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; paintDia(); paintOv(); }); }
  stage.addEventListener("pointerdown", function (e) {
    if (e.button !== 0 || !svg) return;
    act();
    if (document.activeElement !== stage && !(S.txt && txt.contains(document.activeElement))) stage.focus({ preventScroll: true });
    var p = pt(e), hd = hitHandle(p), dot = !hd ? hitDot(p) : null, sid = !hd && !dot ? hitShape(p) : null, lid = !hd && !dot && !sid ? hitLink(p) : null;
    // 連點兩下（自己算：框在點的時候會重畫，瀏覽器的 dblclick 不一定會來）：框＝打字；空白的地方＝新增方框
    var now = Date.now(), dbl = !!(S.lastDown && now - S.lastDown.t < 450 && Math.abs(e.clientX - S.lastDown.x) < 6 && Math.abs(e.clientY - S.lastDown.y) < 6);
    S.lastDown = dbl ? null : { t: now, x: e.clientX, y: e.clientY };
    if (dbl && !S.linkMode && !hd && !dot) { if (sid) openText(sid); else if (!lid) addShape("box", p); e.preventDefault(); return; }
    if (S.linkMode) {   // 「🔗 連線」：先點出發的框，再點要連到的框
      if (!sid) { S.linkFrom = null; S.linkMode = false; lkBtn.classList.remove("on"); paintOv(); syncCtx(); return; }
      if (!S.linkFrom) { S.linkFrom = sid; paintOv(); syncCtx(); return; }
      if (sid !== S.linkFrom) addLink(S.linkFrom, sid);
      S.linkFrom = null; S.linkMode = false; lkBtn.classList.remove("on"); paintOv(); syncCtx();
      return;
    }
    S.drag = { p0: p, p: p, moved: false };
    if (hd) { var s0 = shape(S.sel[0]); S.mode = "resize"; S.drag.h = hd; S.drag.s0 = { x: s0.x, y: s0.y, w: s0.w, h: s0.h }; }
    else if (dot) { S.mode = "link"; S.drag.from = dot.id; S.drag.p0 = dot.p; S.drag.to = null; }
    else if (sid) {
      if (e.shiftKey) { var at = S.sel.indexOf(sid); if (at >= 0) S.sel.splice(at, 1); else S.sel.push(sid); }
      else if (S.sel.indexOf(sid) < 0) S.sel = [sid];
      S.ls = null; S.mode = "move"; S.drag.st = {};
      S.sel.forEach(function (id) { var s = shape(id); if (s) S.drag.st[id] = { x: s.x, y: s.y }; });
      if (S.txt && S.txt.id !== sid) closeText();
    } else if (lid) { S.ls = lid; S.sel = []; S.mode = null; S.drag = null; if (S.txt) closeText(); }
    else { if (!e.shiftKey) S.sel = []; S.ls = null; S.mode = "band"; if (S.txt) closeText(); }
    if (!S.txt && document.activeElement !== stage) stage.focus({ preventScroll: true });   // 下面打字的框關掉了：鍵盤回到畫布（Delete、Ctrl+Z…）
    try { stage.setPointerCapture(e.pointerId); } catch (x) { /* 沒關係 */ }
    paintOv(); syncCtx();
    e.preventDefault();
  });
  stage.addEventListener("pointermove", function (e) {
    if (!svg) return;
    var p = pt(e);
    if (!S.drag || !S.mode) {   // 滑過：哪個框（給藍點）
      var hv = hitShape(p, 10 / S.z);
      if (hv !== S.hov) { S.hov = hv; paintOv(); }
      stage.style.cursor = hitHandle(p) ? "nwse-resize" : hitDot(p) ? "crosshair" : hv ? "move" : hitLink(p) ? "pointer" : "default";
      return;
    }
    S.drag.p = p;
    var dx = p.x - S.drag.p0.x, dy = p.y - S.drag.p0.y;
    if (Math.abs(dx) + Math.abs(dy) > 2 / S.z) S.drag.moved = true;
    if (S.mode === "move" && S.drag.moved) { moveSel(dx, dy, e.altKey); later(); }
    else if (S.mode === "resize") { resizeSel(dx, dy); later(); }
    else if (S.mode === "link") { var tg = hitShape(p, 6 / S.z); S.drag.to = tg && tg !== S.drag.from ? tg : null; paintOv(); }
    else if (S.mode === "band") paintOv();
  });
  function endDrag(e) {
    if (!S.drag) return;
    var m = S.mode, dr = S.drag;
    S.mode = null; S.drag = null; S.guides = [];
    try { stage.releasePointerCapture(e.pointerId); } catch (x) { /* 沒關係 */ }
    if (m === "link" && dr.to) addLink(dr.from, dr.to);
    else if (m === "band" && dr.moved) {
      var a = dr.p0, c = dr.p, B = { x: Math.min(a.x, c.x), y: Math.min(a.y, c.y), x2: Math.max(a.x, c.x), y2: Math.max(a.y, c.y) };
      d.s.forEach(function (s) { if (s.x >= B.x && s.y >= B.y && s.x + s.w <= B.x2 && s.y + s.h <= B.y2 && S.sel.indexOf(s.id) < 0) S.sel.push(s.id); });
    } else if ((m === "move" && dr.moved) || m === "resize") { drFit(d); resizeSvg(); paintDia(); push(); }
    paintOv(); syncCtx();
  }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("pointerleave", function () { if (!S.drag && S.hov) { S.hov = null; paintOv(); } });
  function addLink(a, c) {
    if (d.l.some(function (l) { return l.a === a && l.b === c; })) { toast("這兩個框已經有箭頭了"); return; }
    var l = { id: drNewId(d, "l"), a: a, b: c }; d.l.push(l);
    S.ls = l.id; S.sel = [];
    paintDia(); paintOv(); push();
  }
  function moveSel(dx, dy, free) {   // 拖曳：照格子對齊；跟別的框的中線、邊對得到就吸過去（橘色虛線）
    var st = S.drag.st, ids = Object.keys(st); if (!ids.length) return;
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    ids.forEach(function (id) { var s = shape(id); if (!s) return; x0 = Math.min(x0, st[id].x); y0 = Math.min(y0, st[id].y); x1 = Math.max(x1, st[id].x + s.w); y1 = Math.max(y1, st[id].y + s.h); });
    var nx = x0 + dx, ny = y0 + dy, w = x1 - x0, hh = y1 - y0, gs = [];
    if (!free) {
      nx = drSnap(nx); ny = drSnap(ny);
      var tol = 7 / S.z, bx = null, by = null;
      d.s.forEach(function (o) {
        if (st[o.id]) return;
        [[nx + w / 2, o.x + o.w / 2], [nx, o.x], [nx + w, o.x + o.w]].forEach(function (c, i) { var dd = c[1] - c[0]; if (Math.abs(dd) <= tol && (bx === null || Math.abs(dd) < Math.abs(bx.d))) bx = { d: dd, x: c[1], o: o }; });
        [[ny + hh / 2, o.y + o.h / 2], [ny, o.y], [ny + hh, o.y + o.h]].forEach(function (c) { var dd = c[1] - c[0]; if (Math.abs(dd) <= tol && (by === null || Math.abs(dd) < Math.abs(by.d))) by = { d: dd, y: c[1], o: o }; });
      });
      if (bx) { nx += bx.d; gs.push([bx.x, Math.min(ny, bx.o.y) - 10, bx.x, Math.max(ny + hh, bx.o.y + bx.o.h) + 10]); }
      if (by) { ny += by.d; gs.push([Math.min(nx, by.o.x) - 10, by.y, Math.max(nx + w, by.o.x + by.o.w) + 10, by.y]); }
    }
    nx = Math.max(0, nx); ny = Math.max(0, ny);
    S.guides = gs;
    ids.forEach(function (id) { var s = shape(id); if (s) { s.x = Math.round(st[id].x + nx - x0); s.y = Math.round(st[id].y + ny - y0); } });
    if (nx + w > d.W || ny + hh > d.H) { drFit(d); resizeSvg(); }
  }
  function resizeSel(dx, dy) {   // 拉白點改大小（邊照格子對齊；最小 40 × 30）
    var s = shape(S.sel[0]), o = S.drag.s0, hd = S.drag.h; if (!s) return;
    var L = o.x, T = o.y, R = o.x + o.w, B = o.y + o.h, mw = s.k === "txt" ? 30 : 40, mh = s.k === "txt" ? 20 : 30;
    if (hd.indexOf("w") >= 0) L = Math.max(0, drSnap(o.x + dx));
    if (hd.indexOf("e") >= 0) R = drSnap(R + dx);
    if (hd.indexOf("n") >= 0) T = Math.max(0, drSnap(o.y + dy));
    if (hd.indexOf("s") >= 0) B = drSnap(B + dy);
    if (R - L < mw) { if (hd.indexOf("w") >= 0) L = R - mw; else R = L + mw; }
    if (B - T < mh) { if (hd.indexOf("n") >= 0) T = B - mh; else B = T + mh; }
    s.x = Math.round(L); s.y = Math.round(T); s.w = Math.round(R - L); s.h = Math.round(B - T);
    if (s.x + s.w > d.W || s.y + s.h > d.H) { drFit(d); resizeSvg(); }
  }
  // ── 鍵盤（畫布要先點一下）──
  stage.addEventListener("keydown", function (e) {
    var k = e.key, mod = e.ctrlKey || e.metaKey;
    act();
    if (mod && (k === "z" || k === "Z") && !e.shiftKey) { e.preventDefault(); undo(); return; }
    if (mod && (k === "y" || k === "Y" || ((k === "z" || k === "Z") && e.shiftKey))) { e.preventDefault(); redo(); return; }
    if (mod && (k === "d" || k === "D")) { e.preventDefault(); dupSel(); return; }
    if (mod && (k === "a" || k === "A")) { e.preventDefault(); S.sel = d.s.map(function (s) { return s.id; }); S.ls = null; paintOv(); syncCtx(); return; }
    if (k === "Delete" || k === "Backspace") { e.preventDefault(); delSel(); return; }
    if (k === "Escape") { if (root.classList.contains("full") && !S.sel.length && !S.ls) setFull(false); S.sel = []; S.ls = null; S.linkMode = false; S.linkFrom = null; lkBtn.classList.remove("on"); paintOv(); syncCtx(); return; }
    if ((k === "Enter" || k === "F2") && S.sel.length === 1) { e.preventDefault(); openText(S.sel[0]); return; }
    var mv = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[k];
    if (mv && S.sel.length) {
      e.preventDefault();
      var n = e.shiftKey ? 10 : 1;
      S.sel.forEach(function (id) { var s = shape(id); if (s) { s.x = Math.max(0, s.x + mv[0] * n); s.y = Math.max(0, s.y + mv[1] * n); } });
      paintDia(); paintOv(); clearTimeout(S.nudge); S.nudge = setTimeout(push, 400);
    }
  });
  root.addEventListener("focusout", function () {   // 離開這張流程圖：自動存檔時就可以畫成圖了
    setTimeout(function () { if (!root.contains(document.activeElement) && DRW.act === d) { DRW.act = null; if (drDirty(b) && ED && !ED.dirty) markDirty(); } }, 200);
  });
  paintAll(); syncCtx();
  root._drw = { d: d, undo: undo, redo: redo, add: addShape, sel: function (ids) { S.sel = ids.slice(); S.ls = null; paintOv(); syncCtx(); }, selLink: function (id) { S.ls = id; S.sel = []; paintOv(); syncCtx(); }, text: openText, close: closeText, zoom: zoomTo, fit: fitZoom, full: setFull, align: align, del: delSel, dup: dupSel, link: addLink, state: function () { return S; } };   // 測試、預覽工具用
  requestAnimationFrame(function () { if (hadZ) zoomTo(S.z); else fitZoom(); });
  return root;
}

/* ════════ quized.js ════════ */
/* ═══════════════ quized.js：編輯器的「📋 問卷」（開發者；第 32 批）═══════════════
 * 問卷、考試放在另外一個「問卷專用試算表」：按中間的「💾 儲存」馬上寫進去（不是手冊的自動存檔）。
 * 左邊：問卷、考試的清單、「🗂 題庫」、「✨ AI 出題」；中間：那一份的設定和題目；預覽視窗：藥師在網頁、LINE 上看到的樣子。
 * 考試的題目從題庫抽：自己出、或叫 AI 出（只用 Gemini 3.8 Flash；送出前遮字清單裡的字換成「本院」；AI 出的先「待審」，你按「採用」才會考到）。 */
var QE = null, KEEP_QE = null;
var QE_DIFF = ["中", "高", "更難", "超難"];
var QE_DIFF_TIP = { "中": "基本：手冊裡直接寫的重點（新進同仁看過一次就該會）", "高": "要理解：把兩、三個重點連起來，或分辨很像的情況", "更難": "要應用：給一個實際的情境（處方、病人、狀況），判斷該怎麼做", "超難": "細節＋陷阱：例外情況、數字、容易搞混的地方，選項都很像" };
var QE_ST = { draft: "草稿", open: "開放", end: "結束" }, QE_BST = { ok: "採用", wait: "待審", off: "停用" };
var QE_MAXQ = 40, QE_MAXO = 6;
function qeNew() {
  return { loaded: false, busy: false, none: false, err: "", zs: [], bank: [], cnt: {}, mask: 0, today: "", sel: { k: "home", id: "" }, z: null, dirty: false, saving: false,
    b: null, bDirty: false, bf: { st: "", diff: "", ch: "", by: "", q: "", zx: "" }, bShow: 40, ai: { scope: [], diff: "中", n: 5, types: ["one"], hint: "" }, aiBusy: false, aiRes: null, words: null, res: null, resBusy: false };
}
function qeDrop() { QE = null; }
function qeErr(e) { return e && e.code === "bad" ? "藥戰手冊的後端還不認得這個（Apps Script 要貼新版、部署新版本）" : String(e && e.message || e); }
function qeCall(act, a, b, ms) {
  return call("hbQzEd", [act, a === undefined ? "" : a, b === undefined ? "" : b], { ms: ms || 60000 }).then(function (r) {
    if (r && r.st === "lock") { logout("expired"); throw new Error("驗證過期了"); }
    if (!r) throw new Error("後端沒有回應");
    if (r.err || (r.st && !r.ok)) { var e = new Error(r.err || "現在不能用（請重新整理）"); e.r = r; throw e; }
    return r;
  });
}
function qeZ(id) { return (QE && QE.zs || []).filter(function (z) { return z.id === id; })[0] || null; }
function qeB(id) { return (QE && QE.bank || []).filter(function (b) { return b.id === id; })[0] || null; }
function qeHb() { return ED ? edHb() : HB; }

/* ── 閒置登出：還沒存的問卷留在記憶體，重新驗證後接著改 ── */
function qeKeep() { return QE && QE.dirty && QE.z ? { z: clone(QE.z), sel: clone(QE.sel) } : null; }
function qeRestore() {
  if (!KEEP_QE) return false;
  QE = qeNew(); QE.z = KEEP_QE.z; QE.sel = KEEP_QE.sel; QE.dirty = true; KEEP_QE = null;
  return true;
}

/* ── 讀全部（問卷、題庫、作答數）── */
function qeLoad(force, quiet) {
  if (!QE) QE = qeNew();
  if (QE.busy || (QE.loaded && !force)) return;
  QE.busy = true; QE.err = "";
  qeCall("all").then(function (r) {
    if (!QE) return;
    QE.busy = false; QE.loaded = true; QE.none = !!r.none;
    if (!r.none) { QE.zs = r.zs || []; QE.bank = r.bank || []; QE.cnt = r.cnt || {}; QE.mask = r.mask || 0; QE.today = r.today || ""; }
    if (QE.sel.k === "z" && QE.sel.id && !QE.dirty) { var z = qeZ(QE.sel.id); QE.z = z ? qeZIn(z) : null; if (!z) QE.sel = { k: "home", id: "" }; }
    if (QE.b && !QE.bDirty) QE.b = null;
    if (force && !quiet) toast("已經重新讀了問卷試算表");
    qeRender();
  }, function (e) { if (!QE) return; QE.busy = false; QE.err = qeErr(e); qeRender(); });
}
function qeRender() {   // 停在「📋 問卷」才重畫（游標、捲到哪裡都留著）
  if (!ED || ED.mode !== "qz" || TAB !== "edit") return;
  var a = document.activeElement, key = a && a.getAttribute ? a.getAttribute("data-qk") : "", s0 = null, s1 = null, y = window.scrollY;
  try { s0 = a.selectionStart; s1 = a.selectionEnd; } catch (e) { /* 不是文字框 */ }
  renderToolbar(); renderTree(); renderForm(); refreshPreview();
  try { window.scrollTo(0, y); } catch (e) { /* 沒關係 */ }
  if (key) {
    var el = $("#edc2 [data-qk=\"" + key + "\"]");
    if (el) try { el.focus({ preventScroll: true }); if (s0 !== null && el.setSelectionRange) el.setSelectionRange(s0, s1); } catch (e) { /* 沒關係 */ }
  }
}
var QE_PV_T = 0;
function qePv() { clearTimeout(QE_PV_T); QE_PV_T = setTimeout(function () { if (ED && ED.mode === "qz") refreshPreview(); }, 250); }
function qeDirty() { QE.dirty = true; qeDirtyPaint(); qePv(); }
function qeDirtyPaint() {
  $$(".qedirty").forEach(function (e) { e.textContent = QE.saving ? "儲存中…" : QE.dirty ? "● 有修改還沒存（按「💾 儲存」才會寫進問卷試算表）" : "✅ 都存好了"; e.classList.toggle("on", !!QE.dirty); });
}
// 換到別的之前：有還沒存的就先問
function qeAsk(go) {
  if (QE && QE.dirty && QE.z) {
    modal({ title: "「" + (QE.z.title || "（沒有標題）") + "」還沒儲存", lines: ["你改的東西還沒存進問卷試算表。"], buttons: [{ label: "先不要", cls: "sm" }, { label: "不存了", cls: "sm bad", fn: function () { QE.dirty = false; QE.z = null; go(); } }, { label: "💾 儲存再走", cls: "sm pri", fn: function () { qeSaveZ(go); } }] });
    return;
  }
  if (QE && QE.bDirty && QE.b) {
    modal({ title: "這一題還沒存", lines: ["題庫裡正在改的那一題還沒存。"], buttons: [{ label: "先不要", cls: "sm" }, { label: "不存了", cls: "sm bad", fn: function () { QE.bDirty = false; QE.b = null; go(); } }, { label: "💾 存好再走", cls: "sm pri", fn: function () { qeSaveB(go); } }] });
    return;
  }
  go();
}
function qeSel(k, id) { qeAsk(function () { QE.sel = { k: k, id: id || "" }; if (k === "z") { var z = qeZ(id); QE.z = z ? qeZIn(z) : null; QE.dirty = false; } if (k !== "bank") { QE.b = null; QE.bDirty = false; } if (k === "res") QE.res = null; qeRender(); try { window.scrollTo(0, 0); } catch (e) { /* 沒關係 */ } }); }

/* ── 左邊：清單 ── */
function qeTree(c1) {
  if (!QE) QE = qeNew();
  qeLoad();
  if (QE.err && !QE.loaded) { c1.appendChild(hint("⚠ " + QE.err)); c1.appendChild(btn("🔄 再試一次", function () { QE.err = ""; qeLoad(true); qeRender(); })); return; }
  if (!QE.loaded) { c1.appendChild(hint("問卷試算表讀取中…")); return; }
  if (QE.none) { c1.appendChild(hint("還沒建立問卷試算表：按中間的「建立問卷試算表」。")); return; }
  var item = function (on, ico, name, sub, fn, extra) {
    return h("div", { class: "chI qeI" + (on ? " on" : ""), role: "button", tabindex: "0", onclick: fn, onkeydown: function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } } }, [
      h("div", { class: "th thi" }, [ico]), h("div", { style: "min-width:0;flex:1" }, [h("div", { class: "t2" }, [name]), sub ? h("div", { class: "t1" }, [sub]) : null]), extra || null]);
  };
  var zItem = function (z) {
    var on = QE.sel.k === "z" && QE.sel.id === z.id, n = QE.cnt[z.id] || 0, d = on && QE.dirty;
    var sub = (z.kind === "x" ? (z.x ? z.x.n : 0) + " 題" : z.qs.length + " 題") + (n ? "・" + n + " 份作答" : "") + (d ? "・● 還沒存" : "");
    return item(on, z.kind === "x" ? "📝" : "📋", z.title, sub, function () { qeSel("z", z.id); }, h("span", { class: "qest " + z.st }, [QE_ST[z.st]]));
  };
  ["q", "x"].forEach(function (k) {
    var list = QE.zs.filter(function (z) { return z.kind === k; });
    c1.appendChild(lbl("", (k === "x" ? "📝 考試（" : "📋 問卷（") + list.length + "）"));
    list.forEach(function (z) { c1.appendChild(zItem(z)); });
    if (QE.sel.k === "z" && !QE.sel.id && QE.z && QE.z.kind === k) c1.appendChild(item(true, k === "x" ? "📝" : "📋", QE.z.title || "（新的，還沒存）", "還沒存", function () { /* 已經選了 */ }));
    c1.appendChild(h("div", { style: "padding:2px 0 8px 4px" }, [btn(k === "x" ? "＋新增考試" : "＋新增問卷", function () { qeNewZ(k); })]));
  });
  c1.appendChild(lbl("", "出題"));
  var nw = QE.bank.filter(function (b) { return b.st === "wait"; }).length;
  c1.appendChild(item(QE.sel.k === "bank", "🗂", "題庫", QE.bank.length + " 題" + (nw ? "・待審 " + nw : ""), function () { qeSel("bank"); }, nw ? h("span", { class: "qest wait" }, ["待審 " + nw]) : null));
  c1.appendChild(item(QE.sel.k === "ai", "✨", "AI 出題", "3.8 Flash・遮字清單 " + QE.mask + " 個", function () { qeSel("ai"); }));
  c1.appendChild(h("div", { style: "padding-top:10px;display:flex;gap:6px;flex-wrap:wrap" }, [btn("🏠 說明", function () { qeSel("home"); }), btn("🔄 重新整理", function () { qeAsk(function () { qeLoad(true); }); })]));
  c1.appendChild(hint("問卷（含考試）存在「問卷專用試算表」：按中間的「💾 儲存」才寫進去（不是手冊的自動存檔）。在試算表裡直接改過的話，按「🔄 重新整理」。"));
}
function qeNewZ(kind) {
  qeAsk(function () {
    QE.sel = { k: "z", id: "" }; QE.b = null; QE.bDirty = false;
    QE.z = kind === "x" ? { id: "", kind: "x", title: "", note: "", st: "draft", from: "", to: "", named: true, qs: [], x: { n: 10, diff: ["中"], scope: [], pass: 60, retake: true } }
      : { id: "", kind: "q", title: "", note: "", st: "draft", from: "", to: "", named: true, qs: [qeQNew("one")], x: null };
    QE.dirty = true;
    qeRender();
    var t = $("#edc2 [data-qk=title]"); if (t) try { t.focus(); } catch (e) { /* 沒關係 */ }
  });
}
function qeQNew(t) { return { id: "", t: t || "one", q: "", opts: [], raw: t === "one" || t === "many" ? "\n\n" : "", req: true }; }
function qeZIn(z) {   // 後端來的 → 編輯用（選項放成「一行一個」的字）
  var c = clone(z);
  c.qs = (c.qs || []).map(function (q) { q.raw = (q.opts || []).join("\n"); return q; });
  if (c.kind === "x" && !c.x) c.x = { n: 10, diff: ["中"], scope: [], pass: 60, retake: true };
  return c;
}
function qeOptsOf(raw) { return String(raw || "").split(/\r?\n/).map(function (s) { return s.replace(/\s+/g, " ").trim(); }).filter(Boolean); }
function qeZOut(z) {   // 編輯用 → 送給後端
  var o = { id: z.id, kind: z.kind, title: String(z.title || "").trim(), note: String(z.note || "").trim(), st: z.st, from: z.from || "", to: z.to || "", named: z.kind === "x" ? true : z.named !== false };
  if (z.kind === "q") o.qs = z.qs.map(function (q) { return { id: q.id || "", t: q.t, q: String(q.q || "").trim(), opts: q.t === "one" || q.t === "many" ? qeOptsOf(q.raw).slice(0, QE_MAXO) : [], req: q.req !== false }; });
  else o.x = { n: z.x.n, diff: z.x.diff.slice(), scope: z.x.scope.slice(), pass: z.x.pass, retake: z.x.retake !== false };
  return o;
}
function qeCheckZ(z) {   // 存之前檢查：哪裡沒寫好（後端會把不完整的題目丟掉，所以先講）
  var out = [];
  if (!String(z.title || "").trim()) out.push("還沒寫標題");
  if (z.from && z.to && z.from > z.to) out.push("開始日比結束日晚");
  if (z.kind === "q") {
    if (!z.qs.length && z.st === "open") out.push("要「開放」至少要有 1 題");
    z.qs.forEach(function (q, i) {
      if (!String(q.q || "").trim()) out.push("第 " + (i + 1) + " 題：還沒寫題目");
      if ((q.t === "one" || q.t === "many") && qeOptsOf(q.raw).length < 2) out.push("第 " + (i + 1) + " 題：選項至少要 2 個（一行一個）");
      if ((q.t === "one" || q.t === "many") && qeOptsOf(q.raw).length > QE_MAXO) out.push("第 " + (i + 1) + " 題：選項最多 " + QE_MAXO + " 個");
    });
  } else {
    if (!(z.x.n >= 1 && z.x.n <= 50)) out.push("題數要是 1～50");
    if (!(z.x.pass >= 0 && z.x.pass <= 100)) out.push("及格分數要是 0～100");
    if (!z.x.diff.length) out.push("難度至少選一個");
  }
  return out;
}
function qeDate(v) { var m = /^(\d{4})[\/-](\d{2})[\/-](\d{2})$/.exec(String(v || "")); return m ? m[1] + "-" + m[2] + "-" + m[3] : ""; }

/* ── 中間 ── */
function qeForm(f) {
  if (!QE) QE = qeNew();
  qeLoad();
  if (!QE.loaded) {
    f.appendChild(h("h3", { style: "font-size:16px" }, ["📋 問卷"]));
    f.appendChild(QE.err ? h("div", { class: "qebox warn" }, ["⚠ " + QE.err]) : hint("問卷試算表讀取中…"));
    if (QE.err) f.appendChild(btn("🔄 再試一次", function () { QE.err = ""; qeLoad(true); qeRender(); }, "pri"));
    return;
  }
  if (QE.none) return qeSetupForm(f);
  if (QE.sel.k === "z" && QE.z) return qeZForm(f, QE.z);
  if (QE.sel.k === "bank") return qeBankForm(f);
  if (QE.sel.k === "ai") return qeAiForm(f);
  if (QE.sel.k === "res") return qeResForm(f);
  qeHome(f);
}
function qeSetupForm(f) {
  f.appendChild(h("h3", { style: "font-size:16px" }, ["📋 問卷：第一次用要先建立問卷試算表"]));
  f.appendChild(h("div", { class: "qebox" }, [
    h("p", {}, ["問卷（含考試）放在另外一個「問卷專用試算表」（跟手冊分開）。按下面的按鈕，會幫你建好四個分頁：問卷、題目、題庫、作答。"]),
    h("p", {}, ["試算表的位置會加密存在藥戰手冊專案的指令碼屬性（YZ_QZ_ID），網頁上不會出現。建好以後，在雲端硬碟搜尋「藥戰手冊問卷」找得到（只有你看得到，請不要分享）。"])
  ]));
  var b = btn("建立問卷試算表", function () {
    b.disabled = true; b.textContent = "建立中…";
    qeCall("setup", "", "", 90000).then(function (r) {
      toast(r.old ? "問卷試算表之前就建好了" : "✅ 建好了問卷試算表");
      QE.loaded = false; QE.none = false; qeLoad(true, true);
    }, function (e) { b.disabled = false; b.textContent = "建立問卷試算表"; toast("❌ " + qeErr(e)); });
  }, "pri");
  f.appendChild(h("div", { style: "margin:10px 0" }, [b]));
}
function qeHome(f) {
  var nq = QE.zs.filter(function (z) { return z.kind === "q"; }).length, nx = QE.zs.length - nq, open = QE.zs.filter(function (z) { return z.st === "open"; }).length;
  f.appendChild(h("h3", { style: "font-size:16px" }, ["📋 問卷"]));
  f.appendChild(h("div", { class: "qegrid" }, [
    h("div", { class: "qecard" }, [h("b", {}, ["📋 問卷 " + nq + " 份"]), h("span", {}, ["單選、複選、簡答、評分 1～5"]), btn("＋新增問卷", function () { qeNewZ("q"); }, "pri")]),
    h("div", { class: "qecard" }, [h("b", {}, ["📝 考試 " + nx + " 份"]), h("span", {}, ["從題庫抽題；難度、題數、範圍、及格分數"]), btn("＋新增考試", function () { qeNewZ("x"); }, "pri")]),
    h("div", { class: "qecard" }, [h("b", {}, ["🗂 題庫 " + QE.bank.length + " 題"]), h("span", {}, ["自己出題，或看 AI 出的（待審）"]), btn("打開題庫", function () { qeSel("bank"); })]),
    h("div", { class: "qecard" }, [h("b", {}, ["✨ AI 出題"]), h("span", {}, ["選範圍、難度、題數；只用 3.8 Flash"]), btn("AI 出題", function () { qeSel("ai"); })])
  ]));
  f.appendChild(lbl("", "怎麼用"));
  f.appendChild(h("ol", { class: "qeol" }, [
    h("li", {}, ["新增問卷（或考試）→ 填好 → 狀態改成「開放」→ 按「💾 儲存」。現在開放中：" + open + " 份。"]),
    h("li", {}, ["藥師在 LINE（打「問卷」、或按下面那排的「📋 問卷」）或網頁（首頁的「📋 問卷」）填。可以按「📣 LINE 通知大家」推一張卡片。"]),
    h("li", {}, ["考試：題目從題庫抽（「採用」的才會考到）。交卷後藥師馬上看到分數、正確答案和詳解。"]),
    h("li", {}, ["「📊 看結果」看統計；每一份作答也在問卷試算表的「作答」分頁。"])
  ]));
}

// 一份問卷／考試
function qeZForm(f, z) {
  var exam = z.kind === "x", saved = !!z.id && !!qeZ(z.id), n = saved ? QE.cnt[z.id] || 0 : 0;
  f.appendChild(h("div", { class: "qehd" }, [h("h3", { style: "font-size:16px;margin:0" }, [(exam ? "📝 考試：" : "📋 問卷：") + (z.title || "（還沒有標題）")]), h("span", { class: "qedirty" + (QE.dirty ? " on" : ""), "aria-live": "polite" }, [""])]));
  var probs = [];
  f.appendChild(lbl("一", "標題（藥師在清單上看到的）"));
  f.appendChild(qeIn(z.title, "title", function (v) { z.title = v; qeDirty(); }, { maxlength: "60", placeholder: exam ? "例：錠劑調劑測驗" : "例：調劑台使用滿意度" }));
  f.appendChild(lbl("二", "說明（開始前看到的；可以不寫）"));
  f.appendChild(qeTa(z.note, "note", function (v) { z.note = v; qeDirty(); }, 2, { maxlength: "500", placeholder: exam ? "例：考第 4 章；交卷後看得到詳解" : "例：大約 3 分鐘，謝謝大家" }));
  f.appendChild(lbl("三", "狀態"));
  f.appendChild(qeSeg([["draft", "草稿"], ["open", "開放"], ["end", "結束"]], z.st, function (v) { z.st = v; qeDirty(); qeRender(); }));
  var today = QE.today || "", out = z.st === "open" && today && ((z.from && today < z.from) || (z.to && today > z.to));
  f.appendChild(hint(z.st === "draft" ? "草稿：藥師看不到，可以慢慢改。" : z.st === "open" ? (out ? "⚠ 開放，但今天不在日期內：藥師現在還看不到。" : "開放：藥師現在看得到、可以填（存好就生效）。") : "結束：藥師看不到了，結果留著。"));
  f.appendChild(lbl("四", "日期（可以不填：不填＝狀態是「開放」就一直開著）"));
  var d1 = h("input", { class: "in qedt", type: "date", "data-qk": "from", value: qeDate(z.from), "aria-label": "開始日" }), d2 = h("input", { class: "in qedt", type: "date", "data-qk": "to", value: qeDate(z.to), "aria-label": "結束日" });
  d1.onchange = function () { z.from = d1.value.replace(/-/g, "/"); qeDirty(); }; d2.onchange = function () { z.to = d2.value.replace(/-/g, "/"); qeDirty(); };
  f.appendChild(h("div", { class: "qerow" }, [h("span", {}, ["從"]), d1, h("span", {}, ["到"]), d2, h("span", { class: "muted" }, ["（含那一天）"])]));
  if (exam) {
    qeExamSet(f, z);
  } else {
    f.appendChild(lbl("五", "記名嗎"));
    f.appendChild(qeSeg([["1", "具名（記名字、員工代號）"], ["0", "不記名"]], z.named === false ? "0" : "1", function (v) { z.named = v === "1"; qeDirty(); qeRender(); }));
    f.appendChild(hint(z.named === false ? "不記名：試算表不記名字、員工代號（只用一串亂碼擋重複填）。" : "具名：結果看得到誰填了什麼。"));
    if (n) f.appendChild(h("div", { class: "qebox warn" }, ["⚠ 已經有 " + n + " 份作答：改題目的順序、刪掉題目，之前的結果會對不起來（答案是照第幾題記的）。要大改的話，建議新增一份。"]));
    f.appendChild(lbl("六", "題目（" + z.qs.length + " 題，最多 " + QE_MAXQ + " 題）"));
    z.qs.forEach(function (q, i) { f.appendChild(qeQEl(z, q, i)); });
    var addRow = h("div", { class: "qerow" }, [h("span", { class: "muted" }, ["＋新增一題："])]);
    [["one", "單選"], ["many", "複選"], ["text", "簡答"], ["rate", "評分 1～5"]].forEach(function (p) {
      var ab = btn("＋" + p[1], function () { if (z.qs.length >= QE_MAXQ) { toast("最多 " + QE_MAXQ + " 題"); return; } z.qs.push(qeQNew(p[0])); qeDirty(); qeRender(); var t = $$("#edc2 .qeq textarea[data-qk^=q]"); if (t.length) try { t[t.length - 1].focus(); } catch (e) { /* 沒關係 */ } });
      if (z.qs.length >= QE_MAXQ) ab.disabled = true;
      addRow.appendChild(ab);
    });
    f.appendChild(addRow);
  }
  probs = qeCheckZ(z);
  if (probs.length) f.appendChild(h("div", { class: "qebox warn" }, [h("b", {}, ["還沒好的地方："]), h("ul", {}, probs.map(function (p) { return h("li", {}, [p]); }))]));
  // 按鈕
  var sv = btn("💾 儲存", function () { qeSaveZ(); }, "pri"); sv.id = "qeSave";
  var acts = h("div", { class: "qeacts" }, [sv]);
  if (QE.dirty && saved) acts.appendChild(btn("放棄修改", function () { modal({ title: "放棄還沒存的修改？", lines: ["回到上一次存的樣子。"], buttons: [{ label: "不要", cls: "sm" }, { label: "放棄修改", cls: "sm bad", fn: function () { QE.z = qeZIn(qeZ(z.id)); QE.dirty = false; qeRender(); } }] }); }));
  if (saved) {
    acts.appendChild(btn("📊 看結果（" + n + " 份）", function () { qeSel("res", z.id); }));
    if (z.st === "open") acts.appendChild(btn("📣 LINE 通知大家", function () { qeNotify(z); }));
    acts.appendChild(confirmBtn("🗑 刪除這一份", function () { qeDelZ(z); }, "sm bad"));
  } else acts.appendChild(btn("不要這一份了", function () { QE.dirty = false; QE.z = null; QE.sel = { k: "home", id: "" }; qeRender(); }));
  f.appendChild(acts);
  f.appendChild(hint("右邊的預覽視窗（「網頁」／「LINE 卡片」）是藥師看到的樣子。"));
  setTimeout(qeDirtyPaint, 0);
}
function qeIn(v, key, on, attrs) {
  var a = Object.assign({ class: "in", "data-qk": key, value: v || "" }, attrs || {});
  var el = h("input", a); el.oninput = function () { on(el.value); };
  return el;
}
function qeTa(v, key, on, rows, attrs) {
  var el = h("textarea", Object.assign({ class: "ta", "data-qk": key, rows: String(rows || 2) }, attrs || {})); el.value = v || "";
  el.oninput = function () { on(el.value); };
  return el;
}
function qeSeg(opts, cur, on) {
  var seg = h("div", { class: "seg qeseg", role: "group" });
  opts.forEach(function (p) {
    var b = h("button", { type: "button", class: p[0] === cur ? "on" : "", "aria-pressed": p[0] === cur ? "true" : "false" }, [p[1]]);
    b.onclick = function () { if (p[0] === cur) return; on(p[0]); };
    seg.appendChild(b);
  });
  return seg;
}
function qeNum(v, key, lo, hi, on) {
  var el = h("input", { class: "in qenum", type: "number", inputmode: "numeric", min: String(lo), max: String(hi), step: "1", "data-qk": key, value: String(v) });
  el.oninput = function () { var n = Math.round(+el.value); if (el.value !== "" && isFinite(n)) on(Math.max(lo, Math.min(hi, n))); };
  el.onblur = function () { var n = Math.round(+el.value); if (el.value === "" || !isFinite(n) || n < lo || n > hi) { el.value = String(Math.max(lo, Math.min(hi, isFinite(n) ? n : v))); on(+el.value); } };
  return el;
}
// 問卷的一題
function qeQEl(z, q, i) {
  var n = z.qs.length, k = "q" + i;
  var ty = h("select", { class: "in qety", "aria-label": "第 " + (i + 1) + " 題的題型", "data-qk": k + "t" });
  [["one", "單選"], ["many", "複選（可以選好幾個）"], ["text", "簡答（打字）"], ["rate", "評分 1～5"]].forEach(function (p) { ty.appendChild(h("option", { value: p[0] }, [p[1]])); });
  ty.value = q.t;
  ty.onchange = function () { var was = q.t; q.t = ty.value; if ((q.t === "one" || q.t === "many") && !(was === "one" || was === "many") && !qeOptsOf(q.raw).length) q.raw = "\n\n"; qeDirty(); qeRender(); };
  var req = h("input", { type: "checkbox", "data-qk": k + "r" }); req.checked = q.req !== false; req.onchange = function () { q.req = req.checked; qeDirty(); };
  var mv = function (d) { var j = i + d; if (j < 0 || j >= n) return; z.qs.splice(j, 0, z.qs.splice(i, 1)[0]); qeDirty(); qeRender(); };
  var up = btn("↑", function () { mv(-1); }), dn = btn("↓", function () { mv(1); });
  up.title = "往上移"; dn.title = "往下移"; up.setAttribute("aria-label", "第 " + (i + 1) + " 題往上移"); dn.setAttribute("aria-label", "第 " + (i + 1) + " 題往下移");
  if (i === 0) up.disabled = true; if (i === n - 1) dn.disabled = true;
  var del = confirmBtn("🗑", function () { z.qs.splice(i, 1); qeDirty(); qeRender(); }, "sm bad"); del.title = "刪掉這一題"; del.setAttribute("aria-label", "刪掉第 " + (i + 1) + " 題");
  var box = h("div", { class: "qeq" }, [
    h("div", { class: "qeq-h" }, [h("b", {}, ["第 " + (i + 1) + " 題"]), ty, h("label", { class: "qereq" }, [req, " 必填"]), h("span", { class: "sp" }), up, dn, del]),
    qeTa(q.q, k, function (v) { q.q = v; qeDirty(); }, 2, { maxlength: "300", placeholder: "題目（例：你覺得新的調劑台好用嗎？）", "aria-label": "第 " + (i + 1) + " 題的題目" })
  ]);
  if (q.t === "one" || q.t === "many") {
    var cnt = h("div", { class: "hint" }, [""]);
    var paint = function () { var o = qeOptsOf(q.raw); cnt.textContent = "選項：一行一個（2～" + QE_MAXO + " 個），現在 " + o.length + " 個" + (o.length > QE_MAXO ? "　⚠ 太多了" : o.length < 2 ? "　⚠ 至少要 2 個" : "") + "。藥師看到的是 A、B、C…"; };
    box.appendChild(qeTa(q.raw, k + "o", function (v) { q.raw = v; paint(); qeDirty(); }, Math.max(3, Math.min(7, qeOptsOf(q.raw).length + 1)), { placeholder: "很好用\n普通\n不好用", "aria-label": "第 " + (i + 1) + " 題的選項（一行一個）" }));
    paint(); box.appendChild(cnt);
  } else box.appendChild(hint(q.t === "rate" ? "藥師選 1～5 分（1 最低、5 最高）；結果看得到平均幾分。" : "藥師直接打字回答（最多 1000 字；LINE 上是直接打一句話）。"));
  return box;
}
// 考試的設定：難度、題數、範圍、及格、重考
function qeExamSet(f, z) {
  var x = z.x;
  var box = h("div", { class: "qeset" });
  box.appendChild(h("div", { class: "qeset-h" }, ["五、考試的設定"]));
  box.appendChild(lbl("", "難度（可以選好幾個；從這些難度的題目裡抽）"));
  var dr = h("div", { class: "qechips" });
  QE_DIFF.forEach(function (d) {
    var on = x.diff.indexOf(d) >= 0;
    var b = h("button", { type: "button", class: "qechip" + (on ? " on" : ""), "aria-pressed": on ? "true" : "false", title: QE_DIFF_TIP[d] }, [(on ? "✓ " : "") + d]);
    b.onclick = function () { var at = x.diff.indexOf(d); if (at >= 0) { if (x.diff.length === 1) { toast("難度至少要選一個"); return; } x.diff.splice(at, 1); } else x.diff.push(d); x.diff.sort(function (a, c) { return QE_DIFF.indexOf(a) - QE_DIFF.indexOf(c); }); qeDirty(); qeRender(); };
    dr.appendChild(b);
  });
  box.appendChild(dr);
  box.appendChild(hint(x.diff.map(function (d) { return d + "：" + QE_DIFF_TIP[d]; }).join("　")));
  box.appendChild(h("div", { class: "qerow" }, [h("span", {}, ["考幾題"]), qeNum(x.n, "xn", 1, 50, function (v) { x.n = v; qeDirty(); qePoolPaint(z); }), h("span", { class: "muted" }, ["題（每個人從符合的題目裡隨機抽，順序也打亂）"])]));
  box.appendChild(lbl("", "範圍（不選＝整本手冊；選了章＝那一章的標題都算）"));
  box.appendChild(qeScopeEl(x.scope, function () { qeDirty(); qePoolPaint(z); }));
  box.appendChild(h("div", { class: "qerow" }, [h("span", {}, ["及格"]), qeNum(x.pass, "xp", 0, 100, function (v) { x.pass = v; qeDirty(); }), h("span", { class: "muted" }, ["分（滿分 100）"])]));
  box.appendChild(lbl("", "可以重考嗎"));
  box.appendChild(qeSeg([["1", "可以重考（每次重新抽題）"], ["0", "只能考一次"]], x.retake === false ? "0" : "1", function (v) { x.retake = v === "1"; qeDirty(); qeRender(); }));
  box.appendChild(h("div", { class: "qepool", id: "qepool" }));
  box.appendChild(h("div", { class: "qerow" }, [btn("🗂 看符合的題目", function () { qeAsk(function () { QE.bf = { st: "", diff: "", ch: "", by: "", q: "", zx: z.id || "" }; if (!z.id) toast("先存好這一份，題庫才篩得出來"); qeSel("bank"); }); }), btn("✨ 用這個範圍叫 AI 出題", function () { qeAsk(function () { QE.ai.scope = x.scope.slice(); QE.ai.diff = x.diff[0] || "中"; qeSel("ai"); }); })]));
  f.appendChild(box);
  setTimeout(function () { qePoolPaint(z); }, 0);
}
function qeInScope(b, scope, hb) {   // 跟後端 _yzQzInScope_ 一樣
  if (!scope || !scope.length) return true;
  return (b.scope || []).some(function (c) {
    if (scope.indexOf(c) >= 0) return true;
    var m = /^t:(.+)$/.exec(c), f = m && hb ? _yzQzEdFindT_(hb, m[1]) : null;
    return !!(f && scope.indexOf("c:" + f.ch.id) >= 0);
  });
}
function _yzQzEdFindT_(hb, tid) {
  var r = null;
  (hb.chapters || []).forEach(function (c) { ((hb.titles || {})[c.id] || []).forEach(function (t) { if (!r && t.id === tid) r = { ch: c, t: t }; }); });
  return r;
}
function qePool(z) { var hb = qeHb(); return QE.bank.filter(function (b) { return b.st === "ok" && z.x.diff.indexOf(b.diff) >= 0 && qeInScope(b, z.x.scope, hb); }); }
function qePoolPaint(z) {
  var el = $("#qepool"); if (!el || !z.x) return;
  var p = qePool(z), by = {};
  p.forEach(function (b) { by[b.diff] = (by[b.diff] || 0) + 1; });
  var wait = QE.bank.filter(function (b) { return b.st === "wait" && z.x.diff.indexOf(b.diff) >= 0 && qeInScope(b, z.x.scope, qeHb()); }).length;
  el.className = "qepool" + (!p.length ? " bad" : p.length < z.x.n ? " warn" : " ok");
  el.textContent = (p.length ? "符合的題目（採用的、難度和範圍都對）：" + p.length + " 題（" + QE_DIFF.filter(function (d) { return by[d]; }).map(function (d) { return d + " " + by[d]; }).join("、") + "）。" : "⚠ 題庫裡還沒有符合的題目（採用的、難度和範圍都對）：藥師現在開始不了。") +
    (p.length && p.length < z.x.n ? "比題數 " + z.x.n + " 少：每次都考這 " + p.length + " 題。" : p.length ? "每次抽 " + z.x.n + " 題。" : "") + (wait ? "　另外有 " + wait + " 題「待審」（採用了才會考到）。" : "");
}
// 範圍：章（打勾＝整章），點「▸」打開看標題
function qeScopeEl(sel, onChange) {
  var hb = qeHb(), wrap = h("div", { class: "qescope" }), opened = {};
  var draw = function () {
    wrap.innerHTML = "";
    var chs = hb.chapters || [];
    if (!chs.length) { wrap.appendChild(hint("手冊還沒有章。")); return; }
    var top = h("div", { class: "qescope-top" }, [h("span", {}, [sel.length ? "選了 " + sel.length + " 個" : "沒選＝整本手冊"]), sel.length ? btn("全部取消", function () { sel.splice(0, sel.length); onChange(); draw(); }) : null]);
    wrap.appendChild(top);
    chs.forEach(function (c) {
      var ts = (hb.titles || {})[c.id] || [], cc = "c:" + c.id, onC = sel.indexOf(cc) >= 0, nT = ts.filter(function (t) { return sel.indexOf("t:" + t.id) >= 0; }).length;
      var open = !!opened[c.id] || nT > 0;
      var ck = h("input", { type: "checkbox", "aria-label": "整章：" + c.name }); ck.checked = onC;
      ck.onchange = function () {
        var at = sel.indexOf(cc); if (ck.checked && at < 0) sel.push(cc); if (!ck.checked && at >= 0) sel.splice(at, 1);
        ts.forEach(function (t) { var a2 = sel.indexOf("t:" + t.id); if (a2 >= 0) sel.splice(a2, 1); });   // 整章選了：標題不用另外選
        onChange(); draw();
      };
      var tog = ts.length ? h("button", { type: "button", class: "btn sm qetog", "aria-expanded": open ? "true" : "false", "aria-label": (open ? "收起" : "打開") + "「" + c.name + "」的標題" }, [open ? "▾" : "▸"]) : null;
      if (tog) tog.onclick = function () { opened[c.id] = !open; if (open && nT) toast("這一章有選標題，會一直打開"); draw(); };
      wrap.appendChild(h("div", { class: "qesc" }, [tog || h("span", { class: "qetog0" }), h("label", {}, [ck, " " + (c.name || "（沒有章名）"), h("span", { class: "muted" }, ["（" + ts.length + " 個標題）"])])]));
      if (open) ts.forEach(function (t) {
        var tc = "t:" + t.id, ck2 = h("input", { type: "checkbox", "aria-label": "標題：" + t.name }); ck2.checked = onC || sel.indexOf(tc) >= 0; ck2.disabled = onC;
        ck2.onchange = function () { var at = sel.indexOf(tc); if (ck2.checked && at < 0) sel.push(tc); if (!ck2.checked && at >= 0) sel.splice(at, 1); onChange(); draw(); };
        wrap.appendChild(h("div", { class: "qest2" }, [h("label", {}, [ck2, " " + (t.name || "（沒有標題）")])]));
      });
    });
  };
  draw();
  return wrap;
}
function qeScopeName(codes) { var hb = qeHb(); return (codes || []).map(function (c) { return _yzMapToInfo_(c, hb).short || ""; }).filter(Boolean).join("；"); }

function qeSaveZ(then) {
  var z = QE.z; if (!z || QE.saving) return;
  var probs = qeCheckZ(z);
  if (probs.length) { modal({ title: "還不能存", lines: probs, buttons: [{ label: "好", cls: "sm pri" }] }); return; }
  QE.saving = true; qeDirtyPaint();
  var b = $("#qeSave"); if (b) b.disabled = true;
  var sent = JSON.stringify(qeZOut(z));
  qeCall("save", sent).then(function (r) {
    QE.saving = false;
    var sz = r.z, at = -1;
    QE.zs.forEach(function (x, i) { if (x.id === sz.id) at = i; });
    if (at >= 0) QE.zs[at] = sz; else QE.zs.push(sz);
    var still = QE.z === z && JSON.stringify(qeZOut(QE.z)) !== sent;   // 存的時候又改了：那些修改留著（還沒存）
    if (!still) { QE.z = qeZIn(sz); QE.dirty = false; } else { QE.z.id = sz.id; }
    QE.sel = { k: "z", id: sz.id };
    toast("✅ 存好了" + (sz.st === "open" ? "：藥師現在就看得到" : "（狀態是「" + QE_ST[sz.st] + "」：藥師看不到）"));
    QZ.peekAt = 0;   // 看的那邊：左下角的「📋 問卷」重新問
    qeRender();
    if (then) then();
  }, function (e) { QE.saving = false; qeDirtyPaint(); var b2 = $("#qeSave"); if (b2) b2.disabled = false; toast("❌ 沒有存：" + qeErr(e)); });
}
function qeDelZ(z) {
  qeCall("del", z.id).then(function () {
    QE.zs = QE.zs.filter(function (x) { return x.id !== z.id; });
    QE.z = null; QE.dirty = false; QE.sel = { k: "home", id: "" };
    toast("已刪掉「" + z.title + "」（已經交的作答留在試算表）");
    QZ.peekAt = 0; qeRender();
  }, function (e) { toast("❌ " + qeErr(e)); });
}
function qeNotify(z) {
  if (QE.dirty) { toast("先按「💾 儲存」，再通知"); return; }
  qeCall("push", z.id, true).then(function (r) {
    if (!r.n) { modal({ title: "沒有人可以通知", lines: ["核可名單上還沒有人。"], buttons: [{ label: "好", cls: "sm pri" }] }); return; }
    modal({ title: "用 LINE 通知 " + r.n + " 個人？", lines: ["推一張「" + (z.kind === "x" ? "📝 新的考試" : "📋 新的問卷") + "：" + z.title + "」的卡片給核可名單上的人（一次最多 100 人" + (r.all > r.n ? "，這次只推前 100 人" : "") + "）。", "會用掉 " + r.n + " 則 LINE 推播額度（每個月有上限）。預覽視窗的「LINE 卡片」看得到那張卡片。"],
      buttons: [{ label: "先不要", cls: "sm" }, { label: "📣 推給 " + r.n + " 個人", cls: "sm pri", fn: function () {
        qeCall("push", z.id, false, 120000).then(function (r2) { toast("📣 已經通知 " + (r2.sent || 0) + " 個人" + (r2.sent < r.n ? "（有 " + (r.n - r2.sent) + " 個人沒推到）" : "")); }, function (e) { toast("❌ " + qeErr(e)); });
      } }] });
  }, function (e) { toast("❌ " + qeErr(e)); });
}

/* ── 題庫 ── */
function qeBankList() {
  var f = QE.bf, zx = f.zx ? qeZ(f.zx) : null, hb = qeHb(), q = String(f.q || "").trim().toLowerCase();
  return QE.bank.filter(function (b) {
    if (zx && zx.x && !(b.st === "ok" && zx.x.diff.indexOf(b.diff) >= 0 && qeInScope(b, zx.x.scope, hb))) return false;
    if (f.st && b.st !== f.st) return false;
    if (f.diff && b.diff !== f.diff) return false;
    if (f.by && b.by !== f.by) return false;
    if (f.ch && !qeInScope(b, ["c:" + f.ch], hb)) return false;
    if (q && (b.q + "\n" + b.opts.join("\n") + "\n" + b.ex).toLowerCase().indexOf(q) < 0) return false;
    return true;
  }).sort(function (a, c) { return (a.st === "wait" ? 0 : 1) - (c.st === "wait" ? 0 : 1) || String(c.mt || "").localeCompare(String(a.mt || "")); });
}
function qeBankForm(f) {
  var bf = QE.bf;
  f.appendChild(h("div", { class: "qehd" }, [h("h3", { style: "font-size:16px;margin:0" }, ["🗂 題庫（" + QE.bank.length + " 題）"]), h("span", { class: "sp" }), btn("＋新增一題", function () { qeBEditOpen(null); }, "pri")]));
  f.appendChild(hint("考試的題目從這裡抽：狀態是「採用」的才會考到。AI 出的題目先放「待審」，看過按「採用」。"));
  if (QE.b && !QE.b.id) f.appendChild(qeBEditEl());
  var sel = function (key, opts, label) {
    var s = h("select", { class: "in qef", "aria-label": label });
    opts.forEach(function (p) { s.appendChild(h("option", { value: p[0] }, [p[1]])); });
    s.value = bf[key] || ""; s.onchange = function () { bf[key] = s.value; QE.bShow = 40; qeRender(); };
    return s;
  };
  var hb = qeHb();
  var zxOpts = [["", "全部的題目"]].concat(QE.zs.filter(function (z) { return z.kind === "x"; }).map(function (z) { return [z.id, "符合考試：" + z.title]; }));
  var qin = h("input", { class: "in qef", type: "search", placeholder: "找題目、選項、詳解裡的字", "aria-label": "找題目", "data-qk": "bq", value: bf.q || "" });
  var qt = 0; qin.oninput = function () { clearTimeout(qt); qt = setTimeout(function () { bf.q = qin.value; QE.bShow = 40; qeRender(); }, 300); };
  f.appendChild(h("div", { class: "qefilter" }, [
    sel("st", [["", "全部狀態"], ["wait", "待審"], ["ok", "採用"], ["off", "停用"]], "狀態"),
    sel("diff", [["", "全部難度"]].concat(QE_DIFF.map(function (d) { return [d, d]; })), "難度"),
    sel("ch", [["", "全部的章"]].concat((hb.chapters || []).map(function (c) { return [c.id, c.name]; })), "章"),
    sel("by", [["", "誰出的：全部"], ["dev", "開發者出的"], ["ai", "AI 出的"]], "誰出的"),
    zxOpts.length > 1 ? sel("zx", zxOpts, "符合哪個考試") : null,
    qin
  ]));
  var list = qeBankList(), waits = list.filter(function (b) { return b.st === "wait"; });
  var info = h("div", { class: "qerow" }, [h("span", {}, ["顯示 " + list.length + " 題" + (waits.length ? "（待審 " + waits.length + " 題）" : "")])]);
  if (waits.length) info.appendChild(btn("✅ 這 " + waits.length + " 題待審的全部採用", function () { qeBankSet(waits, "ok"); }));
  if (bf.st || bf.diff || bf.ch || bf.by || bf.q || bf.zx) info.appendChild(btn("清掉篩選", function () { QE.bf = { st: "", diff: "", ch: "", by: "", q: "", zx: "" }; qeRender(); }));
  f.appendChild(info);
  if (!list.length) f.appendChild(h("div", { class: "qebox" }, [QE.bank.length ? "沒有符合篩選的題目。" : "題庫還是空的：按「＋新增一題」自己出，或到「✨ AI 出題」。"]));
  list.slice(0, QE.bShow).forEach(function (b) { f.appendChild(QE.b && QE.b.id === b.id ? qeBEditEl() : qeBItemEl(b)); });
  if (list.length > QE.bShow) f.appendChild(h("div", { style: "text-align:center;margin:8px 0" }, [btn("顯示更多（還有 " + (list.length - QE.bShow) + " 題）", function () { QE.bShow += 60; qeRender(); })]));
}
function qeBItemEl(b, o) {
  o = o || {};
  var hb = qeHb();
  var chips = h("div", { class: "qechips sm" }, [h("span", { class: "qest " + b.st }, [QE_BST[b.st]]), h("span", { class: "qetag" }, [b.by === "ai" ? "✨ AI" : "開發者"]), h("span", { class: "qetag" }, [b.diff]), h("span", { class: "qetag" }, [YZ_QZ_T[b.t]]),
    b.scope && b.scope.length ? h("span", { class: "qetag sc" }, [qeScopeName(b.scope) || "（範圍找不到了）"]) : h("span", { class: "qetag sc" }, ["沒有範圍（整本都算）"])]);
  var opts = h("ol", { class: "qebo" + (b.t === "tf" ? " tf" : "") });
  b.opts.forEach(function (op, k) { opts.appendChild(h("li", { class: b.ans.indexOf(k) >= 0 ? "ok" : "" }, [h("b", {}, [b.t === "tf" ? "" : YZ_QZ_LET.charAt(k) + ". "]), op, b.ans.indexOf(k) >= 0 ? h("span", { class: "qeok" }, [" ✓ 正確"]) : null])); });
  var acts = h("div", { class: "qeacts sm" }, [btn("✏️ 編輯", function () { qeBEditOpen(b); })]);
  if (b.st === "wait") acts.appendChild(btn("✅ 採用", function () { qeBankSet([b], "ok"); }, "pri"));
  if (b.st === "ok") acts.appendChild(btn("停用", function () { qeBankSet([b], "off"); }));
  if (b.st === "off") acts.appendChild(btn("恢復採用", function () { qeBankSet([b], "ok"); }));
  acts.appendChild(confirmBtn("🗑 刪除", function () { qeBankDel([b]); }, "sm bad"));
  return h("div", { class: "qeb" + (b.st === "wait" ? " wait" : b.st === "off" ? " off" : "") + (o.cls ? " " + o.cls : "") }, [chips, h("div", { class: "qebq" }, [b.q]), opts, b.ex ? h("div", { class: "qebx" }, [h("b", {}, ["詳解："]), b.ex]) : h("div", { class: "qebx none" }, ["（沒有詳解：藥師交卷後只看得到正確答案）"]), acts]);
}
function qeBEditOpen(b) {
  qeAsk(function () {
    QE.b = b ? clone(b) : { id: "", t: "one", q: "", opts: ["", "", "", ""], ans: [], ex: "", diff: "中", scope: [], st: "ok", by: "dev" };
    if (QE.b.t !== "tf") while (QE.b.opts.length < 2) QE.b.opts.push("");
    QE.bDirty = !b; if (QE.sel.k !== "ai" || !b) QE.sel = { k: "bank", id: "" };   // AI 出的那幾題：留在「✨ AI 出題」那一頁改
    qeRender();
    var t = $("#edc2 [data-qk=bq0]"); if (t) try { t.scrollIntoView({ block: "center" }); t.focus({ preventScroll: true }); } catch (e) { /* 沒關係 */ }
  });
}
function qeBEditEl() {
  var b = QE.b, hb = qeHb();
  var set = function () { QE.bDirty = true; qePv(); };
  var box = h("div", { class: "qeb qeedit" });
  box.appendChild(h("div", { class: "qehd" }, [h("b", {}, [b.id ? "✏️ 改這一題" : "＋新的題目"]), b.by === "ai" ? h("span", { class: "qetag" }, ["✨ AI 出的"]) : null]));
  box.appendChild(lbl("", "題型"));
  box.appendChild(qeSeg([["one", "單選"], ["many", "複選"], ["tf", "是非"]], b.t, function (v) {
    var was = b.t; b.t = v;
    if (v === "tf") { b.opts = ["對", "錯"]; b.ans = b.ans.length && was === "tf" ? b.ans : []; }
    else { if (was === "tf") { b.opts = ["", "", "", ""]; b.ans = []; } if (v === "one" && b.ans.length > 1) b.ans = b.ans.slice(0, 1); }
    set(); qeRender();
  }));
  box.appendChild(lbl("", "題目"));
  box.appendChild(qeTa(b.q, "bq0", function (v) { b.q = v; set(); }, 3, { maxlength: "500", placeholder: "例：高警訊藥品調劑時，下面哪一個做法正確？" }));
  box.appendChild(lbl("", b.t === "tf" ? "正確答案" : "選項（左邊勾正確答案" + (b.t === "many" ? "，可以勾好幾個" : "") + "）"));
  var ol = h("div", { class: "qebopts" });
  if (b.t === "tf") {
    ["對", "錯"].forEach(function (lab, k) {
      var r = h("input", { type: "radio", name: "qetf", "data-qk": "bt" + k }); r.checked = b.ans[0] === k;
      r.onchange = function () { b.ans = [k]; set(); };
      ol.appendChild(h("label", { class: "qebopt" }, [r, " " + (k === 0 ? "⭕ 對" : "❌ 錯")]));
    });
  } else {
    b.opts.forEach(function (op, k) {
      var ck = h("input", { type: b.t === "many" ? "checkbox" : "radio", name: "qeans", "aria-label": "選項 " + YZ_QZ_LET.charAt(k) + " 是正確答案" }); ck.checked = b.ans.indexOf(k) >= 0;
      ck.onchange = function () { if (b.t === "many") { var at = b.ans.indexOf(k); if (ck.checked && at < 0) b.ans.push(k); if (!ck.checked && at >= 0) b.ans.splice(at, 1); b.ans.sort(); } else b.ans = [k]; set(); };
      var inp = qeIn(op, "bo" + k, function (v) { b.opts[k] = v; set(); }, { maxlength: "120", placeholder: "選項 " + YZ_QZ_LET.charAt(k), "aria-label": "選項 " + YZ_QZ_LET.charAt(k) });
      var del = btn("✕", function () { if (b.opts.length <= 2) { toast("至少要 2 個選項"); return; } b.opts.splice(k, 1); b.ans = b.ans.filter(function (a) { return a !== k; }).map(function (a) { return a > k ? a - 1 : a; }); set(); qeRender(); });
      del.setAttribute("aria-label", "刪掉選項 " + YZ_QZ_LET.charAt(k));
      ol.appendChild(h("div", { class: "qebopt" }, [ck, h("b", {}, [YZ_QZ_LET.charAt(k)]), inp, del]));
    });
    if (b.opts.length < QE_MAXO) ol.appendChild(btn("＋選項", function () { b.opts.push(""); set(); qeRender(); var ins = $$("#edc2 [data-qk^=bo]"); if (ins.length) try { ins[ins.length - 1].focus(); } catch (e) { /* 沒關係 */ } }));
  }
  box.appendChild(ol);
  box.appendChild(lbl("", "詳解（交卷後藥師看得到；寫為什麼、根據哪一個標題）"));
  box.appendChild(qeTa(b.ex, "bx", function (v) { b.ex = v; set(); }, 3, { maxlength: "1000", placeholder: "例：手冊「高警訊藥品」：要兩個人核對。" }));
  box.appendChild(lbl("", "難度"));
  box.appendChild(qeSeg(QE_DIFF.map(function (d) { return [d, d]; }), b.diff, function (v) { b.diff = v; set(); qeRender(); }));
  box.appendChild(hint(QE_DIFF_TIP[b.diff]));
  box.appendChild(lbl("", "範圍（這一題是手冊哪裡的；考試照這個篩）"));
  var chips = h("div", { class: "qechips sm" });
  (b.scope || []).forEach(function (c, i) {
    var x = btn("✕", function () { b.scope.splice(i, 1); set(); qeRender(); }); x.setAttribute("aria-label", "拿掉範圍「" + qeScopeName([c]) + "」");
    chips.appendChild(h("span", { class: "qetag sc" }, [qeScopeName([c]) || "（找不到了）", x]));
  });
  var add = h("select", { class: "in qef", "aria-label": "加一個範圍" });
  add.appendChild(h("option", { value: "" }, [(b.scope || []).length ? "＋再加一個…" : "＋選章或標題…"]));
  (hb.chapters || []).forEach(function (c) {
    var g = h("optgroup", { label: c.name });
    g.appendChild(h("option", { value: "c:" + c.id }, ["整章：" + c.name]));
    ((hb.titles || {})[c.id] || []).forEach(function (t) { g.appendChild(h("option", { value: "t:" + t.id }, [t.name])); });
    add.appendChild(g);
  });
  add.onchange = function () { if (add.value && b.scope.indexOf(add.value) < 0) { b.scope.push(add.value); set(); qeRender(); } };
  chips.appendChild(add);
  box.appendChild(chips);
  if (!(b.scope || []).length) box.appendChild(hint("沒有範圍＝整本手冊的考試都可能抽到這一題。"));
  box.appendChild(lbl("", "狀態"));
  box.appendChild(qeSeg([["ok", "採用"], ["wait", "待審"], ["off", "停用"]], b.st, function (v) { b.st = v; set(); qeRender(); }));
  var probs = qeCheckB(b);
  if (probs.length) box.appendChild(h("div", { class: "qebox warn" }, [probs.join("　")]));
  var sv = btn("💾 存這一題", function () { qeSaveB(); }, "pri"); sv.id = "qeBSave";
  box.appendChild(h("div", { class: "qeacts" }, [sv, btn("取消", function () { if (QE.bDirty) { modal({ title: "不存這一題？", lines: ["剛剛改的會不見。"], buttons: [{ label: "繼續改", cls: "sm" }, { label: "不存了", cls: "sm bad", fn: function () { QE.b = null; QE.bDirty = false; qeRender(); } }] }); return; } QE.b = null; qeRender(); })]));
  return box;
}
function qeBOut(b) {   // 空的選項拿掉、正確答案跟著換位置
  var opts = [], ans = [];
  if (b.t === "tf") { opts = ["對", "錯"]; ans = b.ans.slice(0, 1); }
  else b.opts.forEach(function (op, k) { var s = String(op || "").replace(/\s+/g, " ").trim(); if (!s) return; if (b.ans.indexOf(k) >= 0) ans.push(opts.length); opts.push(s); });
  return { id: b.id || "", t: b.t, q: String(b.q || "").trim(), opts: opts, ans: b.t === "one" || b.t === "tf" ? ans.slice(0, 1) : ans, ex: String(b.ex || "").trim(), diff: b.diff, scope: (b.scope || []).slice(), st: b.st, by: b.by };
}
function qeCheckB(b) {
  var o = qeBOut(b), out = [];
  if (!o.q) out.push("⚠ 還沒寫題目");
  if (o.opts.length < 2) out.push("⚠ 選項至少要 2 個");
  if (!o.ans.length) out.push("⚠ 還沒勾正確答案");
  return out;
}
function qeSaveB(then) {
  var b = QE.b; if (!b) return;
  var probs = qeCheckB(b);
  if (probs.length) { modal({ title: "還不能存", lines: probs, buttons: [{ label: "好", cls: "sm pri" }] }); return; }
  var sb = $("#qeBSave"); if (sb) { sb.disabled = true; sb.textContent = "儲存中…"; }
  qeCall("bsave", JSON.stringify([qeBOut(b)])).then(function (r) {
    qeBankMerge(r.saved || []);
    QE.b = null; QE.bDirty = false;
    toast("✅ 存好了這一題" + ((r.saved || [])[0] && r.saved[0].st !== "ok" ? "（狀態是「" + QE_BST[r.saved[0].st] + "」：還不會考到）" : ""));
    qeRender();
    if (then) then();
  }, function (e) { var s2 = $("#qeBSave"); if (s2) { s2.disabled = false; s2.textContent = "💾 存這一題"; } toast("❌ 沒有存：" + qeErr(e)); });
}
function qeBankMerge(list) {
  (list || []).forEach(function (b) { var at = -1; QE.bank.forEach(function (x, i) { if (x.id === b.id) at = i; }); if (at >= 0) QE.bank[at] = b; else QE.bank.push(b); });
  if (QE.aiRes) QE.aiRes.list = QE.aiRes.list.map(function (b) { return qeB(b.id) || b; });   // AI 那一頁的清單也換成新的
}
function qeBankSet(items, st) {
  var out = items.map(function (b) { var c = clone(b); c.st = st; return c; });
  qeCall("bsave", JSON.stringify(out)).then(function (r) {
    qeBankMerge(r.saved || []);
    toast((st === "ok" ? "✅ 採用了 " : st === "off" ? "已停用 " : "已改好 ") + (r.saved || []).length + " 題");
    qeRender();
  }, function (e) { toast("❌ " + qeErr(e)); });
}
function qeBankDel(items) {
  var ids = items.map(function (b) { return b.id; });
  qeCall("bdel", JSON.stringify(ids)).then(function (r) {
    QE.bank = QE.bank.filter(function (b) { return ids.indexOf(b.id) < 0; });
    if (QE.aiRes) QE.aiRes.list = QE.aiRes.list.filter(function (b) { return ids.indexOf(b.id) < 0; });
    if (QE.b && ids.indexOf(QE.b.id) >= 0) { QE.b = null; QE.bDirty = false; }
    toast("已刪掉 " + (r.n || ids.length) + " 題");
    qeRender();
  }, function (e) { toast("❌ " + qeErr(e)); });
}

/* ── AI 出題 ── */
function qeAiForm(f) {
  var a = QE.ai;
  f.appendChild(h("h3", { style: "font-size:16px" }, ["✨ AI 出題（Gemini 3.8 Flash）"]));
  f.appendChild(h("div", { class: "qebox" }, [h("p", {}, ["AI 只讀你選的範圍裡的手冊文字（照片裡辨識出來的字也算），一次最多送 3 萬字。送出前，「遮字清單」裡的字會換成「本院」。"]), h("p", {}, ["出好的題目先放在題庫的「待審」：你看過、按「採用」才會被考到。AI 可能出錯，一定要看過。"])]));
  f.appendChild(lbl("一", "範圍（不選＝整本手冊）"));
  f.appendChild(qeScopeEl(a.scope, function () { qeAiChars(); }));
  f.appendChild(h("div", { class: "hint", id: "qeaichars" }, [""]));
  f.appendChild(lbl("二", "難度"));
  f.appendChild(qeSeg(QE_DIFF.map(function (d) { return [d, d]; }), a.diff, function (v) { a.diff = v; qeRender(); }));
  f.appendChild(hint(QE_DIFF_TIP[a.diff]));
  f.appendChild(lbl("三", "出幾題"));
  f.appendChild(h("div", { class: "qerow" }, [qeNum(a.n, "an", 1, 20, function (v) { a.n = v; }), h("span", { class: "muted" }, ["題（一次最多 20 題）"])]));
  f.appendChild(lbl("四", "題型（可以選好幾個）"));
  var tr = h("div", { class: "qechips" });
  [["one", "單選"], ["many", "複選"], ["tf", "是非"]].forEach(function (p) {
    var on = a.types.indexOf(p[0]) >= 0;
    var b = h("button", { type: "button", class: "qechip" + (on ? " on" : ""), "aria-pressed": on ? "true" : "false" }, [(on ? "✓ " : "") + p[1]]);
    b.onclick = function () { var at = a.types.indexOf(p[0]); if (at >= 0) { if (a.types.length === 1) { toast("至少要選一種題型"); return; } a.types.splice(at, 1); } else a.types.push(p[0]); qeRender(); };
    tr.appendChild(b);
  });
  f.appendChild(tr);
  f.appendChild(lbl("五", "給 AI 的要求（可以不寫）"));
  f.appendChild(qeIn(a.hint, "ah", function (v) { a.hint = v; }, { maxlength: "200", placeholder: "例：多出跟冷藏、管制藥品有關的；不要出頁數" }));
  var go = btn(QE.aiBusy ? "AI 出題中…（大約 10～60 秒）" : "✨ 開始出題", qeAiGo, "pri"); go.id = "qeAiGo"; if (QE.aiBusy) go.disabled = true;
  f.appendChild(h("div", { class: "qeacts" }, [go]));
  if (QE.aiRes) {
    var R = QE.aiRes, list = R.list;
    f.appendChild(h("div", { class: "qebox ok" }, ["✅ 出好了 " + list.length + " 題（送出 " + R.chars + " 字" + (R.masked ? "，遮字清單 " + R.masked + " 個字詞都換成「本院」" : "，遮字清單是空的") + "）。都放在題庫的「待審」："]));
    var wait = list.filter(function (b) { return b.st === "wait"; });
    if (wait.length) f.appendChild(h("div", { class: "qerow" }, [btn("✅ 這 " + wait.length + " 題全部採用", function () { qeBankSet(wait, "ok"); }, "pri"), btn("到題庫看", function () { QE.bf = { st: "wait", diff: "", ch: "", by: "ai", q: "", zx: "" }; qeSel("bank"); })]));
    list.forEach(function (b) { f.appendChild(QE.b && QE.b.id === b.id ? qeBEditEl() : qeBItemEl(b)); });
  }
  // 遮字清單
  f.appendChild(h("div", { class: "qeset" }, [
    h("div", { class: "qeset-h" }, ["🙈 遮字清單（送給 AI 之前，換成「本院」）"]),
    hint("一行一個：醫院的名字、簡稱、英文縮寫、院區、人名…（長的先換）。清單加密存在藥戰手冊專案的指令碼屬性，不會出現在試算表。現在 " + QE.mask + " 個。"),
    QE.words === null ? btn("顯示／修改遮字清單", function () {
      qeCall("maskget").then(function (r) { QE.words = (r.words || []).join("\n"); qeRender(); var t = $("#edc2 [data-qk=mask]"); if (t) try { t.focus(); } catch (e) { /* 沒關係 */ } }, function (e) { toast("❌ " + qeErr(e)); });
    }) : h("div", {}, [
      qeTa(QE.words, "mask", function (v) { QE.words = v; }, 6, { placeholder: "一行一個", "aria-label": "遮字清單（一行一個）" }),
      h("div", { class: "qeacts" }, [btn("💾 存遮字清單", function () {
        var words = String(QE.words || "").split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
        qeCall("mask", JSON.stringify(words)).then(function (r) { QE.mask = (r.words || []).length; QE.words = null; toast("✅ 遮字清單存好了（" + QE.mask + " 個）"); qeRender(); }, function (e) { toast("❌ " + qeErr(e)); });
      }, "pri"), btn("收起來", function () { QE.words = null; qeRender(); })])
    ])
  ]));
  setTimeout(qeAiChars, 0);
}
function qeAiChars() {   // 範圍裡大約有多少字（照前端的手冊估；後端會一樣算）
  var el = $("#qeaichars"); if (!el) return;
  var hb = qeHb(), sel = QE.ai.scope, n = 0, nt = 0;
  (hb.chapters || []).forEach(function (c) {
    ((hb.titles || {})[c.id] || []).forEach(function (t) {
      if (sel.length && sel.indexOf("c:" + c.id) < 0 && sel.indexOf("t:" + t.id) < 0) return;
      nt++; n += JSON.stringify(t.blocks || []).length * 0.55 + String(t.note || "").length;
    });
  });
  el.textContent = nt ? "範圍裡有 " + nt + " 個標題（大約 " + Math.round(n / 100) * 100 + " 字" + (n > 30000 ? "，超過 3 萬字：後面的會送不到，範圍選小一點比較好" : "") + "）。" : "⚠ 範圍裡沒有標題。";
}
function qeAiGo() {
  if (QE.aiBusy) return;
  var a = QE.ai;
  QE.aiBusy = true; QE.aiRes = null; qeRender();
  qeCall("ai", JSON.stringify({ scope: a.scope, diff: a.diff, n: a.n, types: a.types, hint: a.hint }), "", 170000).then(function (r) {
    QE.aiBusy = false;
    qeBankMerge(r.list || []);
    QE.aiRes = { list: r.list || [], chars: r.chars || 0, masked: r.masked || 0 };
    toast("✨ AI 出好了 " + QE.aiRes.list.length + " 題（待審）");
    qeRender();
  }, function (e) { QE.aiBusy = false; toast("❌ " + qeErr(e)); qeRender(); });
}

/* ── 結果 ── */
function qeResForm(f) {
  var z = qeZ(QE.sel.id);
  if (!z) { f.appendChild(hint("找不到這一份（可能被刪了）。")); return; }
  f.appendChild(h("div", { class: "qehd" }, [h("h3", { style: "font-size:16px;margin:0" }, ["📊 結果：" + z.title]), h("span", { class: "sp" }), btn("🔄 重新整理", function () { QE.res = null; qeRender(); }), btn("‹ 回到這一份", function () { qeSel("z", z.id); })]));
  if (!QE.res || QE.res.z.id !== z.id) {
    f.appendChild(hint("讀取中…"));
    if (!QE.resBusy) {
      QE.resBusy = true;
      qeCall("res", z.id).then(function (r) { QE.resBusy = false; QE.res = r; qeRender(); }, function (e) { QE.resBusy = false; QE.res = { z: z, err: qeErr(e) }; qeRender(); });
    }
    return;
  }
  var R = QE.res;
  if (R.err) { f.appendChild(h("div", { class: "qebox warn" }, ["⚠ " + R.err])); return; }
  if (!R.n) { f.appendChild(h("div", { class: "qebox" }, ["還沒有人" + (z.kind === "x" ? "考" : "填") + "。" + (z.st !== "open" ? "（狀態是「" + QE_ST[z.st] + "」：藥師看不到）" : "")])); return; }
  var bar = function (label, n, all, cls) { var p = all ? Math.round(n / all * 100) : 0; return h("div", { class: "qebar" + (cls ? " " + cls : "") }, [h("span", { class: "qebl" }, [label]), h("span", { class: "qebt" }, [h("i", { style: "width:" + p + "%" })]), h("span", { class: "qebn" }, [n + "（" + p + "%）"])]); };
  if (z.kind === "q") {
    f.appendChild(h("div", { class: "qebox" }, ["共 " + R.n + " 份" + (z.named ? "（具名）" : "（不記名）") + "。完整的每一份在問卷試算表的「作答」分頁。"]));
    (R.qs || []).forEach(function (s, i) {
      var box = h("div", { class: "qeq" }, [h("div", { class: "qeq-h" }, [h("b", {}, ["第 " + (i + 1) + " 題"]), h("span", { class: "muted" }, [YZ_QZ_T[s.t] + "・" + s.n + " 人回答"])]), h("div", { class: "qebq" }, [s.q])]);
      if (s.t === "one" || s.t === "many") s.opts.forEach(function (op, k) { box.appendChild(bar(YZ_QZ_LET.charAt(k) + ". " + op, s.cnt[k] || 0, s.t === "many" ? R.n : s.n)); });
      if (s.t === "rate") { box.appendChild(h("div", { class: "qeavg" }, ["平均 " + (s.avg === null ? "—" : s.avg) + " 分"])); [5, 4, 3, 2, 1].forEach(function (v) { box.appendChild(bar(v + " 分", s.cnt[v - 1] || 0, s.n)); }); }
      if (s.t === "text") {
        var tl = h("ul", { class: "qetexts" });
        (s.texts || []).slice(0, 100).forEach(function (x) { tl.appendChild(h("li", {}, [x.who ? h("b", {}, [x.who + "："]) : null, x.v])); });
        if (!(s.texts || []).length) tl.appendChild(h("li", { class: "muted" }, ["（沒有人寫）"]));
        box.appendChild(tl);
        if ((s.texts || []).length > 100) box.appendChild(hint("還有 " + (s.texts.length - 100) + " 則：看問卷試算表的「作答」分頁。"));
      }
      f.appendChild(box);
    });
    if (R.who && R.who.length) {
      f.appendChild(lbl("", "誰填了（" + R.who.length + "）"));
      f.appendChild(qeTable(["名字", "員工代號", "時間", "從哪裡"], R.who.map(function (w) { return [w.name || "", w.emp || "", w.at || "", w.from || ""]; })));
    }
    return;
  }
  f.appendChild(h("div", { class: "qegrid sm" }, [
    h("div", { class: "qecard" }, [h("b", {}, [String(R.n)]), h("span", {}, ["次作答"])]),
    h("div", { class: "qecard" }, [h("b", {}, [String((R.people || []).length)]), h("span", {}, ["個人"])]),
    h("div", { class: "qecard" }, [h("b", {}, [R.avg === null ? "—" : R.avg + " 分"]), h("span", {}, ["平均"])]),
    h("div", { class: "qecard" }, [h("b", {}, [R.passRate === null ? "—" : R.passRate + "%"]), h("span", {}, ["及格的人（" + (z.x ? z.x.pass : 60) + " 分及格）"])])
  ]));
  f.appendChild(lbl("", "每個人（最高分排前面）"));
  f.appendChild(qeTable(["名字", "員工代號", "考了幾次", "最高分", "最近一次", "及格", "最近考的時間"], (R.people || []).map(function (p) { return [p.name || "", p.emp || "", String(p.times), p.best === null ? "—" : String(p.best), p.last === null ? "—" : String(p.last), p.pass ? "✅" : "—", p.at || ""]; })));
  f.appendChild(lbl("", "每一題的答對率（最難的排前面；照題庫現在的答案算）"));
  (R.qs || []).forEach(function (s) { f.appendChild(bar(s.q.length > 40 ? s.q.slice(0, 39) + "…" : s.q, s.ok, s.n, s.rate < 50 ? "low" : "")); });
}
function qeTable(head, rows) {
  var t = h("table", { class: "qetbl" }, [h("thead", {}, [h("tr", {}, head.map(function (x) { return h("th", { scope: "col" }, [x]); }))])]), tb = h("tbody");
  rows.forEach(function (r) { tb.appendChild(h("tr", {}, r.map(function (x) { return h("td", {}, [x]); }))); });
  t.appendChild(tb);
  return h("div", { class: "qetblw" }, [t]);
}

/* ── 預覽視窗：網頁（藥師作答的樣子）、LINE 卡片 ── */
function qePreview(body, meter) {
  if (!QE || !QE.loaded || QE.none) { body.appendChild(h("div", { class: "pvempty" }, ["問卷：建好問卷試算表、選左邊的一份，這裡就會顯示藥師看到的樣子。"])); return; }
  var z = QE.sel.k === "z" ? QE.z : null, b = QE.sel.k === "bank" || QE.sel.k === "ai" ? QE.b : null;
  if (!z && !b) { body.appendChild(h("div", { class: "pvempty" }, ["選左邊的一份問卷（或在題庫裡改一題），這裡會顯示藥師看到的樣子。"])); return; }
  var exam = z ? z.kind === "x" : true, pz, qs, note = "";
  if (z) {
    var o = qeZOut(z);
    pz = { id: o.id || "preview", kind: o.kind, title: o.title || "（還沒有標題）", note: o.note, to: o.to ? o.to.replace(/-/g, "/") : "", named: o.named, pass: exam ? z.x.pass : null, retake: exam ? z.x.retake : false };
    if (exam) {
      var pool = qePool(z);
      qs = pool.slice(0, Math.min(3, z.x.n)).map(function (x) { return { id: x.id, t: x.t, q: x.q, opts: x.opts, req: false }; });
      note = pool.length ? "（預覽：從符合的 " + pool.length + " 題裡拿前 " + qs.length + " 題給你看；藥師是隨機抽 " + Math.min(z.x.n, pool.length) + " 題）" : "（題庫裡還沒有符合的題目）";
    } else qs = o.qs.filter(function (q) { return q.q && (q.t === "text" || q.t === "rate" || q.opts.length >= 2); });
  } else {
    var ob = qeBOut(b);
    pz = { id: "preview", kind: "x", title: "（題庫的一題）", note: "", to: "", named: true, pass: 60, retake: true };
    qs = [{ id: "p", t: ob.t, q: ob.q || "（還沒寫題目）", opts: ob.opts.length ? ob.opts : ["（選項）", "（選項）"], req: false }];
  }
  if (ED.view === "line") {
    var st = h("div", { class: "pvstack" }), add = function (label, bubble) {
      st.appendChild(h("div", { class: "qepvl" }, [label]));
      st.appendChild(FlexView.render(bubble, {}));
      meter.appendChild(meterRow(label, _yzBytes_(bubble), YZ_BUBBLE_SAFE));
    };
    if (z) add("藥師打「問卷」看到的清單", _yzQzListBubble_([{ id: pz.id, kind: pz.kind, title: pz.title, note: pz.note, to: pz.to, named: pz.named, n: exam ? z.x.n : qs.length, pass: pz.pass, retake: pz.retake, mine: null }]));
    if (qs.length) add("第 1 題的卡片（按按鈕回答）", _yzQzCard_({ z: pz, qs: qs, a: qs.map(function () { return null; }), i: 0 }));
    if (z) add("「📣 LINE 通知大家」推的卡片", _yzQzPushCard_({ id: pz.id, kind: pz.kind, title: pz.title, note: pz.note, to: pz.to, qs: qs, x: exam ? z.x : null }));
    body.appendChild(h("div", { class: "pvwrap" }, [st]));
    meter.appendChild(hint("LINE 上是一題一張卡片：按按鈕回答（複選可以按好幾個再按「選好了」；簡答直接打字）。最後一張可以看全部的答案、按「送出」或「交卷」。" + note));
    return;
  }
  var box = h("div", { class: "qzpv" }, [qzFormEl(pz, qs, [], { px: "qzp", preview: true })]);
  body.appendChild(h("div", { class: "pvwebwrap" }, [box]));
  meter.appendChild(hint("網頁上是一頁全部的題目，最後按「" + (exam ? "交卷" : "送出") + "」。這裡可以點點看（不會送出）。" + note));
}

/* ════════ admin.js ════════ */
/* ═══════════════ admin.js：管理（開發者）：誰可以看（核可名單）、保密設定、員工名單（第 34 批，roster.js）、看過紀錄、我的裝置（第 34 批追加）、電腦用的入口連結（第 36 批）、匯出給 Copilot（第 37 批，export.js）═══════════════ */
var AD = { users: null, devs: 0, log: null, busy: false, rs: null, rsn: null, dv: null, cards: 0, cardN: 0 };   // 第 42 批：cards＝後端有「收審核卡」的設定；cardN＝收的開發者幾位
function buildAdminPane() {
  AD = { users: null, devs: 0, log: null, busy: false, rs: null, rsn: null, dv: null };
  var pane = $("#pane-admin");
  pane.innerHTML = "";
  pane.appendChild(h("p", { class: "sub" }, ["誰可以看、員工名單、誰看過什麼、保密開關，都在這一頁（只有開發者看得到）。也可以直接在 LINE 的審核卡按「核可」。"]));
  pane.appendChild(h("div", { class: "row" }, [
    h("section", { class: "card adm" }, [h("h2", {}, ["① 誰可以看（核可名單）"]), h("div", { id: "userBox" }, [h("div", { class: "muted" }, ["載入中…"])])]),
    h("section", { class: "card adm" }, [h("h2", {}, ["② 保密設定"]), h("div", { id: "cfgBox" })])
  ]));
  pane.appendChild(h("section", { class: "card adm", style: "margin-top:16px" }, [h("h2", {}, ["③ 員工名單（申請時比對：對得上的自動核可）"]), h("div", { id: "rsBox" }, [h("div", { class: "muted" }, ["載入中…"])])]));   // 第 34 批
  pane.appendChild(h("section", { class: "card adm", style: "margin-top:16px" }, [h("h2", {}, ["④ 看過紀錄（最新的在最上面）"]), h("div", { id: "logBox" }, [h("div", { class: "muted" }, ["載入中…"])])]));
  pane.appendChild(h("section", { class: "card adm", style: "margin-top:16px" }, [h("h2", {}, ["⑤ 🔒 我的裝置（開發者網頁綁定的）"]), h("div", { id: "devBox" }, [h("div", { class: "muted" }, ["載入中…"])])]));   // 第 34 批追加
  pane.appendChild(h("section", { class: "card adm", style: "margin-top:16px" }, [h("h2", {}, ["⑥ 🖥 電腦用的入口連結"]), h("div", { id: "pcBox" })]));   // 第 36 批
  pane.appendChild(h("section", { class: "card adm", style: "margin-top:16px" }, [h("h2", {}, ["⑦ 📤 匯出給 Copilot（SharePoint 用）"]), h("div", { id: "exBox" })]));   // 第 37 批：export.js
}
// 第 36 批：「⑥ 🖥 電腦用的入口連結」：在電腦上打開 → 員工編號＋姓名登入（這台第一次、無痕視窗：再加 LINE 驗證碼）。連結裡沒有任何人的鑰匙
// 第 38 批：連結縮短成「…/hb.html#短碼」。後端位置不再放在連結、也不放在 GitHub：改成加密的 cfg.js（HB_XC），只有短碼解得開。
// 第 42 批：入口連結只有「…/hb.html」（後面不加短碼）。這台第一次用：同事在 LINE 按「🔗 複製連結」拿自己的連結（每個人、每次都不一樣）。
function pcLinkBase() { return location.origin + location.pathname; }
function pcCopyBtn(getText, label) {
  var b = btn(label || "📋 複製", function () {
    var t = getText(), done = function (ok) { b.textContent = ok ? "已複製 ✓" : "複製不了：自己全選複製"; setTimeout(function () { if (b.isConnected) b.textContent = label || "📋 複製"; }, 2200); };
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t).then(function () { done(true); }, function () { done(false); }); return; } } catch (e) { /* 換下面的 */ }
    done(false);
  }, "sm pccopy");
  return b;
}
function drawPcLink() {
  var box = $("#pcBox"); if (!box) return; box.innerHTML = "";
  box.appendChild(h("p", { class: "hint", style: "margin-top:0" }, ["入口連結（給同事）＋一個小檔 cfg.js（放到 GitHub，網站才知道後端在哪）。正在產生…"]));
  if (!(window.crypto && crypto.subtle && typeof crypto.subtle.importKey === "function" && typeof crypto.subtle.deriveKey === "function")) { box.innerHTML = ""; box.appendChild(h("p", { class: "hint" }, ["這裡做不出加密的連結（可能是在對話裡的小框框打開，或瀏覽器太舊）。請把網頁用電腦的 Chrome 或 Safari 從正式網址打開，再到這裡拿短連結。"])); return; }
  call("hbEntry", []).then(function (r) {
    if (!adOk(r)) return;
    if (!r.code || !XRE.test(r.x || X)) { box.innerHTML = ""; box.appendChild(h("p", { class: "hint" }, ["❌ 做不出來：拿不到後端位置。重新整理再試一次。"])); return; }
    var xx = XRE.test(r.x || "") ? r.x : X, k7 = /^[a-z0-9]{7}$/.test(r.code7 || "") ? r.code7 : "";   // 第 43 批：12 碼連結的 7 碼鑰匙（舊的後端沒有）
    Promise.all([scSeal(r.code, xx), k7 ? scSeal(k7, xx) : Promise.resolve("")]).then(function (bs) { pcDraw(box, r, bs[0], bs[1], xx); }, function (e) { box.innerHTML = ""; box.appendChild(h("p", { class: "hint" }, ["❌ 加密沒成功：" + (e && e.message || e) + "。重新整理再試一次。"])); });
  }, function (e) { box.innerHTML = ""; box.appendChild(h("p", { class: "hint" }, ["❌ " + e.message])); });
}
// 第 43 批：看 GitHub 上現在的 cfg.js（不用快取）：解得開 7 碼鑰匙＝新的 → resolve(true)
function pcGhCheck(k7, xx) {
  var u = location.href.split("#")[0].split("?")[0].replace(/[^\/]*$/, "") + "cfg.js?t=" + Date.now();
  return fetch(u, { cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer" }).then(function (res) { return res.ok ? res.text() : ""; }).then(function (txt) {
    var m = /HB_XC7\s*=\s*"([^"]+)"/.exec(txt || "");
    if (!m) return false;
    return scOpen(k7, m[1]).then(function (x) { return x === xx; }, function () { return false; });
  }, function () { return false; });
}
function pcDraw(box, r, blob, blob7, xx) {
  box.innerHTML = "";
  var pcl = +r.pcl || 0, on7 = !!r.on7, k7 = r.code7 || "";
  var url = pcLinkBase();   // 第 42 批：後面不加短碼（短碼只拿來做 cfg.js；同事用 LINE「🔗 複製連結」拿自己的連結）
  var cfg = "// 藥戰手冊：後端位置（加密）。放在 hb.html 同一層。別人看不出位置；換部署再到管理頁「⑥」重做一次。\nwindow.HB_XC = \"" + blob + "\";\n" + (blob7 ? "window.HB_XC7 = \"" + blob7 + "\";   // 第 43 批：12 碼連結用\n" : "");
  // 第 43 批：平常收起來，只露出一行狀態（要動的時候才打開）
  var st = h("p", { class: "pcst" + (on7 || !blob7 ? "" : " warn"), id: "pcst" }, [!blob7 ? "⚠ 後端還是舊的（第 42 批以前）：先把藥戰手冊專案的 02、03 換好、部署新版本，這裡才會出 12 碼連結。" : on7 ? "✅ 正常：GitHub 上的 cfg.js 是新的，同事在 LINE 按「🔗 複製連結」拿到的是 12 碼的短連結。" : "⏳ 要換一次 cfg.js：打開下面的「看入口連結、cfg.js」，下載 cfg.js 傳到 GitHub（同名蓋掉），1～2 分鐘後按「🔄 檢查 GitHub 上的 cfg.js」。換好以前，同事拿到的照舊是 28 碼的連結（照樣打得開）。"]);
  var det = h("details", { class: "pcdet", id: "pcdet" }, [h("summary", {}, ["看入口連結、cfg.js（平常不用動）"])]);
  if (!on7 && blob7) det.open = true;
  box.appendChild(st);
  box.appendChild(det);
  var inp = h("input", { class: "in pcurl", readonly: true, value: url, "aria-label": "電腦用的入口連結", onclick: function () { try { this.select(); } catch (e) { /* 沒關係 */ } } });
  det.appendChild(h("p", { class: "hint", style: "margin-top:8px" }, ["① 入口連結（給同事）：就是「…/hb.html」，後面什麼都不加。存成書籤，或貼在院內網站；用過的電腦打開就是「員工編號＋姓名」的登入畫面。"]));
  det.appendChild(h("div", { class: "pcurlrow" }, [inp, pcCopyBtn(function () { return url; })]));
  det.appendChild(h("p", { class: "hint", style: "margin:4px 0 0" }, ["這台電腦第一次用（或無痕視窗）：在 LINE 的「藥戰手冊」按下面那排的「🔗 複製連結」（電腦版 LINE 打「複製連結」），貼到瀏覽器打開。每個人、每次按的連結都不一樣；打開以後網址列只剩「…/hb.html」。"]));
  if (!pcl) det.appendChild(h("p", { class: "hint", style: "margin:4px 0 0;color:#8A5A00" }, ["⚠ 後端還是舊的（同事的 LINE 還沒有「🔗 複製連結」）：先把藥戰手冊專案的 02、03 換好、部署新版本。"]));
  var ta = h("textarea", { class: "in pccfg", readonly: true, rows: "4", "aria-label": "cfg.js 的內容", onclick: function () { try { this.select(); } catch (e) { /* 沒關係 */ } } });
  ta.value = cfg;
  var dl = btn("⬇️ 下載 cfg.js", function () {
    try { var u = URL.createObjectURL(new Blob([cfg], { type: "text/javascript" })); if (typeof exDownload === "function") exDownload(u, "cfg.js"); else { var a = h("a", { href: u, download: "cfg.js" }); document.body.appendChild(a); a.click(); a.remove(); } setTimeout(function () { URL.revokeObjectURL(u); }, 2000); } catch (e) { toast("下載不了：請全選上面的文字，自己存成 cfg.js"); }
  }, "sm pri");
  det.appendChild(h("p", { class: "hint", style: "margin:12px 0 2px" }, ["② 設定檔 cfg.js：上傳到 GitHub，跟 hb.html 放同一層（同名的蓋掉）。這裡面只有「加密過的後端位置」，別人看不出來。"]));
  det.appendChild(h("div", { class: "pcurlrow" }, [ta, h("div", { style: "display:flex;flex-direction:column;gap:6px" }, [dl, pcCopyBtn(function () { return cfg; }, "📋 複製內容")])]));
  var ckm = h("span", { class: "hint", id: "pcckm", role: "status", "aria-live": "polite" }, [""]);
  var ck = btn("🔄 檢查 GitHub 上的 cfg.js", function () { pcCheck(true); }, "sm");
  if (blob7) det.appendChild(h("div", { class: "pcurlrow" }, [ck, ckm]));
  det.appendChild(h("ul", { class: "hint", style: "margin:10px 0 0;padding-left:1.2em" }, [
    h("li", {}, ["入口連結裡沒有後端位置、沒有短碼、也沒有任何人的鑰匙：光有連結看不到內容。同事自己的連結 10 分鐘內第一次登入不用驗證碼；其他時候，每次登入都要用手機 LINE 傳「登入」拿 6 位數驗證碼（第 43 批起不記住電腦）。"]),
    h("li", {}, ["後端位置放在 cfg.js、而且是加密的：在 GitHub 上看不到位置。解開用的鑰匙不給任何人看，只遮過藏在每個人自己的連結裡（每條都不一樣）。換部署（位置變了）只要回來這裡，重做一次 cfg.js 傳上去。"]),
    h("li", {}, ["第 43 批：自己的連結縮短成 12 碼（每個人、每 2 分鐘都不一樣）。cfg.js 要換一次新的（多一把 7 碼鑰匙）；換好、按了「檢查」，同事拿到的才會變 12 碼。以前拿的 28 碼連結 10 分鐘內照樣打得開。"]),
    h("li", {}, ["以前給過同事的「…/hb.html#12 碼」固定短連結停用了：用過的電腦照常打開（網址列會自己變成 …/hb.html）；沒用過的電腦會請他到 LINE 按「🔗 複製連結」。"]),
    h("li", {}, ["第 43 批起沒有「記住這台電腦」了：以前記住的電腦都忘掉，每次登入都要驗證（共用電腦也安全）。同一個員工編號＋姓名核可了兩個 LINE 帳號的，哪一個都可以傳「登入」拿驗證碼。"])]));
  var pcCheck = function (say) {   // 看 GitHub 上的 cfg.js：新的＝告訴後端（開始給 12 碼）；已經開著卻變回舊的＝告訴後端先改回 28 碼
    if (!k7 || !blob7) return;
    ck.disabled = true; ckm.textContent = say ? "檢查中…" : "";
    pcGhCheck(k7, xx).then(function (good) {
      ck.disabled = false;
      if (good === on7) { if (say) { ckm.textContent = good ? "✅ GitHub 上的 cfg.js 是新的" : "❌ GitHub 上的還是舊的 cfg.js（或還沒更新好）：確定傳上去了，等 1～2 分鐘再按一次。"; } return; }
      call("hbEntry", [good ? 1 : -1]).then(function (r2) {
        if (!adOk(r2)) return;
        toast(good ? "✅ cfg.js 換好了：同事在 LINE 拿到的連結從現在起是 12 碼" : "⚠ GitHub 上的 cfg.js 變回舊的了：同事拿到的連結先改回 28 碼（照樣打得開）");
        drawPcLink();
      }, function (e) { ckm.textContent = "❌ " + e.message; });
    });
  };
  if (blob7) pcCheck(false);   // 打開管理頁時自己看一次（不出聲）
}
function adminLoad() {
  drawSettings();
  drawPcLink();   // 第 36 批
  if (typeof drawExport === "function") drawExport();   // 第 37 批
  call("hbUsers", []).then(function (r) { if (!adOk(r)) return; AD.users = r.users || []; AD.devs = r.devs || 0; AD.dmax = r.dmax || 10; AD.rsn = r.rs || null; adCardsOf(r); drawUsers(); }, function (e) { var b = $("#userBox"); if (b) b.textContent = "❌ " + e.message; });
  rsLoad();
  devLoad();
  call("hbLog", [300]).then(function (r) { if (!adOk(r)) return; AD.log = r.rows || []; drawLog(); }, function (e) { var b = $("#logBox"); if (b) b.textContent = "❌ " + e.message; });
}
function adOk(r) {
  if (!r) { toast("❌ 後端沒有回應"); return false; }
  if (r.st === "lock") { logout("expired"); return false; }
  if (r.err) { toast("❌ " + r.err); return false; }
  return MAIN;
}
var ST_TXT = { ok: ["ok", "已核可"], wait: ["wait", "等審核"], no: ["no", "已拒絕"], off: ["gray", "已撤銷"], dev: ["ok", "開發者"] };
function drawUsers() {
  var box = $("#userBox"); if (!box) return; box.innerHTML = "";
  var rows = (AD.users || []).slice().sort(function (a, b) { var o = { wait: 0, ok: 1, dev: 2, off: 3, no: 4 }; return (o[a.st] - o[b.st]) || String(b.at).localeCompare(String(a.at)); });
  var nOk = rows.filter(function (u) { return u.st === "ok"; }).length, nW = rows.filter(function (u) { return u.st === "wait"; }).length;
  var nDevRow = rows.filter(function (u) { return u.st === "dev"; }).length, nOff = Math.max(0, (AD.devs || 0) - nDevRow);   // 第 34 批追加：不在名單上的開發者（只能改 DEV_USERS）
  // 第 33 批：「🧹 清空」＝名單上除了開發者全部刪掉（開發者照舊）
  var nDel = rows.filter(function (u) { return u.st !== "dev"; }).length, clr = btn("🧹 清空", adClear, "sm bad adclr");
  if (!nDel) { clr.disabled = true; clr.title = "名單上沒有可以清的人（開發者不會清）"; }
  box.appendChild(h("div", { style: "display:flex;gap:10px;align-items:flex-start;flex-wrap:wrap;margin-bottom:6px" }, [
    h("div", { class: "hint", style: "flex:1 1 240px;min-width:0;margin:0" }, ["核可 " + nOk + " 人、等審核 " + nW + " 人；開發者 " + AD.devs + " 位（固定可以看；已核可的人可以按「👑 設為開發者」，開發者那一列可以「取消開發者」）" + (nOff ? "，其中 " + nOff + " 位不在名單上（要取消，改藥戰手冊專案的指令碼屬性 DEV_USERS）" : "") + "。撤銷、拒絕＝從名單刪掉，要再看得重新申請。" +
      (AD.cards ? "審核卡（有人申請、對不上員工名單）：LINE 只送給「📩 收審核卡」的開發者（現在 " + AD.cardN + " 位）；開發者那一列按一下可以切換。" : "")]),
    clr]));
  // 第 34 批：等審核的人裡，跟員工名單對得上的 → 一次核可
  var nMatch = rows.filter(function (u) { return u.st === "wait" && (u.ck === "ok" || u.ck === "near"); }).length;
  if (nMatch) box.appendChild(h("div", { class: "acts", style: "margin:2px 0 8px" }, [btn("✅ 核可對得上員工名單的 " + nMatch + " 人", function (e) { adAuto(e.target, nMatch); }, "sm pri adauto")]));
  if (!rows.length) { box.appendChild(h("div", { class: "muted", style: "padding:8px 0" }, ["還沒有人申請。同事在 LINE 的「藥戰手冊」打員工編號＋姓名（或在手冊網頁填），對不上員工名單的會出現在這裡等你核可。"])); return; }
  // 第 33 批：手機（窄）＝一個人一塊（按鍵不用左右滑就看得到）；電腦（寬）＝照舊一張表
  var narrow = (box.clientWidth || window.innerWidth) < 560;
  var tb = narrow ? h("div", { class: "ulist" }) : h("table", { class: "tbl" });
  if (!narrow) tb.appendChild(h("tr", {}, ["名字", "員工代號", "狀態", "申請時間", "處理", "動作"].map(function (x) { return h("th", {}, [x]); })));
  rows.forEach(function (u) {
    var acts = [], set = function (act, label) { return btn(label, function (e) { adSet(u, act, e.target); }, act === "off" || act === "no" ? "sm bad" : act === "ok" ? "sm pri" : "sm"); };
    // 第 34 批追加：「👑 設為開發者」（已核可的人）、「取消開發者」（不能取消自己；只剩一位開發者時不能按）
    var dv = function (on, label) { return btn(label, function (e) { adDev(u, on, e.target); }, on ? "sm addev" : "sm adundev"); };
    if (u.st === "dev") {
      if (u.me) acts.push(h("span", { class: "muted" }, ["你自己（固定可以看）"]));
      else { var ub = dv(false, "取消開發者"); if ((AD.devs || 0) <= 1) { ub.disabled = true; ub.title = "至少要留一位開發者"; } acts.push(ub); }
      if (AD.cards) {   // 第 42 批：這位開發者的 LINE 收不收審核卡（按一下切換）
        var cb = btn(u.nc ? "🔕 不收審核卡" : "📩 收審核卡", function (e) { adCard(u, !!u.nc, e.target); }, "sm adcard" + (u.nc ? " off" : " on"));
        cb.title = u.nc ? "現在：這位開發者的 LINE 不收審核卡。按一下＝改成收" : "現在：有人申請（對不上員工名單）時，這位開發者的 LINE 會收到審核卡。按一下＝改成不收";
        cb.setAttribute("aria-pressed", u.nc ? "false" : "true");
        if (!u.nc && (AD.cardN || 0) <= 1) { cb.disabled = true; cb.title = "至少要留一位開發者收審核卡（不然新的申請沒人知道）"; }
        acts.push(cb);
      }
    }
    else if (u.st === "wait") { acts.push(set("ok", "核可")); acts.push(set("no", "拒絕")); }
    else if (u.st === "ok") { acts.push(set("off", "撤銷")); var mb = dv(true, "👑 設為開發者"); if ((AD.devs || 0) >= (AD.dmax || 10)) { mb.disabled = true; mb.title = "開發者最多 " + (AD.dmax || 10) + " 位"; } acts.push(mb); }
    else acts.push(set("ok", "重新核可"));
    var nm = (u.name || "（沒填）") + (u.lname ? "（LINE：" + u.lname + "）" : "");
    var stt = ST_TXT[u.st] || ST_TXT.wait, done = u.done ? u.done + (u.by ? "　" + u.by : "") : "";
    var rmk = adRmk(u);   // 第 34 批：跟員工名單比的結果
    if (narrow) {
      tb.appendChild(h("div", { class: "urow", style: "display:flex;gap:8px 10px;align-items:center;flex-wrap:wrap;padding:10px 2px;border-bottom:1px solid #E5E9EE" }, [
        h("div", { style: "flex:1 1 180px;min-width:0" }, [
          h("div", {}, [h("b", {}, [nm]), "　" + (u.emp || "—") + "　", h("span", { class: "st " + stt[0] }, [stt[1]])]),
          rmk,
          h("div", { class: "muted", style: "font-size:12.5px;margin-top:2px" }, ["申請 " + (u.at || "—") + (done ? "｜處理 " + done : "")])]),
        h("div", { class: "acts" }, acts)]));
    } else tb.appendChild(h("tr", {}, [h("td", {}, [nm, rmk]), h("td", {}, [u.emp || "—"]), h("td", {}, [h("span", { class: "st " + stt[0] }, [stt[1]])]), h("td", { class: "muted" }, [u.at || ""]), h("td", { class: "muted" }, [done]), h("td", {}, [h("div", { class: "acts" }, acts)])]));
  });
  box.appendChild(narrow ? tb : h("div", { class: "tscroll" }, [tb]));
}
// 第 34 批：這個人跟員工名單比的結果（一小行字；沒有員工名單＝不顯示）
function adRmk(u) {
  if (u.st === "dev" || !u.ck) return null;
  var ok = u.ck === "ok" || u.ck === "near", t = "", cls = "rmk";
  if (u.st === "wait") { t = ok ? "✅ 對得上員工名單" + (u.ck === "near" ? "（姓名差一個字）" : "") : "⚠ " + (u.cw || u.rm || "跟員工名單對不上"); cls += ok ? " good" : " warn"; }
  else if (u.st === "ok") {
    if (ok) return u.by === "（員工名單自動核可）" ? h("div", { class: "rmk muted" }, ["員工名單自動核可"]) : null;
    t = u.ck === "none" ? "⚠ 員工名單上沒有這個人（離職了？）" : u.ck === "used" ? "⚠ " + (u.cw || "員工編號跟別人重複") : "⚠ 跟員工名單對不上：" + (u.cw || "");
    cls += " warn";
  }
  return t ? h("div", { class: cls, style: "font-size:12.5px;margin-top:2px;color:" + (/ good/.test(cls) ? "#0E7C66" : "#8A5A00") }, [t]) : null;
}
function adAuto(el, n) {
  if (AD.busy) return;
  modal({ title: "核可對得上員工名單的 " + n + " 人？", lines: ["等審核的人裡，員工編號、姓名跟員工名單對得上的（姓名差一個字也算），一次核可。每個人的 LINE 都會收到通知。", "對不上的不動，照樣等你看。"], buttons: [{ label: "不要", cls: "sm" }, { label: "核可 " + n + " 人", cls: "sm pri", fn: function () {
    AD.busy = true; if (el) el.disabled = true;
    call("hbUserAuto", []).then(function (r) {
      AD.busy = false;
      if (!adOk(r)) { if (el) el.disabled = false; return; }
      AD.users = r.users || AD.users; AD.devs = r.devs || AD.devs; adCardsOf(r); drawUsers();
      toast("✅ 核可了 " + (r.auto || 0) + " 人（已通知他們的 LINE）");
    }, function (e) { AD.busy = false; if (el) el.disabled = false; toast("❌ " + e.message); });
  } }] });
}
function adSet(u, act, el) {
  if (AD.busy) return;
  var go = function () {
    AD.busy = true; if (el) el.disabled = true;
    call("hbUserSet", [u.uid, act]).then(function (r) {
      AD.busy = false;
      if (!adOk(r)) { if (el) el.disabled = false; return; }
      AD.users = r.users || AD.users; AD.devs = r.devs || AD.devs; adCardsOf(r); drawUsers();
      toast(act === "ok" ? "✅ 已核可（已通知對方的 LINE）" : act === "off" ? "已撤銷：從名單刪掉了（要再看得重新申請）" : "已拒絕：從名單刪掉了（不會通知對方；他要的話可以重新申請）");
    }, function (e) { AD.busy = false; if (el) el.disabled = false; toast("❌ " + e.message); });
  };
  var who = "「" + (u.name || u.lname || u.emp || "這位") + "」";
  // 第 33 批：撤銷、拒絕＝從名單刪掉（跟沒申請過一樣），刪了就救不回來 → 都先問一次（手機上「核可」「拒絕」很近，按錯也有機會反悔）
  if (act === "off") modal({ title: "撤銷" + who + "？", lines: ["撤銷＝從名單刪掉（跟沒申請過一樣）。對方的 LINE 和網頁馬上看不到藥戰手冊（正在看的也會被請出去）。", "要再看，他得重新申請（打員工編號＋姓名），你核可了才看得到。", "之前送出去的 LINE 卡片會留在他的聊天室裡（機器人收不回來），按了也看不到內容。"], buttons: [{ label: "不要", cls: "sm" }, { label: "撤銷", cls: "sm bad", fn: go }] });
  else if (act === "no") modal({ title: "拒絕" + who + "？", lines: ["拒絕＝從名單刪掉（不會通知對方）。", "他要的話可以重新申請，你會再收到審核卡。"], buttons: [{ label: "不要", cls: "sm" }, { label: "拒絕", cls: "sm bad", fn: go }] });
  else go();
}
// 第 42 批：「📩 收審核卡／🔕 不收審核卡」（每位開發者；不用先問：隨時可以改回來）
function adCardsOf(r) { if (!r || !r.users) return; AD.cards = r.cards ? 1 : 0; AD.cardN = r.cardN !== undefined ? r.cardN : AD.cardN; }   // 回來的有整份名單才算
function adCard(u, on, el) {
  if (AD.busy) return;
  AD.busy = true; if (el) el.disabled = true;
  var who = "「" + (u.name || u.lname || u.emp || "這位") + "」";
  call("hbDevCard", [u.uid, on ? 1 : 0]).then(function (r) {
    AD.busy = false;
    if (!adOk(r)) { if (el) el.disabled = false; return; }
    AD.users = r.users || AD.users; AD.devs = r.devs || AD.devs; adCardsOf(r); drawUsers();
    toast(r.same ? "沒有變（本來就是這樣）" : on ? "📩 " + who + "的 LINE 會收到審核卡" : "🔕 " + who + "的 LINE 不收審核卡了（申請照樣出現在這一頁）");
  }, function (e) { AD.busy = false; if (el) el.disabled = false; toast("❌ " + e.message); });
}
// 第 34 批追加：「👑 設為開發者」「取消開發者」（只管藥戰手冊；先問一次，寫清楚開發者能做什麼）
function adDev(u, on, el) {
  if (AD.busy) return;
  var who = "「" + (u.name || u.lname || u.emp || "這位") + "」";
  var go = function () {
    AD.busy = true; if (el) el.disabled = true;
    call("hbDevSet", [u.uid, on ? 1 : 0]).then(function (r) {
      AD.busy = false;
      if (!adOk(r)) { if (el) el.disabled = false; return; }
      AD.users = r.users || AD.users; AD.devs = r.devs || AD.devs; adCardsOf(r); drawUsers();
      toast(r.same ? (on ? "他本來就是開發者" : "他本來就不是開發者") : on ? "👑 已設為開發者（已通知他的 LINE）" : "已取消開發者（他還是可以看手冊；已通知他的 LINE）");
    }, function (e) { AD.busy = false; if (el) el.disabled = false; toast("❌ " + e.message); });
  };
  if (on) modal({ title: "把" + who + "設為開發者？", lines: [
    "開發者可以：核可、撤銷同事，改手冊內容，匯入員工名單（有個人資料），改設定，用 AI 出題。請只給信得過的同事。",
    "他的 LINE 會收到通知；要用開發者網頁，他在「藥戰手冊」打「開發者網頁」，再綁定自己的裝置。",
    "只管藥戰手冊：補藥神器的開發者不會變。其他開發者也會收到一則通知。",
    AD.cards ? "之後有人申請（對不上員工名單），他的 LINE 也會收到審核卡；不要的話，在他那一列按「📩 收審核卡」改成不收。" : ""   // 第 42 批
  ].filter(Boolean), buttons: [{ label: "不要", cls: "sm" }, { label: "👑 設為開發者", cls: "sm pri", fn: go }] });
  else modal({ title: "取消" + who + "的開發者？", lines: [
    "取消以後他還是「已核可」，一樣看得到手冊；要讓他看不到，再按「撤銷」。",
    "他的開發者網頁連結馬上停用，也不會再收到審核卡。他的 LINE 會收到通知。"
  ], buttons: [{ label: "不要", cls: "sm" }, { label: "取消開發者", cls: "sm bad", fn: go }] });
}
// 第 33 批：「🧹 清空」：名單上除了開發者全部刪掉（先問一次，寫清楚幾個人）
function adClear() {
  if (AD.busy) return;
  var rows = (AD.users || []).filter(function (u) { return u.st !== "dev"; });
  if (!rows.length) { toast("名單上沒有可以清的人（開發者不會清）"); return; }
  var nOk = rows.filter(function (u) { return u.st === "ok"; }).length, nW = rows.filter(function (u) { return u.st === "wait"; }).length;
  modal({ title: "清空核可名單？", lines: [
    "名單上 " + rows.length + " 個人（核可 " + nOk + "、等審核 " + nW + "）全部刪掉，刪了就救不回來。",
    "開發者不會刪：開發者固定可以看。",
    "刪掉的人 LINE 和網頁馬上看不到藥戰手冊（正在看的也會被請出去）；要再看得重新申請（打員工編號＋姓名），你核可了才看得到。"
  ], buttons: [{ label: "不要", cls: "sm" }, { label: "🧹 清空（" + rows.length + " 人）", cls: "sm bad", fn: function () {
    AD.busy = true;
    call("hbUserClear", []).then(function (r) {
      AD.busy = false;
      if (!adOk(r)) return;
      AD.users = r.users || AD.users; AD.devs = r.devs || AD.devs; adCardsOf(r); drawUsers();
      toast("🧹 清空了：刪掉 " + (r.cleared || 0) + " 個人（開發者不動）");
    }, function (e) { AD.busy = false; toast("❌ " + e.message); });
  } }] });
}
// 第 34 批追加：「⑤ 🔒 我的裝置」：開發者網頁綁了哪幾台（最多 3 台）；可以刪掉一台（那台馬上不能用開發者網頁）
function devLoad() {
  call("hbDevices", [DEVLAB]).then(function (r) { if (!adOk(r)) return; AD.dv = r; drawDevices(); }, function (e) { var b = $("#devBox"); if (b) b.textContent = "❌ " + e.message; });
}
function drawDevices() {
  var box = $("#devBox"); if (!box) return; box.innerHTML = "";
  var r = AD.dv || {}, max = r.max || 3, list = (r.list || []).slice().sort(function (a, b) { return (b.me - a.me) || ((b.u || 0) - (a.u || 0)); });
  box.appendChild(h("div", { class: "hint" }, ["開發者網頁最多綁 " + max + " 台，現在綁了 " + list.length + " 台。刪掉的那台馬上不能用開發者網頁（要再用，得重新綁定）。"]));
  var lst = h("div", { class: "dvlist" });
  list.forEach(function (d) { lst.appendChild(devRow(d, [btn("刪除", function (e) { devDel(d, e.target); }, "sm bad dvdel")])); });
  if (!list.length) lst.appendChild(h("div", { class: "muted" }, ["還沒有綁定的裝置。"]));
  box.appendChild(lst);
  box.appendChild(h("div", { class: "hint" }, ["換新手機、換電腦：在新的那台綁定（或用開發者代號登入）時，滿 " + max + " 台會讓你選一台換掉。全部清掉、連結也換新的：LINE 打「開發者網頁 重發」。「最後用」大約半小時記一次。"]));
}
function devDel(d, el) {
  if (AD.busy) return;
  var nm = devName(d), dirty = d.me && typeof ED !== "undefined" && ED && ED.dirty;
  var go = function () {
    AD.busy = true; if (el) el.disabled = true;
    call("hbDeviceDel", [d.id]).then(function (r) {
      AD.busy = false;
      if (r && r.ok && r.me) { stop("這台已經從開發者網頁刪掉了。要再用：在 LINE 的「藥戰手冊」打「開發者網頁 綁定」，把 6 位數碼打在下面。", "bind", 1); return; }
      if (r && r.list) { AD.dv = r; drawDevices(); }
      if (!adOk(r)) { if (el) el.disabled = false; return; }
      toast("已刪掉「" + nm + "」：那台馬上不能用開發者網頁");
    }, function (e) { AD.busy = false; if (el) el.disabled = false; toast("❌ " + e.message); });
  };
  modal({ title: (d.me ? "刪掉正在用的這台？" : "刪掉「" + nm + "」？"), lines: d.me ? [
    "這是你現在用的這台（" + nm + "）。刪掉以後，這台馬上不能用開發者網頁；要再用，得重新綁定（LINE 打「開發者網頁 綁定」）。",
    dirty ? "⚠ 編輯器有還沒存的修改，刪掉以後會不見：先按「儲存」再刪。" : "用公用電腦、別人的電腦時，用完可以這樣刪掉。"
  ] : [
    "刪掉以後，那台馬上不能用開發者網頁（那台要再用，得重新綁定）。",
    "手機掉了、換了電腦、不知道是哪一台：都可以刪。"
  ], buttons: [{ label: "不要", cls: "sm" }, { label: "刪掉", cls: "sm bad", fn: go }] });
}
function drawLog() {
  var box = $("#logBox"); if (!box) return; box.innerHTML = "";
  if (CFG && CFG.viewLog === false) box.appendChild(h("div", { class: "hint" }, ["「看過紀錄」目前是關的：不再新增紀錄（舊的會保留）。"]));
  var rows = AD.log || [];
  if (!rows.length) { box.appendChild(h("div", { class: "muted" }, ["還沒有紀錄。"])); return; }
  var tb = h("table", { class: "tbl" });
  tb.appendChild(h("tr", {}, ["時間", "名字", "員工代號", "從哪裡", "做了什麼", "哪一個"].map(function (x) { return h("th", {}, [x]); })));
  rows.forEach(function (r) { tb.appendChild(h("tr", {}, [h("td", { class: "muted nowrap" }, [r[0]]), h("td", {}, [r[2] || "…" + String(r[1] || "").slice(-4)]), h("td", {}, [r[3]]), h("td", {}, [r[4]]), h("td", {}, [r[5]]), h("td", {}, [r[6]])])); });
  box.appendChild(h("div", { class: "tscroll logscroll" }, [tb]));
  box.appendChild(h("div", { class: "hint" }, ["只記「誰、何時、從 LINE 或網頁、看了哪一章／哪個標題」。不記內容，也不記搜尋的字。超過 6000 筆會自動刪掉最舊的。"]));
}
function settingRow(title, desc, ctl) {
  return h("div", { class: "srow" }, [h("div", { style: "flex:1;min-width:0" }, [h("div", { style: "font-weight:700" }, [title]), h("div", { class: "muted", style: "font-size:12.5px" }, [desc])]), ctl]);
}
function tog(on, fn, label) { var b = h("button", { class: "tog" + (on ? " on" : ""), type: "button", role: "switch", "aria-checked": on ? "true" : "false", "aria-label": label }); b.onclick = function () { fn(!on, b); }; return b; }
function drawSettings() {
  var box = $("#cfgBox"); if (!box || !CFG) return; box.innerHTML = "";
  var c = CFG;
  function save(patch, el) {
    if (el) el.disabled = true;
    call("hbCfg", [JSON.stringify(patch)]).then(function (r) {
      if (el) el.disabled = false;
      if (!adOk(r) || !r.ok) { drawSettings(); return; }
      CFG = Object.assign({}, CFG, r.cfg); applyCfg(); drawSettings(); paintWm();
      if (!$("#wm") && CFG.watermark !== false) { $("#app").appendChild(h("div", { class: "wm", id: "wm", "aria-hidden": "true" })); paintWm(); }
      if ($("#wm") && CFG.watermark === false) $("#wm").remove();
      toast("✅ 設定存好了（LINE 和網頁都會用新的設定）");
    }, function (e) { if (el) el.disabled = false; toast("❌ " + e.message); drawSettings(); });
  }
  function row(k, title, desc) { box.appendChild(settingRow(title, desc, tog(c[k] !== false, function (v, el) { var p = {}; p[k] = v; if (k === "empReview" && !v) { modal({ title: "關掉「員工編號＋核可」？", lines: ["關掉以後，只要加了「藥戰手冊」LINE 帳號的人（不用申請、不用核可）都看得到藥戰手冊。保密會大幅降低。"], buttons: [{ label: "不要", cls: "sm" }, { label: "關掉", cls: "sm bad", fn: function () { save(p, el); } }] }); return; } save(p, el); }, title))); }
  row("empReview", "需要員工編號＋核可", "員工編號＋姓名對得上員工名單的自動核可，對不上的你來核可。關掉＝加了藥戰手冊 LINE 帳號的人都看得到（不建議）");
  // 第 32 批：網頁登入＝代號＋驗證碼；員工編號＋姓名：預設只有第一次（申請）打
  box.appendChild(settingRow("網頁每次登入都要打員工編號＋姓名", "關著（預設）＝只有第一次（申請）時打，之後登入只要代號＋驗證碼。打開＝每次登入都要打，而且要跟名單上的一樣", tog(!!c.idEvery, function (v, el) { save({ idEvery: v }, el); }, "網頁每次登入都要打員工編號＋姓名")));
  row("showAll", "還沒核可的人也看得到申請的說明", "開著：沒核可的人跟藥戰手冊帳號說話，會收到申請的說明（直接打員工編號＋姓名）；補藥神器下面那排大家都有「📘 藥戰手冊」（加入的按鈕）。關掉：沒核可的人只看到「限核可的同仁使用」（打「手冊申請」才有說明）；補藥神器那排只有核可的人看得到 📘");
  var idle = h("input", { class: "in", type: "number", min: "5", max: "240", value: String(c.idle || 30), style: "width:80px", "aria-label": "閒置幾分鐘自動退出" });
  idle.onchange = function () { var v = Math.max(5, Math.min(240, parseInt(idle.value, 10) || 30)); idle.value = String(v); save({ idle: v }, idle); };
  box.appendChild(settingRow("閒置自動退出（分鐘）", "網頁：閒置這麼久自動登出、要再驗證。LINE：改到一半的字、作答到一半的問卷，閒置這麼久就取消（5～240）", h("div", { class: "sw2" }, [idle, h("span", { class: "muted" }, ["分鐘"])])));
  // 第 31 批：舊版本留幾天（過了自動丟到雲端硬碟的垃圾桶；最新 3 份一定留）；0＝不自動清（只留最新 50 份）
  var vdv = c.verDays === undefined ? 3 : +c.verDays || 0;
  var vd = h("input", { class: "in", type: "number", min: "0", max: "30", value: String(vdv), style: "width:80px", "aria-label": "舊版本留幾天" });
  vd.onchange = function () { var v = parseInt(vd.value, 10); v = isNaN(v) ? 3 : Math.max(0, Math.min(30, v)); vd.value = String(v); save({ verDays: v }, vd); };
  box.appendChild(settingRow("編輯器的「🕘 舊版本」留幾天", "過了就自動丟到雲端硬碟的垃圾桶（30 天內救得回來）；最新 3 份一定留。每次存檔、每天第一次打開編輯器時清。0＝不自動清（只留最新 50 份）。沒在用的舊圖（換掉的目錄圖、重做過的章元背景）也是每天第一次打開編輯器時清", h("div", { class: "sw2" }, [vd, h("span", { class: "muted" }, ["天"])])));
  row("watermark", "網頁浮水印", "網頁每一頁蓋「姓名＋員工代號＋時間」");
  // 第 43 批：浮水印濃淡（預設「淡」；第 41 批的濃度＝「中」）
  var wl = h("select", { class: "in", id: "wmlv", "aria-label": "浮水印濃淡", style: "width:auto" }, [["1", "很淡"], ["2", "淡（預設）"], ["3", "中（第 41 批的濃度）"], ["4", "濃"]].map(function (o) { return h("option", { value: o[0] }, [o[1]]); }));
  wl.value = String(c.wmLv >= 1 && c.wmLv <= 4 ? c.wmLv : 2); wl.disabled = c.watermark === false;
  wl.onchange = function () { save({ wmLv: parseInt(wl.value, 10) || 2 }, wl); };
  box.appendChild(settingRow("浮水印濃淡", "越淡越不擋字、越濃拍照越看得出是誰。開發者在「✏️ 編輯」「👥 管理」時會再淡一點", wl));
  row("viewLog", "看過紀錄", "記誰、何時、看哪一章／哪個標題（不記內容）");
  row("footer", "固定頁尾「內部資料，請勿外傳」", "LINE 每張卡片和網頁最下面都放這一行");
  row("imgDirect", "圖片直接顯示在 LINE 卡片上", "關掉＝LINE 卡片上的圖片、目錄圖改成按鈕，要登入網頁才看得到");
  row("animDirect", "動畫直接在 LINE 卡片上播放", "關掉＝只顯示第一格＋「▶ 在網頁看動畫」按鈕");
  row("webAnimAuto", "網頁動畫自動播放", "關掉＝一律先停住，按「▶ 播放」才動（手機開了「減少動態效果」的人，一律先停住）");
  row("lineSwipe", "LINE：好幾張卡片預設「左右滑」", "一個標題有 2 張以上卡片時，預設合成一則左右滑（關掉＝一頁一頁往下排）。每個標題可以在編輯器「📱 LINE：好幾張卡片怎麼排」自己選，自己選的優先");
}

/* ════════ roster.js ════════ */
/* ═══════════════ roster.js：管理頁「③ 員工名單」（第 34 批）═══════════════
 * 開發者上傳 Excel（.xlsx）、CSV，或直接貼上（從 Excel 複製、或一行「E10107 王小明」）→ 先在這台電腦裡讀出來給你看（不送任何地方）→
 * 按「匯入」才送到藥戰手冊的後端，寫進手冊試算表的「員工名單」分頁。同事申請時打的員工編號＋姓名跟這份對得上，就自動核可。
 * Excel 在瀏覽器裡自己解開（.xlsx 其實是一個壓縮檔，裡面是 XML）；CSV 自動認 UTF-8 或 Big5（Excel 存的中文 CSV 常是 Big5）。 */
var RS = { prev: null, mode: "replace", listOn: false, q: "", addOn: false };
var RS_EMP = /員工(編號|代號|號碼)|員編|工號|職員編號|人員代號|^編號$|^代號$|^id$|^emp/i, RS_NAME = /姓名|名字|^名稱$|^name$|中文名/i, RS_MEMO = /備註|部門|單位|職稱|科別|組別|^dept|^note/i;
function rsEmp(v) { var e = String(v === null || v === undefined ? "" : v).replace(/[Ａ-Ｚａ-ｚ０-９－]/g, function (ch) { return String.fromCharCode(ch.charCodeAt(0) - 65248); }).replace(/\s+/g, "").toUpperCase().replace(/^(\d+)\.0+$/, "$1"); return /^[A-Z0-9-]{2,20}$/.test(e) ? e : ""; }
function rsName(v) { var n = String(v === null || v === undefined ? "" : v).replace(/[<>]/g, "").replace(/\s+/g, " ").trim(); return n && n.length <= 20 ? n : ""; }
function rsKey(e) { return /^\d+$/.test(e) ? e.replace(/^0+(?=\d)/, "") : e; }
function rsLoad() {
  call("hbRoster", ["get"]).then(function (r) { if (!adOk(r)) return; AD.rs = r; drawRoster(); }, function (e) { var b = $("#rsBox"); if (b) b.textContent = "❌ " + e.message; });
}
function rsMsg(t) { var m = $("#rsMsg"); if (m) m.textContent = t || ""; }
function drawRoster() {
  var box = $("#rsBox"); if (!box) return; box.innerHTML = "";
  var rs = AD.rs || { n: 0, rows: [] }, meta = rs.meta || {};
  box.appendChild(h("div", { class: "hint", style: "margin:0 0 8px" }, [rs.n ? "名單上 " + rs.n + " 人" + (meta.at && (meta.n === undefined || meta.n === rs.n) ? "（" + meta.at + (meta.by ? "　" + meta.by : "") + " " + (meta.how || "匯入") + "）" : "") + "。同事申請時打的員工編號＋姓名跟這份對得上，就自動核可（姓名差一個字也算；一個員工編號只給一個 LINE 帳號）。對不上的照樣交給你審核。"
    : "還沒匯入。匯入以後，同事申請時打的員工編號＋姓名跟這份對得上，就自動核可，不用你一個一個按。也可以按「＋ 新增一位」自己打。"]));
  var file = h("input", { type: "file", accept: ".xlsx,.csv,.txt,text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", hidden: true, "aria-label": "選員工名單的檔案" });
  file.onchange = function () { var f = file.files && file.files[0]; file.value = ""; if (f) rsReadFile(f); };
  var pasteBox = h("div", { class: "rspaste", hidden: true });
  var ta = h("textarea", { class: "in", rows: "6", placeholder: "從 Excel 選員工編號、姓名兩欄複製，貼在這裡；\n或一行一個人：E10107 王小明", "aria-label": "貼上員工名單", style: "width:100%;box-sizing:border-box;font-size:14px" });
  pasteBox.appendChild(ta);
  pasteBox.appendChild(h("div", { class: "acts", style: "margin-top:6px" }, [btn("👀 看一下", function () { if (!ta.value.trim()) { rsMsg("先貼上名單"); return; } rsPreview(rsPaste(ta.value), "貼上的"); }, "sm pri")]));
  var acts = [btn("📤 上傳 Excel／CSV", function () { file.click(); }, "sm pri"), btn("📋 貼上", function () { pasteBox.hidden = !pasteBox.hidden; if (!pasteBox.hidden) try { ta.focus(); } catch (e) { /* 沒關係 */ } }, "sm"),
    btn("＋ 新增一位", function () { RS.addOn = !RS.addOn; drawRoster(); var f = $("#rsAddEmp"); if (f) try { f.focus(); } catch (e) { /* 沒關係 */ } }, "sm rsaddbtn")];   // 第 34 批追加
  if (rs.n) acts.push(btn(RS.listOn ? "收起名單" : "👀 看名單", function () { RS.listOn = !RS.listOn; drawRoster(); }, "sm"), btn("🧹 清空員工名單", rsClear, "sm bad"));
  box.appendChild(h("div", { class: "acts rsacts", style: "flex-wrap:wrap" }, acts));
  box.appendChild(file);
  if (RS.addOn) box.appendChild(rsAddBox());
  box.appendChild(pasteBox);
  box.appendChild(h("div", { id: "rsMsg", class: "scr-m", role: "status" }));
  box.appendChild(h("div", { id: "rsPrev" }));
  if (RS.listOn && rs.n) box.appendChild(rsList(rs.rows || []));
  box.appendChild(h("p", { class: "muted", style: "font-size:12.5px;margin:8px 0 0" }, ["Excel 的第一列可以是欄名（員工編號、姓名、備註…會自己認）；沒有欄名也可以（看內容猜：有數字的是員工編號）。舊的 .xls 請先另存成 .xlsx 或 CSV。比對只在藥戰手冊自己的後端做，不送給 AI。"]));
}
function rsList(rows) {
  var wrap = h("div", { class: "rslist", style: "margin-top:10px" });
  var q = h("input", { class: "in", type: "search", placeholder: "找員工編號或姓名", value: RS.q, "aria-label": "找員工編號或姓名", style: "width:100%;max-width:280px;box-sizing:border-box" });
  var body = h("div");
  var paint = function () {
    body.innerHTML = "";
    var k = String(q.value || "").replace(/\s+/g, "").toUpperCase(), hit = rows.filter(function (r) { return !k || String(r[0]).toUpperCase().indexOf(k) >= 0 || String(r[1]).replace(/\s+/g, "").toUpperCase().indexOf(k) >= 0; });
    var tb = h("table", { class: "tbl" });
    tb.appendChild(h("tr", {}, ["員工編號", "姓名", "備註", ""].map(function (x) { return h("th", {}, [x]); })));
    hit.slice(0, 200).forEach(function (r) { tb.appendChild(h("tr", {}, [h("td", {}, [r[0]]), h("td", {}, [r[1]]), h("td", { class: "muted" }, [r[2] || ""]), h("td", {}, [btn("刪除", function (ev) { rsDel(r, ev.target); }, "sm bad rsdel")])])); });   // 第 34 批追加：每一列可以刪
    body.appendChild(h("div", { class: "tscroll logscroll" }, [tb]));
    body.appendChild(h("div", { class: "muted", style: "font-size:12.5px" }, [hit.length > 200 ? "找到 " + hit.length + " 人，只列前 200 個（打字縮小範圍）" : "找到 " + hit.length + " 人"]));
  };
  q.oninput = function () { RS.q = q.value; paint(); };
  wrap.appendChild(q); wrap.appendChild(body); paint();
  return wrap;
}
// 第 34 批追加：「＋ 新增一位」：開發者自己打員工編號、姓名（備註可以不填）→ 加進名單（同一個員工編號＝改成新的）
function rsAddBox() {
  var emp = h("input", { class: "in", id: "rsAddEmp", maxlength: "20", autocomplete: "off", autocapitalize: "characters", placeholder: "員工編號（例：E10107）", "aria-label": "新增：員工編號", style: "flex:1 1 140px;min-width:0" });
  var nm = h("input", { class: "in", maxlength: "20", autocomplete: "off", placeholder: "姓名（例：王小明）", "aria-label": "新增：姓名", style: "flex:1 1 120px;min-width:0" });
  var memo = h("input", { class: "in", maxlength: "60", autocomplete: "off", placeholder: "備註（可以不填）", "aria-label": "新增：備註", style: "flex:2 1 160px;min-width:0" });
  var m = h("div", { class: "scr-m", role: "status", style: "margin-top:4px" });
  var go = btn("加入名單", function () { rsAdd(emp, nm, memo, m, go, false); }, "sm pri rsaddgo");
  [emp, nm, memo].forEach(function (x) { x.onkeydown = function (e) { if (e.key === "Enter") go.onclick(); }; });
  return h("div", { class: "rsadd", style: "border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin:8px 0;background:#FAFBFC" }, [
    h("div", { style: "font-weight:700;margin-bottom:6px" }, ["＋ 新增一位到員工名單"]),
    h("div", { style: "display:flex;gap:8px;flex-wrap:wrap;align-items:center" }, [emp, nm, memo]),
    h("div", { class: "acts", style: "margin-top:8px" }, [go, btn("收起來", function () { RS.addOn = false; drawRoster(); }, "sm")]),
    m,
    h("div", { class: "muted", style: "font-size:12.5px" }, ["同一個員工編號已經在名單上：改成這次打的（姓名不一樣會先問你）。新增以後，用這個員工編號＋姓名申請的同事就會自動核可；已經在等審核、對得上的人，到「① 誰可以看」按「✅ 核可對得上員工名單的…」。"])]);
}
function rsAdd(emp, nm, memo, m, el, force) {
  if (AD.busy) return;
  var e = rsEmp(emp.value), n = rsName(nm.value), mm = String(memo.value || "").replace(/\s+/g, " ").trim().slice(0, 60);
  if (!e || !/^[A-Z0-9-]{2,20}$/.test(e)) { m.textContent = "❌ 員工編號只能是英文字母、數字（2～20 個字）"; try { emp.focus(); } catch (x) { /* 沒關係 */ } return; }
  if (!n) { m.textContent = "❌ 請打姓名（最多 20 個字）"; try { nm.focus(); } catch (x) { /* 沒關係 */ } return; }
  AD.busy = true; el.disabled = true; m.textContent = "加入中…";
  call("hbRoster", ["add", JSON.stringify([e, n, mm]), force ? 1 : 0]).then(function (r) {
    AD.busy = false; el.disabled = false;
    if (r && r.exists) {   // 名單上已經有這個員工編號、姓名不一樣：先問一次
      m.textContent = "";
      modal({ title: "員工編號 " + r.emp + " 已經在名單上", lines: ["名單上是「" + r.name + "」" + (r.memo ? "（" + r.memo + "）" : "") + "。", "要改成「" + n + "」" + (mm ? "（" + mm + "）" : "") + " 嗎？"], buttons: [{ label: "不要", cls: "sm" }, { label: "改成「" + n + "」", cls: "sm pri", fn: function () { rsAdd(emp, nm, memo, m, el, true); } }] });
      return;
    }
    if (!adOk(r)) { m.textContent = ""; if (r && r.field === "emp") try { emp.focus(); } catch (x) { /* 沒關係 */ } return; }
    m.textContent = "";
    toast(r.same ? "名單上本來就有 " + r.emp + " " + r.name : r.upd ? "✅ 改好了：" + r.emp + " " + r.name + "（名單上現在 " + r.n + " 人）" : "✅ 加進名單了：" + r.emp + " " + r.name + "（名單上現在 " + r.n + " 人）");
    emp.value = ""; nm.value = ""; memo.value = "";
    rsLoad();
    call("hbUsers", []).then(function (u) { if (!adOk(u)) return; AD.users = u.users || AD.users; AD.devs = u.devs || AD.devs; AD.rsn = u.rs; drawUsers(); }, function () { /* 下次再說 */ });
  }, function (x) { AD.busy = false; el.disabled = false; m.textContent = "❌ " + x.message; });
}
// 第 34 批追加：「看名單」每一列的「刪除」（先問一次）
function rsDel(r, el) {
  if (AD.busy) return;
  modal({ title: "從員工名單刪掉 " + r[0] + " " + r[1] + "？", lines: ["只是從員工名單拿掉：已經核可的人不受影響（不會被撤銷）。", "之後用這個員工編號申請的同事，不會自動核可（交給你審核）。"], buttons: [{ label: "不要", cls: "sm" }, { label: "刪掉", cls: "sm bad", fn: function () {
    AD.busy = true; if (el) el.disabled = true;
    call("hbRoster", ["del", r[0]]).then(function (x) {
      AD.busy = false;
      if (!adOk(x)) { if (el) el.disabled = false; rsLoad(); return; }
      toast("已從員工名單刪掉 " + x.emp + "（名單上現在 " + x.n + " 人）");
      rsLoad();
      call("hbUsers", []).then(function (u) { if (!adOk(u)) return; AD.users = u.users || AD.users; AD.devs = u.devs || AD.devs; AD.rsn = u.rs; drawUsers(); }, function () { /* 下次再說 */ });
    }, function (e) { AD.busy = false; if (el) el.disabled = false; toast("❌ " + e.message); });
  } }] });
}
// ── 讀檔：Excel（.xlsx）或 CSV → [{ n: 第幾列, c: [每一格] }] ──
function rsReadFile(file) {
  if (file.size > 8e6) { rsMsg("❌ 檔案太大（8 MB 以內）"); return; }
  var name = String(file.name || "");
  if (/\.xls$/i.test(name)) { rsMsg("這是舊的 Excel（.xls）：請在 Excel「另存新檔」選 .xlsx 或 CSV，再上傳。"); return; }
  rsMsg("讀檔中…");
  var fr = new FileReader();
  fr.onload = function () {
    var b = new Uint8Array(fr.result);
    if (b[0] === 0x50 && b[1] === 0x4B) { rsXlsx(b).then(function (rows) { rsPreview(rows, name); }, function (e) { rsMsg("❌ 這個 Excel 讀不出來（" + (e && e.message || e) + "）：請另存成 CSV 再試。"); }); return; }
    rsPreview(rsCsv(rsDecode(b)), name);
  };
  fr.onerror = function () { rsMsg("❌ 檔案讀不出來"); };
  fr.readAsArrayBuffer(file);
}
function rsDecode(b) {
  try { return new TextDecoder("utf-8", { fatal: true }).decode(b).replace(/^﻿/, ""); } catch (e) { /* 不是 UTF-8 */ }
  try { return new TextDecoder("big5").decode(b); } catch (e) { /* 瀏覽器不認得 Big5 */ }
  return new TextDecoder("utf-8").decode(b);
}
function rsCsv(text) {   // 逗號、Tab、分號都可以；有引號的照 CSV 的規矩
  var t = String(text || "").replace(/\r\n?/g, "\n"), first = t.split("\n")[0] || "";
  var d = first.indexOf("\t") >= 0 ? "\t" : first.split(";").length > first.split(",").length ? ";" : ",";
  var rows = [], row = [], cell = "", q = false;
  for (var i = 0; i < t.length; i++) {
    var ch = t.charAt(i);
    if (q) { if (ch === '"') { if (t.charAt(i + 1) === '"') { cell += '"'; i++; } else q = false; } else cell += ch; continue; }
    if (ch === '"' && cell === "") { q = true; continue; }
    if (ch === d) { row.push(cell); cell = ""; continue; }
    if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; continue; }
    cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.map(function (c, i) { return { n: i + 1, c: c }; });
}
function rsPaste(text) {   // 從 Excel 複製（Tab 分開）、逗號分開，或一行「E10107 王小明」
  var t = String(text || "").replace(/\r\n?/g, "\n");
  if (t.indexOf("\t") >= 0) return rsCsv(t);
  return t.split("\n").map(function (l, i) {
    l = l.trim();
    if (!l) return { n: i + 1, c: [] };
    if (/[,，]/.test(l)) return { n: i + 1, c: l.split(/[,，]/).map(function (x) { return x.trim(); }) };
    var p = l.split(/\s+/), e = "", rest = [];
    p.forEach(function (x) { if (!e && /\d/.test(x) && rsEmp(x)) e = x; else rest.push(x); });
    return { n: i + 1, c: e ? [e, rest.join(" ")] : [l] };
  });
}
function rsU16(b, o) { return b[o] | (b[o + 1] << 8); }
function rsU32(b, o) { return (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0; }
function rsZip(b) {   // .xlsx 是壓縮檔：找出裡面每個檔在哪裡 → { 檔名: { m: 壓縮方式, off: 資料開始, n: 大小 } }
  var e = -1, i;
  for (i = b.length - 22; i >= Math.max(0, b.length - 70000); i--) if (rsU32(b, i) === 0x06054b50) { e = i; break; }
  if (e < 0) throw new Error("不是 Excel 檔");
  var cnt = rsU16(b, e + 10), off = rsU32(b, e + 16), out = {}, td = new TextDecoder("utf-8");
  for (var k = 0; k < cnt && off + 46 <= b.length; k++) {
    if (rsU32(b, off) !== 0x02014b50) break;
    var nl = rsU16(b, off + 28), lo = rsU32(b, off + 42);
    out[td.decode(b.subarray(off + 46, off + 46 + nl))] = { m: rsU16(b, off + 10), off: lo + 30 + rsU16(b, lo + 26) + rsU16(b, lo + 28), n: rsU32(b, off + 20) };
    off += 46 + nl + rsU16(b, off + 30) + rsU16(b, off + 32);
  }
  return out;
}
function rsUnzip(b, f) {   // → Promise（文字）
  if (!f) return Promise.resolve("");
  var data = b.subarray(f.off, f.off + f.n);
  if (f.m === 0) return Promise.resolve(new TextDecoder("utf-8").decode(data));
  if (f.m !== 8 || typeof DecompressionStream === "undefined") return Promise.reject(new Error("瀏覽器太舊，解不開 Excel"));
  return new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).text();
}
function rsTxt(el) {   // 一格的字：一格分好幾段（粗體、顏色）的接起來；注音、拼音標示（rPh）不算
  var ts = el.getElementsByTagNameNS("*", "t"), s = "";
  for (var k = 0; k < ts.length; k++) { var p = ts[k].parentNode; if (!(p && (p.localName || p.nodeName) === "rPh")) s += ts[k].textContent; }
  return s;
}
function rsCol(ref) { var m = /^([A-Z]+)\d+$/.exec(ref || ""); if (!m) return -1; var n = 0; for (var i = 0; i < m[1].length; i++) n = n * 26 + (m[1].charCodeAt(i) - 64); return n - 1; }
function rsXlsx(b) {   // 第一個工作表 → [{ n, c }]
  var z;
  try { z = rsZip(b); } catch (e) { return Promise.reject(e); }
  var P = new DOMParser(), xml = function (t) { return P.parseFromString(t || "<x/>", "application/xml"); };
  return Promise.all([rsUnzip(b, z["xl/workbook.xml"]), rsUnzip(b, z["xl/_rels/workbook.xml.rels"]), rsUnzip(b, z["xl/sharedStrings.xml"])]).then(function (a) {
    var sheet = "";
    try {
      var s1 = xml(a[0]).getElementsByTagNameNS("*", "sheet")[0], rid = s1 ? s1.getAttribute("r:id") || s1.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships", "id") : "";
      var rels = xml(a[1]).getElementsByTagNameNS("*", "Relationship");
      for (var i = 0; i < rels.length; i++) if (rels[i].getAttribute("Id") === rid) { var t = rels[i].getAttribute("Target") || ""; sheet = t.charAt(0) === "/" ? t.slice(1) : "xl/" + t.replace(/^\.\//, ""); }
    } catch (e) { sheet = ""; }
    if (!z[sheet]) sheet = Object.keys(z).filter(function (n) { return /^xl\/worksheets\/sheet\d+\.xml$/.test(n); }).sort()[0] || "";
    if (!z[sheet]) throw new Error("找不到工作表");
    var ss = [];
    if (a[2]) { var sis = xml(a[2]).getElementsByTagNameNS("*", "si"); for (var j = 0; j < sis.length; j++) ss.push(rsTxt(sis[j])); }
    return rsUnzip(b, z[sheet]).then(function (t) {
      var rows = [], rs = xml(t).getElementsByTagNameNS("*", "row");
      for (var i = 0; i < rs.length && rows.length < 6000; i++) {
        var cs = rs[i].getElementsByTagNameNS("*", "c"), row = [];
        for (var j = 0; j < cs.length; j++) {
          var c = cs[j], col = rsCol(c.getAttribute("r")), tp = c.getAttribute("t") || "", v = c.getElementsByTagNameNS("*", "v")[0], val = "";
          if (tp === "s") val = ss[+(v ? v.textContent : -1)] || "";
          else if (tp === "inlineStr") val = rsTxt(c);
          else val = v ? v.textContent : "";
          if (col < 0) col = row.length;
          while (row.length < col) row.push("");
          row[col] = val;
        }
        rows.push({ n: +(rs[i].getAttribute("r") || i + 1), c: row });
      }
      return rows;
    });
  });
}
// 哪一欄是員工編號、姓名、備註：先找欄名；沒有欄名就看內容猜（有數字的＝員工編號，沒數字的字＝姓名）
function rsMap(rows) {
  var i, j;
  for (i = 0; i < Math.min(rows.length, 6); i++) {
    var c = rows[i].c, e = -1, n = -1, m = -1;
    for (j = 0; j < c.length; j++) { var t = String(c[j] || "").replace(/\s+/g, ""); if (!t) continue; if (n < 0 && RS_NAME.test(t)) n = j; else if (e < 0 && RS_EMP.test(t)) e = j; else if (m < 0 && RS_MEMO.test(t)) m = j; }
    if (e >= 0 && n >= 0) return { head: i, e: e, n: n, m: m };
  }
  var w = 0, sample = rows.slice(0, 60);
  sample.forEach(function (r) { w = Math.max(w, r.c.length); });
  var se = [], sn = [];
  for (j = 0; j < w; j++) { se[j] = 0; sn[j] = 0; sample.forEach(function (r) { var t = String(r.c[j] || "").trim(); if (/\d/.test(t) && rsEmp(t)) se[j]++; else if (t && !/\d/.test(t) && t.length <= 20) sn[j]++; }); }
  var ce = -1, cn = -1;
  for (j = 0; j < w; j++) if (se[j] && (ce < 0 || se[j] > se[ce])) ce = j;
  for (j = 0; j < w; j++) if (j !== ce && sn[j] && (cn < 0 || sn[j] > sn[cn])) cn = j;
  return { head: -1, e: ce, n: cn, m: -1 };
}
function rsColName(j) { var s = ""; j++; while (j > 0) { var r = (j - 1) % 26; s = String.fromCharCode(65 + r) + s; j = Math.floor((j - 1) / 26); } return s; }
// 讀出來的 → 先給開發者看（還沒送出去）
function rsPreview(rows, src) {
  var box = $("#rsPrev"); if (!box) return;
  box.innerHTML = ""; rsMsg("");
  rows = (rows || []).filter(function (r) { return r.c.some(function (x) { return String(x || "").trim(); }); });
  if (!rows.length) { rsMsg("❌ 裡面沒有東西"); return; }
  var mp = rsMap(rows);
  if (mp.e < 0 || mp.n < 0) { rsMsg("❌ 找不到員工編號、姓名是哪兩欄：第一列請寫欄名「員工編號」「姓名」，再試一次。"); return; }
  var good = [], at = {}, dup = 0, bad = [];
  rows.forEach(function (r, i) {
    if (i <= mp.head) return;
    var e = rsEmp(r.c[mp.e]), n = rsName(r.c[mp.n]), m = mp.m >= 0 ? String(r.c[mp.m] || "").replace(/\s+/g, " ").trim().slice(0, 60) : "";
    if (!e || !n) { bad.push(r.n); return; }
    var k = rsKey(e);
    if (at[k] !== undefined) { good[at[k]] = [e, n, m]; dup++; return; }
    at[k] = good.length; good.push([e, n, m]);
  });
  if (!good.length) { rsMsg("❌ 一個人都讀不出來（員工編號要是英文字母、數字；姓名不能空白）。"); return; }
  if (good.length > 5000) { rsMsg("❌ 太多人了（一次最多 5000 人）"); return; }
  RS.prev = good;
  var cur = (AD.rs && AD.rs.n) || 0;
  var lines = ["📄 " + src + "：讀到 " + good.length + " 個人。" + (dup ? "重複的員工編號 " + dup + " 個（用後面那一列）。" : ""),
    "員工編號＝第 " + rsColName(mp.e) + " 欄、姓名＝第 " + rsColName(mp.n) + " 欄" + (mp.m >= 0 ? "、備註＝第 " + rsColName(mp.m) + " 欄" : "") + (mp.head >= 0 ? "（第 " + rows[mp.head].n + " 列是欄名）" : "（沒有欄名：照內容猜的，請看下面對不對）")];
  if (bad.length) lines.push("⚠ 看不懂、跳過的列：" + bad.length + " 列（第 " + bad.slice(0, 12).join("、") + (bad.length > 12 ? "…" : "") + " 列；員工編號要是英文字母、數字，姓名不能空白）");
  lines.forEach(function (l) { box.appendChild(h("p", { style: "margin:4px 0" }, [l])); });
  var tb = h("table", { class: "tbl" });
  tb.appendChild(h("tr", {}, ["員工編號", "姓名", "備註"].map(function (x) { return h("th", {}, [x]); })));
  good.slice(0, 8).forEach(function (r) { tb.appendChild(h("tr", {}, [h("td", {}, [r[0]]), h("td", {}, [r[1]]), h("td", { class: "muted" }, [r[2]])])); });
  box.appendChild(h("div", { class: "tscroll" }, [tb]));
  if (good.length > 8) box.appendChild(h("div", { class: "muted", style: "font-size:12.5px" }, ["（只列前 8 個，其他的一起匯入）"]));
  var radio = function (v, label) {
    var r = h("input", { type: "radio", name: "rsmode", value: v, checked: RS.mode === v });
    r.onchange = function () { RS.mode = v; };
    return h("label", { style: "display:flex;gap:6px;align-items:flex-start;margin:4px 0" }, [r, h("span", {}, [label])]);
  };
  if (cur) box.appendChild(h("div", { style: "margin:8px 0" }, [radio("replace", "整份換掉：名單上原本的 " + cur + " 人，換成這 " + good.length + " 人"), radio("add", "加進去：原本的留著，同一個員工編號用新的")]));
  else RS.mode = "replace";
  box.appendChild(h("div", { class: "acts" }, [btn("✅ 匯入 " + good.length + " 人", function (ev) { rsImport(ev.target); }, "sm pri"), btn("取消", function () { RS.prev = null; box.innerHTML = ""; }, "sm")]));
}
function rsImport(el) {
  if (!RS.prev || AD.busy) return;
  var rows = RS.prev, mode = (AD.rs && AD.rs.n) ? RS.mode : "replace";
  var go = function () {
    AD.busy = true; if (el) el.disabled = true; rsMsg("匯入中…");
    call("hbRoster", ["import", JSON.stringify(rows), mode], { ms: 120000 }).then(function (r) {
      AD.busy = false;
      if (!adOk(r)) { if (el) el.disabled = false; rsMsg(""); return; }
      RS.prev = null;
      toast("✅ 員工名單匯入好了：名單上現在 " + r.n + " 人" + (r.nbad ? "（跳過 " + r.nbad + " 列）" : ""));
      rsLoad();
      call("hbUsers", []).then(function (u) { if (!adOk(u)) return; AD.users = u.users || AD.users; AD.devs = u.devs || AD.devs; AD.rsn = u.rs; drawUsers(); }, function () { /* 下次再說 */ });
    }, function (e) { AD.busy = false; if (el) el.disabled = false; rsMsg("❌ " + e.message); });
  };
  var cur = (AD.rs && AD.rs.n) || 0;
  if (mode === "replace" && cur) modal({ title: "整份換掉員工名單？", lines: ["名單上原本的 " + cur + " 人會換成這 " + rows.length + " 人。", "已經核可的人不受影響（不會被撤銷）；之後申請的人照新的名單比對。"], buttons: [{ label: "不要", cls: "sm" }, { label: "換掉", cls: "sm pri", fn: go }] });
  else go();
}
function rsClear() {
  if (AD.busy) return;
  modal({ title: "清空員工名單？", lines: ["員工名單上的 " + ((AD.rs && AD.rs.n) || 0) + " 人全部刪掉。", "已經核可的人不受影響；之後的申請就不會自動核可（全部交給你審核），直到再匯入一份。"], buttons: [{ label: "不要", cls: "sm" }, { label: "清空", cls: "sm bad", fn: function () {
    AD.busy = true;
    call("hbRoster", ["clear"]).then(function (r) { AD.busy = false; if (!adOk(r)) return; toast("🧹 員工名單清空了"); RS.listOn = false; rsLoad(); }, function (e) { AD.busy = false; toast("❌ " + e.message); });
  } }] });
}

/* ════════ export.js ════════ */
/* ═══════════════ export.js：第 37 批「⑦ 📤 匯出給 Copilot」（管理頁，只有開發者）═══════════════
 * 按一下：整本手冊（每章一個 Word 檔，含圖片）＋補藥神器的藥品資料（依英文字母分檔，含藥局位置）→ 打包成一個 zip 下載。
 * 用法：zip 解開，把裡面的 Word 檔放到院內 SharePoint「藥戰手冊」網站的「手冊匯出」資料夾；Copilot Studio 的知識來源接這個網站。
 * Word 檔在這個瀏覽器裡做（不經過任何外面的網站）：圖片向手冊後端拿（hbExportPics），在這裡縮小成 JPEG；藥品資料向後端拿（hbExportDrugs）。
 * 為什麼一章一個檔、太大再切（_1、_2…）：沒有 Microsoft 365 Copilot 授權時，Copilot Studio 只讀 SharePoint 上 7 MB 以下的檔。
 * 匯出的是後端存好的那一本（編輯器裡還沒按儲存的不算）；還沒有內容的章不匯出。
 * 做好的 zip 只在記憶體裡、直接下載，不存進瀏覽器（10 分鐘後連「再下載一次」也收掉）。 */
var EX = { busy: false, url: "", tm: 0, sid: -1, t0: 0 }, EXP = null;
function exBusy() { return EX.busy && EX.sid === SESS && MAIN; }   // 匯出中（中間登出、重新登入的話，上一次的就不算了）
var EX_LIMIT = 6.5e6;                        // 一個 Word 檔最多多大（估的；超過就切成 _1、_2…）
var EX_IMG_MAX = 1400, EX_IMG_Q = 0.82, EX_KEEP = 450e3;   // 圖：長邊最多 1400 px、JPEG 品質 0.82；本來就小的 JPEG、PNG（450 KB 以下、不用縮）直接放
var EX_TW = 9638, EX_IND = 380;              // A4、左右各 2 公分：內文寬（twips）；縮排一層多少
var EX_EMU_W = 5580000, EX_EMU_H = 6840000;  // 圖最大 15.5 × 19 公分
var EX_SZ = { sm: 20, lg: 30, xl: 40 };      // 字的大小（半點）：小、大、特大（內文 12 點）
var EX_W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main", EX_R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
var EX_ZONE_SEP = "、";

/* ── 小工具 ── */
function exX(s) {   // 放進 XML 的字：XML 不收的控制字元、落單的半個 emoji 拿掉；& < > " 換掉
  return String(s === null || s === undefined ? "" : s)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "")
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "$1")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function exHex(c) { return String(c || "").replace(/^#/, "").toUpperCase(); }
function exZ2(n) { return ("0" + n).slice(-2); }
function exStampOf(d) { return d.getFullYear() + "/" + exZ2(d.getMonth() + 1) + "/" + exZ2(d.getDate()) + " " + exZ2(d.getHours()) + ":" + exZ2(d.getMinutes()); }
function exMb(n) { return n >= 1e6 ? (n / 1e6).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1e3)) + " KB"; }
function exFname(s) {   // 檔名裡不能用的字（Windows、SharePoint）換成 _；最多 40 個字
  s = String(s === null || s === undefined ? "" : s).replace(/[\\\/:*?"<>|#%{}~&\u0000-\u001F]/g, "_").replace(/\s+/g, " ").replace(/^[\s._]+|[\s.]+$/g, "");
  return s.slice(0, 40).replace(/[\s.]+$/g, "");
}
function exFidOf(p) {   // 一張圖在雲端硬碟的檔案代號（手冊存的 fid；舊的從網址找）
  if (!p) return "";
  if (p.fid && /^[A-Za-z0-9_-]{10,80}$/.test(p.fid)) return p.fid;
  var m = /(?:id=|\/d\/)([A-Za-z0-9_-]{10,80})/.exec(String(p.url || ""));
  return m ? m[1] : "";
}
function exAnimPic(b) { return b.poster ? { url: b.poster, cap: b.cap } : { url: b.url, fid: b.fid, cap: b.cap }; }   // 動畫：Word 裡放第一格
function exB64(b64) { var s = atob(b64), u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
function exBlobBytes(b) {
  if (b.arrayBuffer) return b.arrayBuffer().then(function (ab) { return new Uint8Array(ab); });
  return new Promise(function (ok, bad) { var fr = new FileReader(); fr.onload = function () { ok(new Uint8Array(fr.result)); }; fr.onerror = function () { bad(new Error("讀不到")); }; fr.readAsArrayBuffer(b); });
}

/* ── zip（Word 檔本身就是 zip；最後整包也是 zip）：檔名用 UTF-8（中文檔名）；能壓的用瀏覽器內建的壓縮，不行就不壓 ── */
var EX_CRC = null;
function exCrc(u) {
  if (!EX_CRC) { EX_CRC = []; for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; EX_CRC[n] = c >>> 0; } }
  var x = 0xFFFFFFFF;
  for (var i = 0; i < u.length; i++) x = EX_CRC[(x ^ u[i]) & 0xFF] ^ (x >>> 8);
  return (x ^ 0xFFFFFFFF) >>> 0;
}
function exPipe(u, kind) {
  var cs = new CompressionStream(kind);
  return new Response(new Blob([u]).stream().pipeThrough(cs)).arrayBuffer().then(function (ab) { return new Uint8Array(ab); });
}
function exDeflate(u) {   // → Promise<Uint8Array 或 null（這個瀏覽器不會壓）>
  if (typeof CompressionStream !== "function" || typeof Response !== "function") return Promise.resolve(null);
  try { return exPipe(u, "deflate-raw").catch(function () { return null; }); } catch (e) { /* 舊一點的瀏覽器：只有 deflate（多 2 個字頭、4 個字尾） */ }
  try { return exPipe(u, "deflate").then(function (z) { return z.length > 6 ? z.subarray(2, z.length - 4) : null; }, function () { return null; }); } catch (e2) { return Promise.resolve(null); }
}
function exZip(files, when) {   // files：[{ name, data(Uint8Array), z(要不要壓) }] → Promise<Uint8Array>
  var enc = new TextEncoder(), loc = [], cen = [], off = 0, d = when || new Date();
  var dt = ((d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2)) & 0xFFFF;
  var dd = ((Math.max(0, d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF;
  return files.reduce(function (p, f) {
    return p.then(function () { return f.z ? exDeflate(f.data) : null; }).then(function (zd) {
      var use = !!(zd && zd.length < f.data.length), body = use ? zd : f.data, nm = enc.encode(f.name), crc = exCrc(f.data);
      var a = new DataView(new ArrayBuffer(30));
      a.setUint32(0, 0x04034b50, true); a.setUint16(4, 20, true); a.setUint16(6, 0x0800, true); a.setUint16(8, use ? 8 : 0, true);
      a.setUint16(10, dt, true); a.setUint16(12, dd, true); a.setUint32(14, crc, true); a.setUint32(18, body.length, true); a.setUint32(22, f.data.length, true);
      a.setUint16(26, nm.length, true); a.setUint16(28, 0, true);
      var c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, use ? 8 : 0, true);
      c.setUint16(12, dt, true); c.setUint16(14, dd, true); c.setUint32(16, crc, true); c.setUint32(20, body.length, true); c.setUint32(24, f.data.length, true);
      c.setUint16(28, nm.length, true); c.setUint16(30, 0, true); c.setUint16(32, 0, true); c.setUint16(34, 0, true); c.setUint16(36, 0, true); c.setUint32(38, 0, true); c.setUint32(42, off, true);
      loc.push(new Uint8Array(a.buffer), nm, body);
      cen.push(new Uint8Array(c.buffer), nm);
      off += 30 + nm.length + body.length;
    });
  }, Promise.resolve()).then(function () {
    var cs = 0; cen.forEach(function (x) { cs += x.length; });
    var e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, cs, true); e.setUint32(16, off, true);
    var all = loc.concat(cen, [new Uint8Array(e.buffer)]), n = 0, k = 0;
    all.forEach(function (x) { n += x.length; });
    var out = new Uint8Array(n);
    all.forEach(function (x) { out.set(x, k); k += x.length; });
    return out;
  });
}

/* ── Word 的一段一段（WordprocessingML）── */
function exR(t, o) {   // 一段字（同一個格式）；換行＝<w:br/>
  o = o || {};
  var pr = "", body = "";
  if (o.font) pr += '<w:rFonts w:ascii="' + o.font + '" w:hAnsi="' + o.font + '"/>';
  if (o.b) pr += "<w:b/><w:bCs/>";
  if (o.i) pr += "<w:i/><w:iCs/>";
  if (o.s) pr += "<w:strike/>";
  if (o.color) pr += '<w:color w:val="' + o.color + '"/>';
  if (o.sz) pr += '<w:sz w:val="' + o.sz + '"/><w:szCs w:val="' + o.sz + '"/>';
  if (o.u) pr += '<w:u w:val="single"/>';
  if (o.bdr) pr += o.bdr;   // 第 41 批：文字框＝Word 的字元框線（照 Word 規定的順序：u 後面、shd 前面）
  if (o.shd) pr += '<w:shd w:val="clear" w:color="auto" w:fill="' + o.shd + '"/>';
  String(t === null || t === undefined ? "" : t).replace(/\r\n?/g, "\n").replace(/\t/g, "    ").split("\n").forEach(function (seg, k) {
    if (k) body += "<w:br/>";
    if (seg) body += '<w:t xml:space="preserve">' + exX(seg) + "</w:t>";
  });
  return body ? "<w:r>" + (pr ? "<w:rPr>" + pr + "</w:rPr>" : "") + body + "</w:r>" : "";
}
var EX_TAB = "<w:r><w:tab/></w:r>";
function exRuns(runs, base) {   // 格式文字（粗體、顏色、螢光筆、公式、反灰可複製…）→ Word 的字
  // 第 37 批追加：劃掉的字（刪除線）＝已經不算數的舊規定。Copilot 主要讀「字」、可能漏看「劃掉」這個樣子，
  // 所以連續劃掉的那一段，前後用字寫出來：「（已刪除：」劃掉的字「）」（劃掉的字照樣劃掉；手冊網頁、LINE 照舊只有劃掉的樣子）
  var out = "", rs = (runs || []).filter(function (r) { return r && r.t; });
  var del = function (r) { return !!(r && r.s && !r.cp); };
  rs.forEach(function (r, i) {
    var o = Object.assign({}, base || {});
    if (del(r) && !del(rs[i - 1])) out += exR("（已刪除：", Object.assign({}, base || {}, { b: 1 }));
    if (r.cp) o = Object.assign(o, { shd: "E5E7EB", font: "Consolas" });
    else {
      if (r.b) o.b = 1;
      if (r.i) o.i = 1;
      if (r.u) o.u = 1;
      if (r.s) o.s = 1;
      if (r.c && YZ_RT_COLORS[r.c]) o.color = exHex(YZ_RT_COLORS[r.c]);
      var zz = _yzRtSz_(r.z); if (zz) o.sz = EX_SZ[r.z] || Math.round(zz.pt * 2);   // 第 40 批：點數＝Word 的字型大小（一模一樣）
      if (r.m && YZ_RT_MARKS[r.m]) o.shd = exHex(YZ_RT_MARKS[r.m].bg);
    }
    var bx = r.x ? _yzRtBox_(r.x) : null;   // 第 41 批：文字框（連在一起、一樣的框：Word 自己會畫成一個框）
    if (bx) o.bdr = '<w:bdr w:val="' + bx.def.word + '" w:sz="' + bx.def.sz + '" w:space="0" w:color="' + (bx.c ? exHex(YZ_RT_COLORS[bx.c]) : "auto") + '"/>';
    out += exR(r.fx && !r.cp ? _yzFxLinear_(r.t) : r.t, o);
    if (del(r) && !del(rs[i + 1])) out += exR("）", Object.assign({}, base || {}, { b: 1 }));
  });
  return out;
}
function exP(inner, o) {   // 一個段落（屬性照 Word 規定的順序寫）
  o = o || {};
  var pr = "";
  if (o.style) pr += '<w:pStyle w:val="' + o.style + '"/>';
  if (o.keep) pr += "<w:keepNext/>";
  if (o.bdr) pr += "<w:pBdr>" + o.bdr + "</w:pBdr>";
  if (o.shd) pr += '<w:shd w:val="clear" w:color="auto" w:fill="' + o.shd + '"/>';
  if (o.before !== undefined || o.after !== undefined) pr += "<w:spacing" + (o.before !== undefined ? ' w:before="' + o.before + '"' : "") + (o.after !== undefined ? ' w:after="' + o.after + '"' : "") + "/>";
  if (o.ind || o.hang) pr += '<w:ind w:left="' + Math.round((o.ind || 0) + (o.hang || 0)) + '"' + (o.hang ? ' w:hanging="' + Math.round(o.hang) + '"' : "") + "/>";
  if (o.jc) pr += '<w:jc w:val="' + o.jc + '"/>';
  return "<w:p>" + (pr ? "<w:pPr>" + pr + "</w:pPr>" : "") + (inner || "") + "</w:p>";
}
function exBdr(sides, color, sz) { return sides.map(function (s) { return "<w:" + s + ' w:val="single" w:sz="' + (sz || 4) + '" w:space="4" w:color="' + color + '"/>'; }).join(""); }
function exPic(k, cx, cy, alt) {   // 一張圖（r:embed、docPr 的編號先放記號，放進哪一個檔時才換：同一張圖在同一個檔只放一次）
  return '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + cx + '" cy="' + cy + '"/><wp:effectExtent l="0" t="0" r="0" b="0"/>' +
    '<wp:docPr id="@@ID@@" name="圖片" descr="' + exX(alt) + '"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>' +
    '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="圖片"/><pic:cNvPicPr/></pic:nvPicPr>' +
    '<pic:blipFill><a:blip r:embed="@@IMG:' + k + '@@"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
    '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
}
function exTable(tb, ind, kv) {   // 表格（合併儲存格照手冊的：左上角那一格代表整塊）。kv：左邊一欄是欄名（藥品卡片用）
  var G = _yzTblGrid_(tb);
  if (!G.nr || !G.nc) return "";
  var W = EX_TW - (ind || 0), w = tb.w && tb.w.length === G.nc ? tb.w : null, sum = 0, cols = [], tot = 0, j, r;
  if (w) w.forEach(function (x) { sum += +x || 0; });
  for (j = 0; j < G.nc; j++) { cols.push(Math.max(300, Math.floor(w && sum ? W * (+w[j] || 0) / sum : W / G.nc))); tot += cols[j]; }
  var head = !kv && tb.head !== false, bd = "A3A9B3";
  var out = '<w:tbl><w:tblPr><w:tblW w:w="' + tot + '" w:type="dxa"/>' + (ind ? '<w:tblInd w:w="' + ind + '" w:type="dxa"/>' : "") +
    "<w:tblBorders>" + ["top", "left", "bottom", "right", "insideH", "insideV"].map(function (s) { return "<w:" + s + ' w:val="single" w:sz="4" w:space="0" w:color="' + bd + '"/>'; }).join("") + "</w:tblBorders>" +
    '<w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>' +
    cols.map(function (x) { return '<w:gridCol w:w="' + x + '"/>'; }).join("") + "</w:tblGrid>";
  for (r = 0; r < G.nr; r++) {
    var hd = head && r === 0, row = "<w:tr>" + (hd ? "<w:trPr><w:tblHeader/></w:trPr>" : "");
    for (var c = 0; c < G.nc;) {
      var p = G.ps[G.at[r][c]], cs = Math.max(1, p.cs), ws = 0, k;
      for (k = 0; k < cs && c + k < G.nc; k++) ws += cols[c + k];
      var bold = hd || (kv && c === 0), pr = '<w:tcW w:w="' + ws + '" w:type="dxa"/>' + (cs > 1 ? '<w:gridSpan w:val="' + cs + '"/>' : "");
      if (p.r === r) { if (p.rs > 1) pr += '<w:vMerge w:val="restart"/>'; } else pr += "<w:vMerge/>";
      if (bold) pr += '<w:shd w:val="clear" w:color="auto" w:fill="F1F3F5"/>';
      var txt = "";
      if (p.r === r) String(p.v).replace(/\r\n?/g, "\n").split("\n").forEach(function (ln) { txt += exP(exR(ln, { b: bold }), { after: 0 }); });
      row += "<w:tc><w:tcPr>" + pr + "</w:tcPr>" + (txt || "<w:p/>") + "</w:tc>";
      c += cs;
    }
    out += row + "</w:tr>";
  }
  return out + "</w:tbl>" + exP("", { after: 60 });
}

/* ── 一個 Word 檔：內容一小塊一小塊（frag）放進去；太大就換下一個檔 ── */
function exFrag(tname, cont) { return { xml: "", pics: [], tname: tname, cont: !!cont, glue: false }; }
function exPut(F, xml) { F.xml += xml; }
function exFragBytes(F) {
  var n = F.xml.length * 3 * (EXP && EXP.zip ? 0.3 : 1);
  F.pics.forEach(function (k) { var p = EXP.pics[k]; if (p) n += p.data.length; });
  return n;
}
function exDoc(title, info) { return { title: title, info: info, body: [], imgs: [], ik: {}, bytes: 0, xlen: 0, pid: 0, n: 0 }; }
function exDocSize(D) { return D.bytes + D.xlen * 3 * (EXP && EXP.zip ? 0.3 : 1) + 3e4; }
function exAppend(D, F) {   // 一小塊放進這個檔：圖的記號換成這個檔的 rId（同一張圖只放一次）、docPr 的編號照順序
  var xml = F.xml.replace(/@@IMG:([A-Za-z0-9_-]+)@@/g, function (m, k) {
    if (D.ik[k]) return D.ik[k];
    var P = EXP.pics[k], rid = "rIdImg" + (D.imgs.length + 1);
    D.imgs.push({ rid: rid, name: "img" + (D.imgs.length + 1) + "." + P.ext, data: P.data, ext: P.ext });
    D.bytes += P.data.length;
    D.ik[k] = rid;
    return rid;
  }).replace(/@@ID@@/g, function () { return String(++D.pid); });
  D.body.push(xml);
  D.xlen += xml.length;
}
function exHeadXml(D, part) {   // 檔案最上面：標題＋（第幾部分）＋版本、匯出時間
  return exP(exR(D.title + (part || "")), { style: "Title" }) + exP(exR(D.info), { style: "HbInfo" });
}
function exPack(units, mk, contHead) {   // units：一小塊一小塊 → 好幾個檔（每個估起來不超過 EX_LIMIT）。mk()＝新的一個檔
  var docs = [], D = mk(0), i;
  for (i = 0; i < units.length; i++) {
    var F = units[i], est = exFragBytes(F) + (F.glue && units[i + 1] ? exFragBytes(units[i + 1]) : 0);
    if (D.n > 0 && exDocSize(D) + est > EX_LIMIT) {
      docs.push(D);
      D = mk(docs.length);
      if (F.cont && contHead) exAppend(D, contHead(F.tname));   // 從一個標題的中間切開：新的檔先寫「標題（續）」
    }
    exAppend(D, F);
    D.n++;
  }
  if (D.n > 0 || !docs.length) docs.push(D);
  return docs;
}

/* ── 手冊 → 一小塊一小塊 ── */
function exPicFrag(F, p, ind) {   // 一張圖：圖＋圖說＋圖片裡的字（Copilot 讀得到的是字）
  var k = exFidOf(p), P = k && EXP.pics[k], cap = String(p && p.cap || "").trim(), dr = p && p.draw ? _yzDrawLines_(p.draw).join("\n") : "", o = dr || String(p && p.ocr || "").trim();   // 第 40 批：流程圖：照流程的順序寫字（箭頭、說明框）
  if (P) {
    var sc = Math.min(1, (EX_EMU_W - (ind || 0) * 635) / (P.w * 9525), EX_EMU_H / (P.h * 9525));
    var cx = Math.max(9525, Math.round(P.w * 9525 * sc)), cy = Math.max(9525, Math.round(P.h * 9525 * sc));
    exPut(F, exP(exPic(k, cx, cy, cap || "手冊的圖"), { ind: ind, keep: !!(cap || o), after: cap ? 40 : 100 }));
    F.pics.push(k);
  } else exPut(F, exP(exR("［圖片" + (cap ? "：" + cap : "") + (EXP.noPics ? "" : "（這張圖這次沒有放進來）") + "］", { color: "6B7280" }), { ind: ind }));
  if (cap) exPut(F, exP(exR(cap), { style: "Caption", ind: ind }));
  if (o) exPut(F, exP(exR(dr ? "🔀 流程圖的字：\n" : "🔍 圖片裡的字：", { b: 1 }) + exR(o), { style: "HbSmall", ind: ind }));
}
function exTextUnits(out, tname, b, hb, cid, bi, tl) {   // 文字（可以有圖、表格）：一行一塊（標註、引用連在一起的算一塊）。tl＝這個標題是第幾層（第 43 批：裡面的小標題跟著往下一級）
  var ls = _yzParseLines_(b.v), i = 0, j;
  function base(L) { return bi + (L.lv || 0) * EX_IND; }
  function add(xml, pics) { var F = exFrag(tname, true); F.xml = xml; if (pics) F.pics = pics; out.push(F); return F; }
  while (i < ls.length) {
    var L = ls[i];
    if (L.k === "gap") { i++; continue; }
    if (L.k === "hr") { add(exP("", { bdr: exBdr(["bottom"], "9CA3AF", 6), ind: base(L), after: 120 })); i++; continue; }
    if (L.k === "go") {
      var tg = _yzGoTarget_(hb, L.go, cid);
      if (tg && tg.label) add(exP(exR("🔗 相關：", { b: 1, color: "0B5F8A" }) + exR(tg.label, { color: "0B5F8A" }), { ind: base(L) }));
      i++; continue;
    }
    if (L.k === "tbl") { var TB = b.tbls && b.tbls[L.tbl]; if (TB) add(exTable(TB, base(L))); i++; continue; }
    if (L.k === "img") { var P = b.pics && b.pics[L.img]; if (P && P.url) { var F = exFrag(tname, true); exPicFrag(F, P, base(L)); out.push(F); } i++; continue; }
    if (L.k === "box") {
      var T = _yzRtTone_(L.tone), xml = "";   // 第 39 批：顏色＋符號（不要符號：只寫「提示：」）
      for (j = i; j < ls.length && ls[j].k === "box" && ls[j].tone === L.tone && (ls[j].lv || 0) === (L.lv || 0); j++) {
        xml += exP((j === i ? exR((T.icon ? T.icon + " " : "") + T.label + "：", { b: 1 }) : "") + exRuns(ls[j].runs, { color: exHex(T.ink) }), { shd: exHex(T.bg), bdr: exBdr(["left"], exHex(T.bd), 18), ind: base(L), after: 0 });
      }
      add(xml + exP("", { after: 0 }));
      i = j; continue;
    }
    if (L.k === "quote") {
      var q = "";
      for (j = i; j < ls.length && ls[j].k === "quote" && (ls[j].lv || 0) === (L.lv || 0); j++) q += exP(exRuns(ls[j].runs, { color: "4B5563" }), { bdr: exBdr(["left"], "9CA3AF", 12), ind: base(L) + 120, after: 40 });
      add(q);
      i = j; continue;
    }
    if (L.k === "head") add(exP(exRuns(L.runs), { style: "Heading" + Math.min(5, (L.h || 1) + (tl || 1)), ind: base(L) }));
    else if (L.k === "item") add(exP(exR(L.mark) + EX_TAB + exRuns(L.runs), { ind: base(L), hang: EX_IND }));
    else add(exP(exRuns(L.runs), { ind: base(L) }));
    i++;
  }
}
function exLadderUnits(out, tname, b, bi) {   // 階梯式（法條…）：編號跟網頁、LINE 同一份程式算
  var r = _yzLadderRows_(b), st = YZ_LADDER_STYLES[b.style] ? b.style : "law", mw = {};
  r.items.forEach(function (it, i) { if (_yzLadderIsImg_(it) || !r.marks[i]) return; var w = _yzMarkW_(r.marks[i], 16) * 15; if (!mw[it.lv] || w > mw[it.lv]) mw[it.lv] = w; });
  r.items.forEach(function (it, i) {
    var F = exFrag(tname, true), ind = bi + (it.lv - 1) * 420;
    if (_yzLadderIsImg_(it)) exPicFrag(F, it.img, ind + (mw[it.lv] ? mw[it.lv] + 120 : 0));
    else {
      var mk = r.marks[i], strong = st === "law" && it.lv === 1;
      exPut(F, mk ? exP(exR(mk, { b: strong }) + EX_TAB + exR(it.v, { b: strong }), { ind: ind, hang: (mw[it.lv] || 300) + 120 }) : exP(exR(it.v), { ind: ind }));
    }
    out.push(F);
  });
}
function exDrugRow(code) { return (EXP.drugs && EXP.drugs[code]) || EXP.dHb[code] || null; }
function exDrugUnits(out, tname, b, bi) {   // 藥品卡片：一支藥一張小表（跟手冊網頁一樣不寫藥局位置；位置在「藥品資料」那幾個檔）
  (b.items || []).forEach(function (d0) {
    if (!d0 || !d0.code) return;
    var d = exDrugRow(d0.code), rows = [["💊 藥品", [d0.code, (d && d.brand) || d0.brand, (d && d.chName) || d0.chName].filter(Boolean).join("｜")]];
    if (d) {
      if (d.generic) rows.push(["學名", d.generic]);
      if (d.form) rows.push(["劑型", d.form]);
      if (d.notice) rows.push(["⚠️ 公告", d.notice]);
      if (d.feat) rows.push(["🔍 藥品特徵", d.feat]);
      if (d.pair) rows.push(["⚠️ 注意", d.pair]);
      if (d.note) rows.push(["適應症", d.note]);
      if (d.old) rows.push(["曾用藥品", d.old]);
    } else rows.push(["說明", "這次拿不到補藥神器裡這支藥的資料（只有名字）"]);
    var F = exFrag(tname, true);
    exPut(F, exTable({ rows: rows, w: [1, 3] }, bi, true));
    out.push(F);
  });
}
function exTitleUnits(hb, c, t, tl, kids) {   // 一個標題 → 一小塊一小塊（第一塊是標題，黏著下一塊）。沒有內容（沒有任何一塊、也沒有備註、頁數）＝[]
  // 第 43 批：tl＝第幾層（1～3）→ Word 的標題 1～3（Copilot、Word 的導覽窗格看得到層次）；kids＝下面有子標題（自己沒有內容也要放標題）
  tl = tl >= 2 && tl <= 3 ? tl : 1;
  var tname = String(t.name || "").trim() || "（還沒有標題）", out = [], H = exFrag(tname, false);
  exPut(H, exP(exR(tname), { style: "Heading" + tl }));
  H.glue = true;
  (t.blocks || []).forEach(function (b) {
    if (!b) return;
    var bi = _yzBlockInd_(b) * EX_IND;
    if (b.t === "text") exTextUnits(out, tname, b, hb, c.id, bi, tl);
    else if (b.t === "ladder") exLadderUnits(out, tname, b, bi);
    else if (b.t === "table") { var F = exFrag(tname, true); exPut(F, exTable(b, bi)); if (F.xml) out.push(F); }
    else if (b.t === "img" && b.url) { var F2 = exFrag(tname, true); exPicFrag(F2, b, bi); out.push(F2); }
    else if (b.t === "anim" && b.kind === "steps") {
      var ss = (b.steps || []).filter(function (s) { return s && (s.url || String(s.cap || "").trim()); });
      ss.forEach(function (s, k) {
        var F3 = exFrag(tname, true);
        exPut(F3, exP(exR("🎞 分步動畫　步驟 " + (k + 1) + "／" + ss.length, { b: 1 }) + (s.cap ? exR("　" + s.cap) : ""), { ind: bi, keep: !!s.url }));
        if (s.url) exPicFrag(F3, { url: s.url, fid: s.fid, ocr: s.ocr }, bi);
        out.push(F3);
      });
    } else if (b.t === "anim" && b.url) {
      var F4 = exFrag(tname, true);
      exPut(F4, exP(exR("🎞 動畫（Word 裡只放第一格）", { b: 1 }), { ind: bi, keep: true }));
      exPicFrag(F4, exAnimPic(b), bi);
      out.push(F4);
    } else if (b.t === "drug") exDrugUnits(out, tname, b, bi);
    else if (b.t === "link") {   // 第 40 批（一起做的）：網址連結：一個一行「🌐 名稱：網址（說明）」（Copilot 讀得到；Word 裡是字，不是可以點的連結）
      _yzLinkLines_(b).forEach(function (ln) { var F5 = exFrag(tname, true); exPut(F5, exP(exR("🌐 " + ln), { ind: bi })); out.push(F5); });
    }
  });
  var pg = _yzPageText_(t.page), nt = _yzNoteHas_(t.note) ? String(t.note).replace(/^(?:[ \t　\r]*\n)+|(?:\r?\n[ \t　\r]*)+$/g, "") : "";
  if (nt || pg) {
    var N = exFrag(tname, true), xml = "";
    if (nt) xml += exP(exR("備註", { b: 1 }), { shd: "FFF8E1", bdr: exBdr(["left"], "F0D78A", 18), after: 0, keep: true }) + exP(exR(nt), { shd: "FFF8E1", bdr: exBdr(["left"], "F0D78A", 18), after: 0 });
    if (pg) xml += exP(exR("📖 藥戰手冊頁數：" + pg, { color: "4B5563" }), { before: nt ? 60 : 0 });
    exPut(N, xml);
    out.push(N);
  }
  if (!out.length) return kids ? [H] : [];   // 第 43 批：只有名字的上層標題（內容都在子標題）也要放，層次才對
  return [H].concat(out);
}
function exChapterDocs(hb, c, ci) {   // 一章 → 一個（太大就好幾個）Word 檔：[{ name, D }]。沒有內容＝[]
  var units = [], ts = ((hb.titles || {})[c.id]) || [], lvs = _yzTLvs_(ts);
  ts.forEach(function (t, k) {
    if (!t) return;
    units = units.concat(exTitleUnits(hb, c, t, lvs[k], _yzTKids_(ts, k, lvs) > 0));
  });
  if (!units.length) return [];
  var cname = String(c.name || "").trim() || "第 " + (ci + 1) + " 章", intro = String(c.intro || "").trim();
  var docs = exPack(units, function (k) {
    var D = exDoc("藥戰手冊｜" + cname, EXP.info);
    if (!k && intro) { D.body.push(exP(exR(intro), { after: 160 })); D.xlen += intro.length; }
    return D;
  }, function (tname) { var F = exFrag(tname, false); exPut(F, exP(exR(tname + "（續）"), { style: "Heading1" })); return F; });
  var base = "藥戰手冊_" + exZ2(ci + 1) + "_" + (exFname(cname) || "第" + (ci + 1) + "章");
  return docs.map(function (D, k) { return { name: base + (docs.length > 1 ? "_" + (k + 1) : "") + ".docx", D: D, part: docs.length > 1 ? "（第 " + (k + 1) + "／" + docs.length + " 部分）" : "" }; });
}

/* ── 藥品資料 → 依英文字母分檔（一支藥一段：Copilot 一段一段找）── */
var EX_TAG = /^(?:\s*(?:[(（\[【〔<〈「][^)）\]】〕>〉」]{0,10}[)）\]】〕>〉」]|[*＊#＃★☆※!！~～+＋\-－.．_]))+/;   // 商品名前面的標記：(管4)、【限】、*、★…
function exDrugKey(d) {   // 依商品名的第一個英文字母分檔（前面的標記不算；全形英文也算）；不是英文字母開頭的＝「其他」
  var s = String(d.brand || "").trim().replace(EX_TAG, "").trim(), c = s.charAt(0);
  if (/[Ａ-Ｚａ-ｚ]/.test(c)) c = String.fromCharCode(c.charCodeAt(0) - 65248);
  return /[A-Za-z]/.test(c) ? c.toUpperCase() : "其他";
}
function exDrugDocs(rows) {
  var g = {}, keys = [];
  rows.forEach(function (d) { var k = exDrugKey(d); if (!g[k]) { g[k] = []; keys.push(k); } g[k].push(d); });
  keys.sort(function (a, b) { return a === "其他" ? 1 : b === "其他" ? -1 : a < b ? -1 : a > b ? 1 : 0; });
  var out = [];
  keys.forEach(function (k) {
    var list = g[k].slice().sort(function (a, b) { var x = String(a.brand || "").toUpperCase(), y = String(b.brand || "").toUpperCase(); return x < y ? -1 : x > y ? 1 : String(a.code) < String(b.code) ? -1 : 1; });
    var units = list.map(function (d) {
      var nm = String(d.brand || d.chName || d.generic || d.code).trim(), F = exFrag(nm, false), xml = exP(exR(nm + (d.chName && d.chName !== nm ? "（" + d.chName + "）" : "")), { style: "Heading1" });
      var kv = function (label, v, o) { v = String(v || "").trim(); if (v) xml += exP(exR(label + "：", Object.assign({ b: 1 }, o || {})) + exR(v), { after: 40 }); };
      kv("藥品代碼", d.code);
      kv("商品名", d.brand);
      kv("中文名", d.chName);
      kv("學名", d.generic);
      kv("劑型", d.form);
      kv("藥局位置", d.loc);
      kv("各區位置", (d.zones || []).filter(function (z) { return z && z.p; }).map(function (z) { return z.n + " " + z.p; }).join(EX_ZONE_SEP));
      kv("⚠️ 公告", d.notice, { color: "B91C1C" });
      kv("🔍 藥品特徵", d.feat);
      kv("適應症", d.note);
      kv("⚠️ 注意", d.pair, { color: "B91C1C" });
      kv("曾用藥品", d.old);
      exPut(F, xml);
      return F;
    });
    var docs = exPack(units, function () { return exDoc("藥品資料｜" + k, ""); }, null);
    docs.forEach(function (D, i) { D.info = EXP.dinfo + "・這個檔 " + D.n + " 支"; out.push({ name: "藥品資料_" + k + (docs.length > 1 ? "_" + (i + 1) : "") + ".docx", D: D, part: docs.length > 1 ? "（第 " + (i + 1) + "／" + docs.length + " 部分）" : "", n: D.n }); });
  });
  return out;
}

/* ── 一個 Word 檔 → 檔案（zip） ── */
function exStyle(id, name, o) {
  return '<w:style w:type="paragraph" w:styleId="' + id + '"><w:name w:val="' + name + '"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/>' + (o.ui !== undefined ? '<w:uiPriority w:val="' + o.ui + '"/>' : "") + "<w:qFormat/>" +
    "<w:pPr>" + (o.keep ? "<w:keepNext/><w:keepLines/>" : "") + '<w:spacing w:before="' + (o.before || 0) + '" w:after="' + (o.after || 0) + '"/>' + (o.lvl !== undefined ? '<w:outlineLvl w:val="' + o.lvl + '"/>' : "") + "</w:pPr>" +
    "<w:rPr>" + (o.b ? "<w:b/><w:bCs/>" : "") + (o.color ? '<w:color w:val="' + o.color + '"/>' : "") + '<w:sz w:val="' + o.sz + '"/><w:szCs w:val="' + o.sz + '"/></w:rPr></w:style>';
}
var EX_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
function exStylesXml() {
  return EX_HEAD + '<w:styles xmlns:w="' + EX_W + '"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:eastAsia="Microsoft JhengHei" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="en-US" w:eastAsia="zh-TW" w:bidi="ar-SA"/></w:rPr></w:rPrDefault>' +
    '<w:pPrDefault><w:pPr><w:spacing w:after="100" w:line="312" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
    '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>' +
    '<w:style w:type="character" w:default="1" w:styleId="DefaultParagraphFont"><w:name w:val="Default Paragraph Font"/><w:uiPriority w:val="1"/><w:semiHidden/><w:unhideWhenUsed/></w:style>' +
    exStyle("Title", "Title", { ui: 10, b: 1, color: "0B5F8A", sz: 40, after: 60 }) +
    exStyle("Heading1", "heading 1", { ui: 9, keep: 1, b: 1, color: "0B5F8A", sz: 32, before: 360, after: 120, lvl: 0 }) +
    exStyle("Heading2", "heading 2", { ui: 9, keep: 1, b: 1, color: "1F1F1F", sz: 30, before: 240, after: 80, lvl: 1 }) +
    exStyle("Heading3", "heading 3", { ui: 9, keep: 1, b: 1, color: "1F1F1F", sz: 27, before: 200, after: 60, lvl: 2 }) +
    exStyle("Heading4", "heading 4", { ui: 9, keep: 1, b: 1, color: "0B7A75", sz: 25, before: 160, after: 60, lvl: 3 }) +
    exStyle("Heading5", "heading 5", { ui: 9, keep: 1, b: 1, color: "4A5565", sz: 24, before: 120, after: 40, lvl: 4 }) +
    exStyle("Caption", "caption", { ui: 35, color: "4B5563", sz: 20, after: 80 }) +
    exStyle("HbInfo", "藥戰手冊 版本", { color: "6B7280", sz: 18, after: 240 }) +
    exStyle("HbSmall", "藥戰手冊 小字", { color: "4B5563", sz: 19, after: 120 }) +
    "</w:styles>";
}
function exDocXml(D, part) {
  return EX_HEAD + '<w:document xmlns:w="' + EX_W + '" xmlns:r="' + EX_R + '" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>' +
    exHeadXml(D, part) + D.body.join("") +
    '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>';
}
function exDocx(D, part, when) {   // → Promise<Uint8Array>
  var enc = new TextEncoder(), iso = when.toISOString().replace(/\.\d+Z$/, "Z"), exts = {};
  D.imgs.forEach(function (m) { exts[m.ext] = 1; });
  var ct = EX_HEAD + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
    (exts.jpeg ? '<Default Extension="jpeg" ContentType="image/jpeg"/>' : "") + (exts.png ? '<Default Extension="png" ContentType="image/png"/>' : "") +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
    '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>' +
    '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
    '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>';
  var rels = EX_HEAD + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
    '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>';
  var drels = EX_HEAD + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>' +
    D.imgs.map(function (m) { return '<Relationship Id="' + m.rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/' + m.name + '"/>'; }).join("") + "</Relationships>";
  var core = EX_HEAD + '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
    "<dc:title>" + exX(D.title + (part || "")) + "</dc:title><dc:subject>藥戰手冊匯出</dc:subject><dc:creator>藥戰手冊</dc:creator><cp:keywords>藥戰手冊</cp:keywords><dc:description>院內資料，請勿外傳</dc:description><cp:lastModifiedBy>藥戰手冊</cp:lastModifiedBy>" +
    '<dcterms:created xsi:type="dcterms:W3CDTF">' + iso + '</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">' + iso + "</dcterms:modified></cp:coreProperties>";
  var app = EX_HEAD + '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>藥戰手冊</Application></Properties>';
  var settings = EX_HEAD + '<w:settings xmlns:w="' + EX_W + '"><w:zoom w:percent="100"/><w:defaultTabStop w:val="' + EX_IND + '"/><w:characterSpacingControl w:val="compressPunctuation"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>';
  var files = [
    { name: "[Content_Types].xml", data: enc.encode(ct), z: true },
    { name: "_rels/.rels", data: enc.encode(rels), z: true },
    { name: "docProps/core.xml", data: enc.encode(core), z: true },
    { name: "docProps/app.xml", data: enc.encode(app), z: true },
    { name: "word/document.xml", data: enc.encode(exDocXml(D, part)), z: true },
    { name: "word/styles.xml", data: enc.encode(exStylesXml()), z: true },
    { name: "word/settings.xml", data: enc.encode(settings), z: true },
    { name: "word/_rels/document.xml.rels", data: enc.encode(drels), z: true }
  ].concat(D.imgs.map(function (m) { return { name: "word/media/" + m.name, data: m.data, z: false }; }));
  return exZip(files, when);
}

/* ── 圖：向後端拿（一次好幾張）→ 在這裡縮小 ── */
function exDecode(blob) {
  function viaImg() {
    return new Promise(function (ok, bad) {
      var u = URL.createObjectURL(blob), im = new Image();
      im.onload = function () { ok({ src: im, w: im.naturalWidth, h: im.naturalHeight, close: function () { URL.revokeObjectURL(u); } }); };
      im.onerror = function () { URL.revokeObjectURL(u); bad(new Error("圖片打不開")); };
      im.src = u;
    });
  }
  if (typeof createImageBitmap === "function") return createImageBitmap(blob).then(function (bm) { return { src: bm, w: bm.width, h: bm.height, close: function () { try { bm.close(); } catch (e) { /* 沒關係 */ } } }; }, viaImg);
  return viaImg();
}
function exPicPrep(fid, mime, b64) {   // → Promise<{ data, ext, w, h }>
  var raw = exB64(b64);
  return exDecode(new Blob([raw], { type: mime })).then(function (d) {
    var w = d.w, ht = d.h;
    if (!(w > 0 && ht > 0)) { d.close(); throw new Error("圖片打不開"); }
    var big = Math.max(w, ht) > EX_IMG_MAX;
    if (!big && raw.length <= EX_KEEP && (mime === "image/jpeg" || mime === "image/png")) { d.close(); return { data: raw, ext: mime === "image/png" ? "png" : "jpeg", w: w, h: ht }; }
    var sc = big ? EX_IMG_MAX / Math.max(w, ht) : 1, cw = Math.max(1, Math.round(w * sc)), ch = Math.max(1, Math.round(ht * sc));
    var cv = document.createElement("canvas");
    cv.width = cw; cv.height = ch;
    var g = cv.getContext("2d");
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, cw, ch);   // 透明的地方填白色（JPEG 沒有透明）
    g.drawImage(d.src, 0, 0, cw, ch);
    d.close();
    return new Promise(function (ok, bad) {
      cv.toBlob(function (bl) {
        if (!bl) { bad(new Error("圖片轉不了")); return; }
        exBlobBytes(bl).then(function (u) { cv.width = 0; cv.height = 0; ok({ data: u, ext: "jpeg", w: cw, h: ch }); }, bad);
      }, "image/jpeg", EX_IMG_Q);
    });
  });
}
function exPicList(hb, chs) {   // 要放進 Word 的圖（照順序、不重複）
  var out = [], seen = {};
  function add(p) { var k = exFidOf(p); if (k && !seen[k]) { seen[k] = 1; out.push(k); } }
  chs.forEach(function (c) {
    (((hb.titles || {})[c.id]) || []).forEach(function (t) {
      ((t && t.blocks) || []).forEach(function (b) {
        if (!b) return;
        if (b.t === "text" && b.pics) _yzImgIds_(b.v).forEach(function (id) { if (b.pics[id]) add(b.pics[id]); });
        else if (b.t === "img") add(b);
        else if (b.t === "ladder") (b.items || []).forEach(function (it) { if (it && it.img) add(it.img); });
        else if (b.t === "anim" && b.kind === "steps") (b.steps || []).forEach(function (s) { if (s && s.url) add(s); });
        else if (b.t === "anim" && b.url) add(exAnimPic(b));
      });
    });
  });
  return out;
}
function exPicsFetch(list, onStep) {   // 一批一批拿；拿不到的記在 EXP.bad
  var i = 0;
  function next() {
    if (i >= list.length) return Promise.resolve();
    var batch = list.slice(i, i + 12);
    return call("hbExportPics", [batch], { ms: 120000 }).then(function (r) {
      if (r && r.st === "lock") { logout("expired"); throw new Error("驗證過期了，請重新登入"); }
      if (!r || !r.ok) throw new Error(r && r.err || "後端沒有給圖");
      var done = Math.max(1, Math.min(batch.length, +r.done || 0)), got = r.pics || {};
      Object.keys(r.bad || {}).forEach(function (k) { EXP.bad[k] = String(r.bad[k]); });
      return batch.slice(0, done).reduce(function (p, k) {
        return p.then(function () {
          var g = got[k];
          if (!g || !g.b64) { if (!EXP.bad[k]) EXP.bad[k] = "拿不到這張圖"; return; }
          return exPicPrep(k, g.mime, g.b64).then(function (P) { EXP.pics[k] = P; EXP.picBytes += P.data.length; }, function (e) { EXP.bad[k] = e.message || "圖片打不開"; });
        });
      }, Promise.resolve()).then(function () { i += done; onStep(i, list.length); return next(); });
    });
  }
  return next();
}

/* ── 藥品資料：向後端一頁一頁拿 ── */
function exDrugsFetch(onStep) {   // → Promise（結果放在 EXP.drugs、EXP.drows；拿不到：EXP.dErr）
  var rows = [], sig = "", again = 0;
  function page(from) {
    return call("hbExportDrugs", [from], { ms: 120000 }).then(function (r) {
      if (r && r.st === "lock") { logout("expired"); throw new Error("驗證過期了，請重新登入"); }
      if (!r || r.err || !r.ok) { EXP.dErr = (r && r.err) || "後端沒有給藥品資料"; return; }
      if (!from) sig = r.sig;
      else if (r.sig !== sig && again < 2) { again++; rows = []; sig = ""; return page(0); }   // 拿到一半，補藥神器的資料剛好換過：從頭再拿
      rows = rows.concat(r.rows || []);
      onStep(rows.length, r.total || rows.length);
      if (r.next > from && rows.length < 2e4) return page(r.next);
    });
  }
  return page(0).then(function () {
    if (EXP.dErr) return;
    EXP.drows = rows; EXP.drugs = {};
    rows.forEach(function (d) { if (d && d.code) EXP.drugs[String(d.code).toUpperCase()] = d; });
  }, function (e) { EXP.dErr = e.message || "拿不到藥品資料"; });
}
function exHbDrugCodes(hb, chs) {
  var out = [];
  chs.forEach(function (c) { (((hb.titles || {})[c.id]) || []).forEach(function (t) { ((t && t.blocks) || []).forEach(function (b) { if (b && b.t === "drug") (b.items || []).forEach(function (d) { if (d && d.code && out.indexOf(d.code) < 0) out.push(d.code); }); }); }); });
  return out;
}
function exHbDrugsFetch(codes) {   // 手冊裡的藥品卡片：「藥品資料」沒拿到的那幾支，用看手冊的那一支（hbDrugs）補
  var need = codes.filter(function (c) { return !(EXP.drugs && EXP.drugs[c]); }), i = 0;
  function next() {
    if (i >= need.length) return Promise.resolve();
    var q = need.slice(i, i + 30);
    i += 30;
    return call("hbDrugs", [q]).then(function (r) {
      q.forEach(function (c) { var v = r && r.ok && r.rows ? r.rows[c] : null; if (v && !v.down) EXP.dHb[c] = v; });
      return next();
    }, function () { return next(); });
  }
  return next();
}

/* ── 整個流程 ── */
function exUi(pct, msg) {
  var bar = $("#exBarI"), m = $("#exMsg"), pg = $("#exProg");
  if (pg) pg.hidden = false;
  if (bar) bar.style.width = Math.max(2, Math.min(100, Math.round(pct))) + "%";
  if (m) m.textContent = msg + "（" + Math.round((Date.now() - EX.t0) / 1e3) + " 秒）";
  if (typeof act === "function") act();   // 匯出中：一直有在動（不會被閒置登出）
}
function exportGo(opt) {
  if (exBusy() || !MAIN || !IS_DEV) return;
  EX.busy = true; EX.t0 = Date.now(); EX.sid = SESS;
  exClear();
  var go = $(".exgo"), out = $("#exOut"), when = new Date(), stamp = exStampOf(when), sid = SESS;
  if (go) go.disabled = true;
  if (out) out.innerHTML = "";
  EXP = { hb: null, pics: {}, bad: {}, picBytes: 0, drugs: null, drows: null, dErr: "", dHb: {}, zip: typeof CompressionStream === "function", noPics: !opt.pics, info: "", dinfo: "" };
  var files = [], nCh = 0, nPic = 0;
  exUi(1, "讀手冊（後端存好的那一本）…");
  call("hbData", []).then(function (r) {
    if (r && r.st === "lock") { logout("expired"); throw new Error("驗證過期了，請重新登入"); }
    if (!r || !r.data) throw new Error((r && r.err) || "拿不到手冊");
    var hb = EXP.hb = JSON.parse(JSON.stringify(r.data));
    _yzLadderNumberAll_(hb);   // 條文「接續上一段」的號碼
    EXP.info = "藥戰手冊・內容第 " + (hb.rev || 0) + " 版・匯出時間 " + stamp + "・院內資料，請勿外傳";
    EXP.dinfo = "補藥神器藥品資料・匯出時間 " + stamp + "・院內資料，請勿外傳";
    EXP.chs = (hb.chapters || []).filter(function (c) { return c && (((hb.titles || {})[c.id]) || []).length; });
    if (!opt.drugs) return;
    exUi(4, "拿藥品資料（補藥神器）…");
    return exDrugsFetch(function (n, tot) { exUi(4 + 14 * Math.min(1, n / Math.max(1, tot)), "拿藥品資料 " + n + "／" + tot + " 支…"); });
  }).then(function () {
    var codes = exHbDrugCodes(EXP.hb, EXP.chs);
    if (!codes.length) return;
    exUi(19, "拿手冊裡藥品卡片的資料…");
    return exHbDrugsFetch(codes);
  }).then(function () {
    if (!opt.pics) return;
    var list = exPicList(EXP.hb, EXP.chs);
    nPic = list.length;
    if (!list.length) return;
    exUi(20, "拿手冊的圖 0／" + list.length + " 張…");
    return exPicsFetch(list, function (n, tot) { exUi(20 + 55 * n / Math.max(1, tot), "拿手冊的圖 " + n + "／" + tot + " 張（縮小成 Word 用的大小）…"); });
  }).then(function () {
    var jobs = [];
    EXP.chs.forEach(function (c) {
      var ci = (EXP.hb.chapters || []).indexOf(c), ds = exChapterDocs(EXP.hb, c, ci);
      if (ds.length) nCh++;
      jobs = jobs.concat(ds.map(function (x) { x.kind = "hb"; return x; }));
    });
    if (EXP.drows && EXP.drows.length) jobs = jobs.concat(exDrugDocs(EXP.drows).map(function (x) { x.kind = "drug"; return x; }));
    if (!jobs.length) throw new Error("沒有東西可以匯出：手冊還沒有內容" + (opt.drugs ? "，藥品資料也沒拿到（" + (EXP.dErr || "沒有藥") + "）" : ""));
    return jobs.reduce(function (p, x, k) {
      return p.then(function () {
        exUi(76 + 20 * k / jobs.length, "做 Word 檔 " + (k + 1) + "／" + jobs.length + "：" + x.name);
        return exDocx(x.D, x.part, when).then(function (u) { files.push({ name: x.name, data: u, z: false, kind: x.kind, imgs: x.D.imgs.length }); x.D = null; });
      });
    }, Promise.resolve());
  }).then(function () {
    exUi(97, "打包成 zip…");
    return exZip(files, when);
  }).then(function (zipU) {
    if (sid !== SESS || !MAIN) return;   // 中間登出了：什麼都不給
    var zname = "藥戰手冊匯出_" + when.getFullYear() + exZ2(when.getMonth() + 1) + exZ2(when.getDate()) + "-" + exZ2(when.getHours()) + exZ2(when.getMinutes()) + ".zip";
    var blob = new Blob([zipU], { type: "application/zip" });
    EX.url = URL.createObjectURL(blob);
    EX.tm = setTimeout(exClear, 10 * 6e4);
    exDownload(EX.url, zname);
    exUi(100, "好了：已經下載 " + zname);
    exSummary(files, zname, blob.size, nCh, nPic, opt);
    var hbN = files.filter(function (f) { return f.kind === "hb"; }).length, dN = files.length - hbN;
    call("hbExportLog", ["手冊 " + hbN + " 個檔、藥品資料 " + dN + " 個檔、" + exMb(blob.size)]).then(function () { /* 好了 */ }, function () { /* 記不到就算了 */ });
  }).then(function () { EX.busy = false; EXP = null; if (go) go.disabled = false; }, function (e) {
    EX.busy = false; EXP = null;
    if (go) go.disabled = false;
    var m = $("#exMsg");
    if (m) m.textContent = "❌ 匯出沒有完成：" + (e && e.message || e) + "（可以再按一次）";
  });
}
function exDownload(url, name) {
  var a = h("a", { href: url, download: name, style: "display:none" });
  document.body.appendChild(a);
  try { a.click(); } catch (e) { /* 下面還有「再下載一次」 */ }
  setTimeout(function () { a.remove(); }, 1000);
}
function exClear() {   // 收掉上一次的 zip（記憶體裡的）
  clearTimeout(EX.tm);
  if (EX.url) { try { URL.revokeObjectURL(EX.url); } catch (e) { /* 沒關係 */ } EX.url = ""; }
  var a = $(".exagain");
  if (a) a.replaceWith(h("span", { class: "muted" }, ["（zip 已經收掉了；要的話再匯出一次）"]));
}
function exSummary(files, zname, size, nCh, nPic, opt) {
  var out = $("#exOut"); if (!out) return;
  out.innerHTML = "";
  var hbF = files.filter(function (f) { return f.kind === "hb"; }), dF = files.filter(function (f) { return f.kind === "drug"; });
  var nImg = Object.keys(EXP.pics).length, nBad = Object.keys(EXP.bad).length, big = files.filter(function (f) { return f.data.length > 7e6; });
  var lines = [
    "✅ 手冊：" + nCh + " 章 → " + hbF.length + " 個 Word 檔" + (opt.pics ? "（圖 " + nImg + " 張" + (nBad ? "，" + nBad + " 張沒放進來" : "") + "）" : "（沒有放圖）"),
    opt.drugs ? (EXP.dErr ? "⚠️ 藥品資料沒有匯出：" + EXP.dErr : "✅ 藥品資料：" + (EXP.drows || []).length + " 支 → " + dF.length + " 個 Word 檔（依英文字母分）") : "（這次沒有匯出藥品資料）",
    "📦 " + zname + "（" + exMb(size) + "）"
  ];
  out.appendChild(h("div", { class: "exsum" }, lines.map(function (t) { return h("div", {}, [t]); })));
  if (nBad) {
    var why = {}; Object.keys(EXP.bad).forEach(function (k) { why[EXP.bad[k]] = (why[EXP.bad[k]] || 0) + 1; });
    out.appendChild(h("p", { class: "hint" }, ["沒放進來的圖：" + Object.keys(why).map(function (w) { return w + " " + why[w] + " 張"; }).join("、") + "。Word 裡在那個位置寫了［圖片…］，圖片裡的字照樣有寫進去。可以到「✏️ 編輯」的圖片檢查看看是哪幾張。"]));
  }
  if (big.length) out.appendChild(h("p", { class: "hint warn" }, ["⚠️ 有 " + big.length + " 個檔超過 7 MB（" + big.map(function (f) { return f.name; }).join("、") + "）：沒有 Microsoft 365 Copilot 授權的話，Copilot 不會讀這幾個。"]));
  out.appendChild(h("details", { class: "exfiles" }, [h("summary", {}, ["看 zip 裡的檔（" + files.length + " 個）"]), h("ul", {}, files.map(function (f) { return h("li", {}, [f.name + "　" + exMb(f.data.length)]); }))]));
  out.appendChild(h("div", { class: "acts" }, [h("a", { class: "btn sm exagain", href: EX.url, download: zname }, ["⬇️ 沒有自動下載：按這裡"])]));
  out.appendChild(h("ol", { class: "hint exnext" }, [
    h("li", {}, ["把 zip 解壓縮（按右鍵 →「解壓縮全部」）。"]),
    h("li", {}, ["打開 SharePoint 的「藥戰手冊」網站 →「文件」→「手冊匯出」資料夾：先把舊的 Word 檔全部刪掉，再把這次解開的 Word 檔全部拖進去。"]),
    h("li", {}, ["放好以後，把電腦裡的 zip 和解開的資料夾刪掉（裡面是手冊的全部內容，不要寄給別人、不要留在公用電腦）。"])]));
}
function drawExport() {   // 管理頁「⑦ 📤 匯出給 Copilot」
  var box = $("#exBox"); if (!box) return;
  if (box.firstChild) { exDirtyNote(); return; }   // 畫過了：不要重畫（匯出中的進度、上一次的結果會不見）
  box.appendChild(h("p", { class: "hint", style: "margin-top:0" }, ["把整本手冊（每章一個 Word 檔，含圖片）和補藥神器的藥品資料（依英文字母分檔，含藥局位置）打包成一個 zip 下載。放到院內 SharePoint「藥戰手冊」網站的「手冊匯出」資料夾，Copilot Studio 就讀得到。"]));
  var cPic = h("input", { type: "checkbox", id: "exPic", checked: true }), cDrug = h("input", { type: "checkbox", id: "exDrug", checked: true });
  box.appendChild(h("div", { class: "exopts" }, [h("label", {}, [cPic, " 含圖片（比較慢、檔案比較大）"]), h("label", {}, [cDrug, " 含藥品資料（補藥神器）"])]));
  box.appendChild(h("p", { class: "hint warn", id: "exDirty", hidden: true }, ["⚠️ 編輯器裡有還沒儲存的修改：匯出的是已經儲存的內容。要一起匯出，先到「✏️ 編輯」按儲存。"]));
  box.appendChild(h("div", { class: "acts" }, [btn("📤 開始匯出（下載 zip）", function () { exportGo({ pics: cPic.checked, drugs: cDrug.checked }); }, "pri exgo")]));
  box.appendChild(h("div", { id: "exProg", class: "exprog", hidden: true }, [h("div", { class: "exbar", "aria-hidden": "true" }, [h("i", { id: "exBarI" })]), h("div", { id: "exMsg", class: "hint", role: "status", "aria-live": "polite" })]));
  box.appendChild(h("div", { id: "exOut" }));
  box.appendChild(h("ul", { class: "hint", style: "margin:8px 0 0;padding-left:1.2em" }, [
    h("li", {}, ["匯出的是已經儲存的內容；還沒有內容的章不匯出。每個 Word 檔最上面寫了內容第幾版、匯出時間。"]),
    h("li", {}, ["一個檔超過約 6.5 MB 會自動分成 _1、_2（沒有 Microsoft 365 Copilot 授權時，Copilot 只讀 7 MB 以下的檔）。"]),
    h("li", {}, ["藥品資料要先把補藥神器 LINE 專案的 05 換成第 37 批的版本才拿得到；手冊照樣可以匯出。"]),
    h("li", {}, ["之後手冊改了，再匯出一次：SharePoint 那邊先刪掉舊的 Word 檔，再放這次的。"])]));
  exDirtyNote();
}
function exDirtyNote() { var n = $("#exDirty"); if (n) n.hidden = !(typeof ED !== "undefined" && ED && ED.dirty); }

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
