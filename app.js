/* 補藥神器網頁 v11.22.2 beta（藥品查詢）：畫面在 GitHub，資料由網頁專案的 API 給（見 index.html 的安全設定）。這個檔沒有任何秘密。 */
/* ===== 驗證碼輸入（v11.22.2 beta）=====
   LINE 給的驗證碼是 4 個漢字。這一段幫人「打什麼都認得」：
   ① 直接打漢字（用注音／拼音輸入法選字）　② 打注音符號（ㄨㄛˇ）　③ 打拼音＋聲調數字（wo3）或帶聲調符號（wǒ）
   ④ 忘了切換輸入法，打成一串字母數字（大千鍵盤：我愛你＝ji394su3）
   全部在瀏覽器裡轉回漢字；送給後端的永遠只有轉好的 4 個漢字。
   ★ 這裡的「認得很多種寫法」只是輸入方便，不是安全的來源：安全靠字庫大小、驗證碼只認出代號的那個網頁、代號出現後 2 分鐘內、只能用一次、每組代號錯 5 次就作廢。 */
var CodeIn = (function () {
  "use strict";
  // 字庫（468 字）：「字＋注音＋拼音」。★ 跟 LINE 專案 09_網頁版.gs 的 LC_POOL 要一模一樣（codepool_test 會比）
  var POOL = /*POOL*/"安ㄢān 案ㄢˋàn 傲ㄠˋào 拔ㄅㄚˊbá 白ㄅㄞˊbái 拜ㄅㄞˋbài 班ㄅㄢbān 板ㄅㄢˇbǎn 拌ㄅㄢˋbàn 邦ㄅㄤbāng 棒ㄅㄤˋbàng 胞ㄅㄠbāo 保ㄅㄠˇbǎo 抱ㄅㄠˋbào 杯ㄅㄟbēi 北ㄅㄟˇběi 倍ㄅㄟˋbèi 本ㄅㄣˇběn 鼻ㄅㄧˊbí 必ㄅㄧˋbì 鞭ㄅㄧㄢbiān 辨ㄅㄧㄢˋbiàn 表ㄅㄧㄠˇbiǎo 冰ㄅㄧㄥbīng 波ㄅㄛbō 博ㄅㄛˊbó 步ㄅㄨˋbù 擦ㄘㄚcā 材ㄘㄞˊcái 菜ㄘㄞˋcài 餐ㄘㄢcān 操ㄘㄠcāo 草ㄘㄠˇcǎo 策ㄘㄜˋcè 查ㄔㄚˊchá 拆ㄔㄞchāi 柴ㄔㄞˊchái 昌ㄔㄤchāng 常ㄔㄤˊcháng 唱ㄔㄤˋchàng 潮ㄔㄠˊcháo 扯ㄔㄜˇchě 沉ㄔㄣˊchén 成ㄔㄥˊchéng 池ㄔˊchí 尺ㄔˇchǐ 赤ㄔˋchì 充ㄔㄨㄥchōng 抽ㄔㄡchōu 出ㄔㄨchū 除ㄔㄨˊchú 楚ㄔㄨˇchǔ 穿ㄔㄨㄢchuān 船ㄔㄨㄢˊchuán 串ㄔㄨㄢˋchuàn 窗ㄔㄨㄤchuāng 吹ㄔㄨㄟchuī 垂ㄔㄨㄟˊchuí 春ㄔㄨㄣchūn 磁ㄘˊcí 刺ㄘˋcì 粗ㄘㄨcū 促ㄘㄨˋcù 翠ㄘㄨㄟˋcuì 存ㄘㄨㄣˊcún 搭ㄉㄚdā 代ㄉㄞˋdài 淡ㄉㄢˋdàn 道ㄉㄠˋdào 德ㄉㄜˊdé 登ㄉㄥdēng 等ㄉㄥˇděng 低ㄉㄧdī 底ㄉㄧˇdǐ 地ㄉㄧˋdì 典ㄉㄧㄢˇdiǎn 店ㄉㄧㄢˋdiàn 雕ㄉㄧㄠdiāo 吊ㄉㄧㄠˋdiào 鼎ㄉㄧㄥˇdǐng 定ㄉㄧㄥˋdìng 懂ㄉㄨㄥˇdǒng 洞ㄉㄨㄥˋdòng 豆ㄉㄡˋdòu 渡ㄉㄨˋdù 端ㄉㄨㄢduān 短ㄉㄨㄢˇduǎn 段ㄉㄨㄢˋduàn 多ㄉㄨㄛduō 舵ㄉㄨㄛˋduò 而ㄦˊér 耳ㄦˇěr 法ㄈㄚˇfǎ 翻ㄈㄢfān 繁ㄈㄢˊfán 反ㄈㄢˇfǎn 泛ㄈㄢˋfàn 方ㄈㄤfāng 防ㄈㄤˊfáng 放ㄈㄤˋfàng 非ㄈㄟfēi 肥ㄈㄟˊféi 肺ㄈㄟˋfèi 粉ㄈㄣˇfěn 份ㄈㄣˋfèn 封ㄈㄥfēng 逢ㄈㄥˊféng 奉ㄈㄥˋfèng 服ㄈㄨˊfú 俯ㄈㄨˇfǔ 附ㄈㄨˋfù 改ㄍㄞˇgǎi 概ㄍㄞˋgài 甘ㄍㄢgān 感ㄍㄢˇgǎn 港ㄍㄤˇgǎng 高ㄍㄠgāo 告ㄍㄠˋgào 歌ㄍㄜgē 隔ㄍㄜˊgé 各ㄍㄜˋgè 根ㄍㄣgēn 耕ㄍㄥgēng 梗ㄍㄥˇgěng 公ㄍㄨㄥgōng 拱ㄍㄨㄥˇgǒng 狗ㄍㄡˇgǒu 孤ㄍㄨgū 鼓ㄍㄨˇgǔ 瓜ㄍㄨㄚguā 怪ㄍㄨㄞˋguài 管ㄍㄨㄢˇguǎn 灌ㄍㄨㄢˋguàn 光ㄍㄨㄤguāng 桂ㄍㄨㄟˋguì 果ㄍㄨㄛˇguǒ 孩ㄏㄞˊhái 海ㄏㄞˇhǎi 寒ㄏㄢˊhán 喊ㄏㄢˇhǎn 航ㄏㄤˊháng 毫ㄏㄠˊháo 耗ㄏㄠˋhào 合ㄏㄜˊhé 黑ㄏㄟhēi 衡ㄏㄥˊhéng 洪ㄏㄨㄥˊhóng 猴ㄏㄡˊhóu 候ㄏㄡˋhòu 呼ㄏㄨhū 胡ㄏㄨˊhú 虎ㄏㄨˇhǔ 花ㄏㄨㄚhuā 滑ㄏㄨㄚˊhuá 幻ㄏㄨㄢˋhuàn 荒ㄏㄨㄤhuāng 灰ㄏㄨㄟhuī 回ㄏㄨㄟˊhuí 惠ㄏㄨㄟˋhuì 婚ㄏㄨㄣhūn 活ㄏㄨㄛˊhuó 惑ㄏㄨㄛˋhuò 激ㄐㄧjī 及ㄐㄧˊjí 季ㄐㄧˋjì 家ㄐㄧㄚjiā 架ㄐㄧㄚˋjià 肩ㄐㄧㄢjiān 建ㄐㄧㄢˋjiàn 叫ㄐㄧㄠˋjiào 街ㄐㄧㄝjiē 截ㄐㄧㄝˊjié 界ㄐㄧㄝˋjiè 筋ㄐㄧㄣjīn 近ㄐㄧㄣˋjìn 景ㄐㄧㄥˇjǐng 敬ㄐㄧㄥˋjìng 就ㄐㄧㄡˋjiù 矩ㄐㄩˇjǔ 句ㄐㄩˋjù 君ㄐㄩㄣjūn 楷ㄎㄞˇkǎi 堪ㄎㄢkān 考ㄎㄠˇkǎo 靠ㄎㄠˋkào 科ㄎㄜkē 可ㄎㄜˇkě 克ㄎㄜˋkè 肯ㄎㄣˇkěn 坑ㄎㄥkēng 孔ㄎㄨㄥˇkǒng 控ㄎㄨㄥˋkòng 扣ㄎㄡˋkòu 快ㄎㄨㄞˋkuài 款ㄎㄨㄢˇkuǎn 匡ㄎㄨㄤkuāng 愧ㄎㄨㄟˋkuì 坤ㄎㄨㄣkūn 拉ㄌㄚlā 狼ㄌㄤˊláng 朗ㄌㄤˇlǎng 老ㄌㄠˇlǎo 雷ㄌㄟˊléi 磊ㄌㄟˇlěi 理ㄌㄧˇlǐ 利ㄌㄧˋlì 廉ㄌㄧㄢˊlián 良ㄌㄧㄤˊliáng 亮ㄌㄧㄤˋliàng 陵ㄌㄧㄥˊlíng 令ㄌㄧㄥˋlìng 流ㄌㄧㄡˊliú 柳ㄌㄧㄡˇliǔ 漏ㄌㄡˋlòu 路ㄌㄨˋlù 卵ㄌㄨㄢˇluǎn 螺ㄌㄨㄛˊluó 履ㄌㄩˇlǚ 律ㄌㄩˋlǜ 麻ㄇㄚˊmá 漫ㄇㄢˋmàn 忙ㄇㄤˊmáng 毛ㄇㄠˊmáo 冒ㄇㄠˋmào 眉ㄇㄟˊméi 美ㄇㄟˇměi 盟ㄇㄥˊméng 猛ㄇㄥˇměng 米ㄇㄧˇmǐ 密ㄇㄧˋmì 棉ㄇㄧㄢˊmián 免ㄇㄧㄢˇmiǎn 苗ㄇㄧㄠˊmiáo 妙ㄇㄧㄠˋmiào 民ㄇㄧㄣˊmín 名ㄇㄧㄥˊmíng 命ㄇㄧㄥˋmìng 摩ㄇㄛˊmó 莫ㄇㄛˋmò 母ㄇㄨˇmǔ 暮ㄇㄨˋmù 奈ㄋㄞˋnài 南ㄋㄢˊnán 能ㄋㄥˊnéng 尼ㄋㄧˊní 你ㄋㄧˇnǐ 逆ㄋㄧˋnì 年ㄋㄧㄢˊnián 念ㄋㄧㄢˋniàn 凝ㄋㄧㄥˊníng 扭ㄋㄧㄡˇniǔ 暖ㄋㄨㄢˇnuǎn 女ㄋㄩˇnǚ 偶ㄡˇǒu 排ㄆㄞˊpái 派ㄆㄞˋpài 攀ㄆㄢpān 旁ㄆㄤˊpáng 配ㄆㄟˋpèi 盆ㄆㄣˊpén 蓬ㄆㄥˊpéng 披ㄆㄧpī 皮ㄆㄧˊpí 篇ㄆㄧㄢpiān 票ㄆㄧㄠˋpiào 品ㄆㄧㄣˇpǐn 聘ㄆㄧㄣˋpìn 平ㄆㄧㄥˊpíng 妻ㄑㄧqī 其ㄑㄧˊqí 起ㄑㄧˇqǐ 器ㄑㄧˋqì 前ㄑㄧㄢˊqián 腔ㄑㄧㄤqiāng 敲ㄑㄧㄠqiāo 巧ㄑㄧㄠˇqiǎo 琴ㄑㄧㄣˊqín 青ㄑㄧㄥqīng 情ㄑㄧㄥˊqíng 秋ㄑㄧㄡqiū 求ㄑㄧㄡˊqiú 渠ㄑㄩˊqú 取ㄑㄩˇqǔ 去ㄑㄩˋqù 全ㄑㄩㄢˊquán 券ㄑㄩㄢˋquàn 缺ㄑㄩㄝquē 然ㄖㄢˊrán 染ㄖㄢˇrǎn 忍ㄖㄣˇrěn 任ㄖㄣˋrèn 容ㄖㄨㄥˊróng 柔ㄖㄡˊróu 如ㄖㄨˊrú 若ㄖㄨㄛˋruò 桑ㄙㄤsāng 砂ㄕㄚshā 衫ㄕㄢshān 善ㄕㄢˋshàn 商ㄕㄤshāng 尚ㄕㄤˋshàng 梢ㄕㄠshāo 舌ㄕㄜˊshé 射ㄕㄜˋshè 身ㄕㄣshēn 神ㄕㄣˊshén 生ㄕㄥshēng 剩ㄕㄥˋshèng 施ㄕshī 石ㄕˊshí 使ㄕˇshǐ 事ㄕˋshì 收ㄕㄡshōu 手ㄕㄡˇshǒu 受ㄕㄡˋshòu 疏ㄕㄨshū 暑ㄕㄨˇshǔ 束ㄕㄨˋshù 刷ㄕㄨㄚshuā 衰ㄕㄨㄞshuāi 霜ㄕㄨㄤshuāng 爽ㄕㄨㄤˇshuǎng 水ㄕㄨㄟˇshuǐ 睡ㄕㄨㄟˋshuì 思ㄙsī 松ㄙㄨㄥsōng 送ㄙㄨㄥˋsòng 搜ㄙㄡsōu 俗ㄙㄨˊsú 素ㄙㄨˋsù 酸ㄙㄨㄢsuān 算ㄙㄨㄢˋsuàn 所ㄙㄨㄛˇsuǒ 踏ㄊㄚˋtà 泰ㄊㄞˋtài 探ㄊㄢˋtàn 堂ㄊㄤˊtáng 滔ㄊㄠtāo 桃ㄊㄠˊtáo 套ㄊㄠˋtào 特ㄊㄜˋtè 藤ㄊㄥˊténg 替ㄊㄧˋtì 天ㄊㄧㄢtiān 填ㄊㄧㄢˊtián 跳ㄊㄧㄠˋtiào 庭ㄊㄧㄥˊtíng 通ㄊㄨㄥtōng 同ㄊㄨㄥˊtóng 投ㄊㄡˊtóu 透ㄊㄡˋtòu 徒ㄊㄨˊtú 推ㄊㄨㄟtuī 腿ㄊㄨㄟˇtuǐ 退ㄊㄨㄟˋtuì 瓦ㄨㄚˇwǎ 歪ㄨㄞwāi 外ㄨㄞˋwài 丸ㄨㄢˊwán 晚ㄨㄢˇwǎn 望ㄨㄤˋwàng 威ㄨㄟwēi 味ㄨㄟˋwèi 文ㄨㄣˊwén 翁ㄨㄥwēng 我ㄨㄛˇwǒ 握ㄨㄛˋwò 舞ㄨˇwǔ 物ㄨˋwù 西ㄒㄧxī 席ㄒㄧˊxí 洗ㄒㄧˇxǐ 隙ㄒㄧˋxì 夏ㄒㄧㄚˋxià 弦ㄒㄧㄢˊxián 香ㄒㄧㄤxiāng 祥ㄒㄧㄤˊxiáng 想ㄒㄧㄤˇxiǎng 巷ㄒㄧㄤˋxiàng 消ㄒㄧㄠxiāo 笑ㄒㄧㄠˋxiào 鞋ㄒㄧㄝˊxié 屑ㄒㄧㄝˋxiè 新ㄒㄧㄣxīn 信ㄒㄧㄣˋxìn 星ㄒㄧㄥxīng 形ㄒㄧㄥˊxíng 醒ㄒㄧㄥˇxǐng 姓ㄒㄧㄥˋxìng 兄ㄒㄩㄥxiōng 雄ㄒㄩㄥˊxióng 休ㄒㄧㄡxiū 秀ㄒㄧㄡˋxiù 序ㄒㄩˋxù 玄ㄒㄩㄢˊxuán 雪ㄒㄩㄝˇxuě 循ㄒㄩㄣˊxún 牙ㄧㄚˊyá 雅ㄧㄚˇyǎ 言ㄧㄢˊyán 眼ㄧㄢˇyǎn 雁ㄧㄢˋyàn 羊ㄧㄤˊyáng 仰ㄧㄤˇyǎng 腰ㄧㄠyāo 野ㄧㄝˇyě 夜ㄧㄝˋyè 依ㄧyī 疑ㄧˊyí 以ㄧˇyǐ 意ㄧˋyì 音ㄧㄣyīn 吟ㄧㄣˊyín 引ㄧㄣˇyǐn 印ㄧㄣˋyìn 迎ㄧㄥˊyíng 影ㄧㄥˇyǐng 硬ㄧㄥˋyìng 勇ㄩㄥˇyǒng 用ㄩㄥˋyòng 幽ㄧㄡyōu 油ㄧㄡˊyóu 有ㄧㄡˇyǒu 幼ㄧㄡˋyòu 雨ㄩˇyǔ 欲ㄩˋyù 原ㄩㄢˊyuán 院ㄩㄢˋyuàn 月ㄩㄝˋyuè 在ㄗㄞˋzài 遭ㄗㄠzāo 早ㄗㄠˇzǎo 燥ㄗㄠˋzào 增ㄗㄥzēng 摘ㄓㄞzhāi 站ㄓㄢˋzhàn 章ㄓㄤzhāng 掌ㄓㄤˇzhǎng 障ㄓㄤˋzhàng 招ㄓㄠzhāo 找ㄓㄠˇzhǎo 照ㄓㄠˋzhào 遮ㄓㄜzhē 真ㄓㄣzhēn 振ㄓㄣˋzhèn 蒸ㄓㄥzhēng 整ㄓㄥˇzhěng 正ㄓㄥˋzhèng 知ㄓzhī 直ㄓˊzhí 指ㄓˇzhǐ 制ㄓˋzhì 忠ㄓㄨㄥzhōng 舟ㄓㄡzhōu 肘ㄓㄡˇzhǒu 珠ㄓㄨzhū 竹ㄓㄨˊzhú 助ㄓㄨˋzhù 追ㄓㄨㄟzhuī 桌ㄓㄨㄛzhuō 姿ㄗzī 自ㄗˋzì 宗ㄗㄨㄥzōng 足ㄗㄨˊzú 阻ㄗㄨˇzǔ 嘴ㄗㄨㄟˇzuǐ 尊ㄗㄨㄣzūn 作ㄗㄨㄛˋzuò"/*/POOL*/;

  // 大千鍵盤：注音符號 → 按鍵
  var DC = { "ㄅ": "1", "ㄆ": "q", "ㄇ": "a", "ㄈ": "z", "ㄉ": "2", "ㄊ": "w", "ㄋ": "s", "ㄌ": "x", "ㄍ": "e", "ㄎ": "d", "ㄏ": "c", "ㄐ": "r", "ㄑ": "f", "ㄒ": "v", "ㄓ": "5", "ㄔ": "t", "ㄕ": "g", "ㄖ": "b", "ㄗ": "y", "ㄘ": "h", "ㄙ": "n", "ㄧ": "u", "ㄨ": "j", "ㄩ": "m", "ㄚ": "8", "ㄛ": "i", "ㄜ": "k", "ㄝ": ",", "ㄞ": "9", "ㄟ": "o", "ㄠ": "l", "ㄡ": ".", "ㄢ": "0", "ㄣ": "p", "ㄤ": ";", "ㄥ": "/", "ㄦ": "-" };
  var DCR = {}; for (var zk in DC) DCR[DC[zk]] = zk;
  var TKEY = { 3: "3", 4: "4", 6: "6", 7: "7" };              // 大千的聲調鍵：ˇ3 ˋ4 ˊ6 ˙7（第一聲＝空白／不按）
  var TMARK = { 2: "\u02ca", 3: "\u02c7", 4: "\u02cb" };    // ˊ ˇ ˋ
  var MARK_T = { "\u02ca": 2, "\u02c7": 3, "\u02cb": 4 };
  var PYV = { "ā": ["a", 1], "á": ["a", 2], "ǎ": ["a", 3], "à": ["a", 4], "ē": ["e", 1], "é": ["e", 2], "ě": ["e", 3], "è": ["e", 4], "ī": ["i", 1], "í": ["i", 2], "ǐ": ["i", 3], "ì": ["i", 4], "ō": ["o", 1], "ó": ["o", 2], "ǒ": ["o", 3], "ò": ["o", 4], "ū": ["u", 1], "ú": ["u", 2], "ǔ": ["u", 3], "ù": ["u", 4], "ǖ": ["v", 1], "ǘ": ["v", 2], "ǚ": ["v", 3], "ǜ": ["v", 4] };

  function mk() { return Object.create(null); }
  var E = [], BYC = mk(), FZ = mk(), FP = mk(), FD = mk(), PRE = { z: mk(), p: mk(), d: mk() };

  // ── 字庫拆開 ──
  (function () {
    var ws = POOL.split(" ");
    for (var i = 0; i < ws.length; i++) {
      var m = /^([\u3400-\u9fff])([\u3105-\u312f]+)([\u02ca\u02c7\u02cb]?)([a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+)$/.exec(ws[i]);
      if (!m) continue;
      var py = m[4], pb = "", tone = 0;
      for (var k = 0; k < py.length; k++) {
        var ch = py.charAt(k), v = PYV[ch];
        if (v) { pb += v[0]; tone = v[1]; } else pb += (ch === "ü" ? "v" : ch);
      }
      var t = m[3] ? MARK_T[m[3]] : 1;
      if (tone && tone !== t) continue;                            // 注音與拼音聲調對不上（不該發生）
      var dc = ""; for (var q = 0; q < m[2].length; q++) dc += DC[m[2].charAt(q)] || "?";
      var e = { c: m[1], z: m[2], t: t, zy: m[2] + (m[3] || ""), py: py, pb: pb, dc: dc };
      BYC[e.c] = E.length; E.push(e);
    }
  })();

  // ── 各種寫法 → 字庫裡的哪些字 ──
  // 形式表：寫法 → { e: [字庫序號…], x: 是否「聲調講清楚了」}
  function put(map, key, idx, exact) {
    var m = map[key]; if (!m) m = map[key] = { e: [], x: true };
    if (m.e.indexOf(idx) < 0) m.e.push(idx);
    if (!exact) m.x = false;
  }
  (function () {
    var byZ = mk(), byP = mk(), i;
    for (i = 0; i < E.length; i++) {
      var e = E[i];
      (byZ[e.z] || (byZ[e.z] = [])).push(i); (byP[e.pb] || (byP[e.pb] = [])).push(i);
      if (e.t > 1) put(FZ, e.zy, i, true);                         // ㄋㄧˇ
      put(FP, e.pb + e.t, i, true); put(FP, e.py, i, true);        // ni3、nǐ
      put(FD, e.dc + (e.t === 1 ? "" : (e.t === 2 ? "6" : String(e.t))), i, true);   // su3（第一聲不按聲調鍵）
    }
    var k, j, L, f;
    for (k in byZ) {                                               // ㄋㄧ（沒標聲調＝第一聲；字庫裡沒有第一聲的字，就當「不確定」猜是哪個聲調）
      f = []; for (j = 0; j < byZ[k].length; j++) if (E[byZ[k][j]].t === 1) f.push(byZ[k][j]);
      if (f.length) for (j = 0; j < f.length; j++) put(FZ, k, f[j], true);
      else for (j = 0; j < byZ[k].length; j++) put(FZ, k, byZ[k][j], false);
    }
    for (k in byP) for (j = 0; j < byP[k].length; j++) put(FP, k, byP[k][j], false);   // ni（沒打聲調）
    var maps = { z: FZ, p: FP, d: FD };
    for (var st in maps) for (k in maps[st]) for (L = 1; L <= k.length; L++) PRE[st][k.slice(0, L)] = 1;   // 「打到一半」用
  })();

  // ── 輸入整理 ──
  // 隱形字元：能用 Unicode 屬性（\p{Cf}＝所有「格式控制」字元）就用；舊瀏覽器不認得 \p{} 的語法，退回手列的清單（寫成字串、不會讓整支 app.js 解析失敗）
  var INVIS; try { INVIS = new RegExp("[\\p{Cf}\\u2028\\u2029\\u034f\\u115f\\u1160\\u3164\\uffa0\\ufe00-\\ufe0f]", "gu"); } catch (e) { INVIS = /[\u00ad\u0600-\u0605\u061c\u06dd\u070f\u0890\u0891\u08e2\u180e\u200b-\u200f\u202a-\u202e\u2060-\u2064\u2066-\u206f\u2028\u2029\u034f\u115f\u1160\u3164\uffa0\ufe00-\ufe0f\ufeff\ufff9-\ufffb]/g; }
  function norm(raw) {
    var s = String(raw == null ? "" : raw);
    s = s.replace(/[\u00b4\u2032]/g, "\u02ca").replace(/[`\uff40]/g, "\u02cb").replace(/\u3002/g, ".").replace(/[\u00af\u02c9]/g, "").replace(/\u02d9/g, "\ue000");
    try { s = s.normalize("NFKC"); } catch (e) { }
    if (/[\u3105-\u312f]/.test(s)) s = s.replace(/\u4e00/g, "\u3127").replace(/\u4e42/g, "\u3128").replace(/\u51f5/g, "\u3129");   // 注音旁邊的「一乂凵」多半是長得像的 ㄧㄨㄩ
    s = s.replace(INVIS, "")                                                                                               // 隱形字元（格式控制、變體選擇、填充字元）
         .replace(/['\u2018\u2019\u02bc_\u00b7\u30fb\u3001\u300c-\u300f\u201c\u201d"()\[\]]/g, " ")                              // 撇號（xi'an）、引號、括號、頓號 當分隔
         .replace(/([\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])[,.;:\/\-]+(?=[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])/g, "$1 ")   // 漢字和漢字中間的標點（, . ; : / -）當分隔（兩邊都是漢字才算，不碰大千鍵盤的 , . ; / -）
         .replace(/([\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff])[.,;:!?]+$/, "$1")                                                           // 最後一個漢字後面的句點、逗號
         .replace(/[\s\u3000]+/g, " ").replace(/^ +| +$/g, "");
    s = s.toLowerCase().replace(/\u00fc|u:/g, "v");
    return s.length > 64 ? s.slice(0, 64) : s;
  }
  function isHan(c) { return /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/.test(c); }
  function isZhu(c) { return c >= "\u3105" && c <= "\u312f"; }

  // 找不到字庫裡的字時，只為了「告訴人哪裡看不懂」而把一小段讀成注音（不用來登入）
  var GZ = /^[\u3105-\u3119]?[\u3127-\u3129]?[\u311a-\u3126]?[\u02ca\u02c7\u02cb\ue000]?/;
  var GD = /^([1qaz2wsxedcrfv5tgbyhn])?([ujm])?([8ik,9ol.0;p\/\-])?([3467])?/;
  var GP = /^[a-zv]{1,6}[1-5]?/;
  function dcToZy(raw) {
    var o = "";
    for (var i = 0; i < raw.length; i++) {
      var c = raw.charAt(i);
      if (c === "3") o += "\u02c7"; else if (c === "4") o += "\u02cb"; else if (c === "6") o += "\u02ca"; else if (c === "7") o += "\u02d9"; else o += DCR[c] || c;
    }
    return o;
  }

  function lex(map, s, i, kind, st, out) {
    for (var L = 1; L <= 8 && i + L <= s.length; L++) {
      var key = s.substr(i, L), m = map[key];
      if (!m) continue;
      var nc = s.charAt(i + L);
      // 沒寫聲調的寫法，後面卻緊接著聲調符號／聲調鍵，那其實是另一個（字庫裡沒有的）音，不能當成「沒打聲調」
      if (kind === "z" && /[\u02ca\u02c7\u02cb\ue000]/.test(nc) && !/[\u02ca\u02c7\u02cb]$/.test(key)) continue;
      if (kind === "p" && /[0-9]/.test(nc) && !/[0-9]$/.test(key)) continue;
      if (kind === "d" && /[3467]/.test(nc) && !/[3467]$/.test(key)) continue;
      out.push({ len: L, st: st, tok: { k: kind, raw: key, e: m.e, x: m.x, bad: false } });
    }
  }
  function next(s, i, st, gen) {
    var c = s.charAt(i), out = [], g, ix;
    if (isHan(c)) {
      ix = BYC[c];
      out.push({ len: 1, st: st, tok: { k: "h", raw: c, e: ix === undefined ? [] : [ix], x: true, bad: ix === undefined } });
      return out;
    }
    if (isZhu(c)) {
      lex(FZ, s, i, "z", st, out);
      if (!out.length && gen) { g = GZ.exec(s.slice(i, i + 6))[0]; if (g) out.push({ len: g.length, st: st, tok: { k: "z", raw: g, e: [], x: true, bad: true, rd: g } }); }
      return out;
    }
    if (st !== "d") lex(FP, s, i, "p", "p", out);
    if (st !== "p") lex(FD, s, i, "d", "d", out);
    if (!out.length && gen) {
      if (st !== "p") { g = GD.exec(s.slice(i, i + 5))[0]; if (g && !/^[3467]$/.test(g)) out.push({ len: g.length, st: "d", tok: { k: "d", raw: g, e: [], x: true, bad: true, rd: dcToZy(g) } }); }
      if (st !== "d") { g = GP.exec(s.slice(i, i + 8)); if (g) out.push({ len: g[0].length, st: "p", tok: { k: "p", raw: g[0], e: [], x: true, bad: true, rd: g[0] } }); }
    }
    return out;
  }

  function cost(toks) {                       // 越小越好：看不懂的 < 沒打聲調、靠猜的 < 字數少的
    var g = 0, u = 0;
    for (var i = 0; i < toks.length; i++) { if (toks[i].bad) g++; else if (!toks[i].x) u++; }
    return [g, u, -toks.length];
  }
  function cmp(a, b) { for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; }

  function search(s, cap, gen) {
    var covers = [], dead = [], deadI = -1, steps = 0;
    function rec(i, toks, st) {
      if (++steps > 6000) return;
      while (i < s.length && s.charAt(i) === " ") i++;
      if (i >= s.length) { covers.push({ toks: toks.slice(), st: st }); return; }
      var nx = toks.length >= cap ? [] : next(s, i, st, gen);
      if (!nx.length) {
        if (i > deadI) { deadI = i; dead = []; }
        if (i === deadI && dead.length < 20) dead.push({ i: i, toks: toks.slice(), st: st });
        return;
      }
      for (var k = 0; k < nx.length; k++) { toks.push(nx[k].tok); rec(i + nx[k].len, toks, nx[k].st); toks.pop(); }
    }
    rec(0, [], "");
    return { covers: covers, dead: dead };
  }
  function best(list) {                       // 最好的一組寫法（可能有好幾種一樣好）
    var top = [], bk = null;
    for (var i = 0; i < list.length; i++) {
      var k = cost(list[i].toks);
      if (!bk || cmp(k, bk) < 0) { bk = k; top = [list[i]]; } else if (cmp(k, bk) === 0) top.push(list[i]);
    }
    return top;
  }
  function sig(toks) { var o = []; for (var i = 0; i < toks.length; i++) o.push(toks[i].bad ? "?" + toks[i].raw : toks[i].e.join(",")); return o.join("|"); }
  function pending(tail, st) {
    if (!tail) return false;
    if (isZhu(tail.charAt(0))) return !!PRE.z[tail];
    if (st !== "d" && PRE.p[tail]) return true;
    if (st !== "p" && PRE.d[tail]) return true;
    return false;
  }

  var STYLE = { h: "han", z: "zy", p: "py", d: "dc" };

  function slotOf(t, alt, idx) {
    if (t.bad) return { st: "bad", ch: "", raw: t.raw, rd: t.rd || "", han: t.k === "h" };
    var ids = t.e.slice(), kinds = [], why = t.x ? "" : "tone", a, o, q, i;
    for (i = 0; i < ids.length; i++) kinds.push(t.k);
    if (alt) for (a = 0; a < alt.length; a++) {
      o = alt[a][idx];
      if (!o || o.bad) continue;
      for (q = 0; q < o.e.length; q++) if (ids.indexOf(o.e[q]) < 0) { ids.push(o.e[q]); kinds.push(o.k); if (!why) why = (o.k !== t.k) ? "style" : "cut"; }
    }
    if (ids.length === 1) { var e = E[ids[0]]; return { st: "ok", ch: e.c, raw: t.raw, zy: e.zy, py: e.py, via: STYLE[t.k] }; }
    var cs = []; for (i = 0; i < ids.length; i++) cs.push(E[ids[i]].c);
    return { st: "amb", ch: "", raw: t.raw, cand: cs, kinds: kinds, via: STYLE[t.k], why: why || "tone" };
  }

  // ── 主程式：raw（人打的字）→ { slots[4], code, hint, style } ──
  function decode(raw) {
    var s = norm(raw), res = { raw: String(raw == null ? "" : raw), s: s, slots: [], code: "", hint: "", style: "", n: 0, ok: 0, cands: 0 };
    var toks = [], alt = null, tail = "", tailKind = "", ambAll = false, r, top, i;
    if (s) {
      r = search(s, 4, false);
      if (r.covers.length) {
        top = best(r.covers); toks = top[0].toks;
        var sg = sig(toks); alt = [];
        for (i = 1; i < top.length; i++) if (sig(top[i].toks) !== sg) { if (top[i].toks.length === toks.length) alt.push(top[i].toks); else ambAll = true; }
        // v11.22.2 beta 修法：拼音讀法與大千讀法都能完整讀成 4 個字、結果又不同 → 不管哪邊「沒打聲調」比較少，都算有兩種看法
        var tops = {}, tsty = {}; for (i = 0; i < top.length; i++) { tops[sig(top[i].toks)] = 1; tsty[top[i].st] = 1; }
        for (i = 0; i < r.covers.length; i++) { var cv = r.covers[i]; if (cv.st && !tsty[cv.st] && cv.toks.length === toks.length && cost(cv.toks)[0] === 0 && !tops[sig(cv.toks)]) alt.push(cv.toks); }
      } else {
        var d = r.dead, pick = null;
        for (i = 0; i < d.length; i++) { var tl = s.slice(d[i].i); if (pending(tl, d[i].st)) { pick = d[i]; tailKind = "pend"; break; } }
        if (!pick) {
          var r2 = search(s, 4, true);
          if (r2.covers.length) { top = best(r2.covers); toks = top[0].toks; }
          else {
            var d2 = r2.dead; pick = d2[0] || d[0]; tailKind = "junk";
            for (i = 0; i < d2.length; i++) if (cmp(cost(d2[i].toks), cost(pick.toks)) < 0) pick = d2[i];
          }
        }
        if (pick) { toks = pick.toks; tail = s.slice(pick.i); }
      }
    }
    for (i = 0; i < 4; i++) {
      var t = toks[i], sl;
      if (t) sl = slotOf(t, (alt && alt.length) ? alt : null, i);
      else if (i === toks.length && tail) sl = { st: tailKind === "pend" ? "pend" : "junk", ch: "", raw: tail };
      else sl = { st: "empty", ch: "", raw: "" };
      res.slots.push(sl);
    }
    res.n = toks.length;
    var chars = [], styles = {};
    for (i = 0; i < 4; i++) {
      if (res.slots[i].st === "ok") { res.ok++; chars.push(res.slots[i].ch); if (res.slots[i].via !== "han") styles[res.slots[i].via] = 1; }
      if (res.slots[i].st === "amb") res.cands++;
    }
    res.style = styles.dc ? "dc" : styles.py ? "py" : styles.zy ? "zy" : (res.ok ? "han" : "");
    // 4 個字都看懂了、沒有重複、沒有多打 → 才有 code
    var dup = false; for (i = 0; i < chars.length; i++) if (chars.indexOf(chars[i]) !== i) dup = true;
    if (res.ok === 4 && res.n === 4 && !tail && !ambAll && !dup) res.code = chars.join("");
    res.hint = hintOf(res, tail, tailKind, ambAll, dup);
    return res;
  }

  function hintOf(res, tail, tailKind, ambAll, dup) {
    var i, sl;
    if (!res.s) return "";
    for (i = 0; i < 4; i++) {
      sl = res.slots[i];
      if (sl.st === "bad") return "第 " + (i + 1) + " 格「" + (sl.han ? sl.raw : (sl.rd || sl.raw)) + "」不是這組驗證碼裡的字，請對照 LINE 的卡片";
      if (sl.st === "amb") {
        if (sl.why === "style") { var pp = [], KN = { h: "漢字", z: "注音", p: "拼音", d: "沒切換輸入法的注音鍵盤" }; for (var q = 0; q < sl.cand.length && q < 4; q++) pp.push(KN[sl.kinds[q]] + "＝" + sl.cand[q]); return "第 " + (i + 1) + " 格「" + sl.raw + "」有不同看法：" + pp.join("、") + "，請改用漢字或注音符號，或在每個字中間打空白"; }
        return "第 " + (i + 1) + " 格「" + sl.raw + "」可能是 " + sl.cand.slice(0, 6).join("／") + (sl.why === "tone" ? (sl.via === "zy" ? "，請加聲調符號（例如 ㄋㄧˇ）或直接打字" : "，請加聲調數字（例如 ni3）或直接打字") : "，請用空白隔開每個字，或直接打字");
      }
    }
    if (tailKind === "junk") return (res.n >= 4 ? "多打了「" : "「") + tail + (res.n >= 4 ? "」，驗證碼只有 4 個字" : "」看不懂，請改用漢字，或注音／拼音（聲調用數字 1～4）");
    if (tail && res.n >= 4) return "多打了「" + tail + "」，驗證碼只有 4 個字";
    if (ambAll) return "這樣打有兩種看法，請加聲調數字（例如 ni3）或直接打字";
    if (dup) return "有重複的字：驗證碼的 4 個字都不一樣，請對照 LINE 的卡片";
    if (res.n > 4) return "多打了，驗證碼只有 4 個字";
    if (res.code) return res.style === "dc" ? "看起來是沒切換輸入法打出來的字母，已幫你轉成注音了。確認 4 個字跟 LINE 一樣，再按「登入」" : "確認 4 個字跟 LINE 一樣，再按「登入」";
    if (tailKind === "pend") return "再打下去…";
    var left = 4 - res.n;
    return left > 0 ? "還差 " + left + " 個字" : "";
  }

  // ── 畫面：一個輸入框＋四格＋按鈕。事件都用 addEventListener（網頁的安全設定不准行內事件）──
  // opt: { onGo(code), onChange(res), busy() }
  var MID = 0;                                                     // 每個輸入框一個編號（aria-describedby 要用到不重複的 id）
  var SLOT_SAY = { ok: null, amb: "還不確定是哪個字", bad: "不是這組驗證碼裡的字", pend: "還在輸入", junk: "看不懂", empty: "還沒打" };
  function mount(host, opt) {
    opt = opt || {};
    var d = host.ownerDocument || document;
    function el(tag, cls, txt) { var x = d.createElement(tag); if (cls) x.className = cls; if (txt != null) x.textContent = txt; return x; }
    // 外面包一層 <form>：按 Enter／手機鍵盤的「前往」由瀏覽器處理（打字組字中不會誤送出；有些安卓鍵盤的 Enter 鍵碼是 229，只靠 keydown 會漏掉）。
    // 沒有 action、一律 preventDefault，不會真的送出任何表單
    var box = el("form", "cdbox"), inp = el("input", "cdin"), row = el("div", "cdslots"), hint = el("div", "cdh"), go = el("button", "cdgo", "登入");
    box.setAttribute("novalidate", "novalidate");
    inp.type = "text"; inp.setAttribute("inputmode", "text"); inp.setAttribute("autocomplete", "off"); inp.setAttribute("autocapitalize", "off");
    inp.setAttribute("autocorrect", "off"); inp.setAttribute("spellcheck", "false"); inp.setAttribute("enterkeyhint", "go"); inp.setAttribute("lang", "zh-Hant");
    inp.setAttribute("aria-label", "驗證碼（4 個字）"); inp.placeholder = "把 LINE 給的 4 個字打在這裡";
    // 給螢幕閱讀器：提示行一變就念出來（錯字、還差幾個字）；輸入框掛上提示行；四格各自說明
    var hid = "cdh" + (++MID); hint.id = hid; hint.setAttribute("aria-live", "polite"); inp.setAttribute("aria-describedby", hid);
    go.type = "button"; go.disabled = true; go.hidden = true;
    var cells = [];
    for (var i = 0; i < 4; i++) {
      var c = el("div", "cds"), a = el("div", "cdc"), b = el("div", "cdz"), p = el("div", "cdp");
      c.setAttribute("role", "img");
      c.appendChild(a); c.appendChild(b); c.appendChild(p); row.appendChild(c); cells.push({ c: c, a: a, b: b, p: p });
    }
    box.appendChild(inp); box.appendChild(row); box.appendChild(hint); box.appendChild(go); host.appendChild(box);
    var last = null;
    function render() {
      var r = decode(inp.value); last = r;
      for (var i = 0; i < 4; i++) {
        var sl = r.slots[i], x = cells[i];
        x.c.className = "cds " + sl.st;
        x.a.textContent = sl.st === "ok" ? sl.ch : sl.st === "amb" ? "？" : sl.st === "bad" ? "✗" : sl.st === "pend" ? "…" : sl.st === "junk" ? "？" : "";
        x.b.textContent = sl.st === "ok" ? sl.zy : (sl.st === "bad" && !sl.han ? sl.rd : "");
        x.p.textContent = sl.st === "ok" ? sl.py : "";
        x.c.setAttribute("aria-label", "第 " + (i + 1) + " 格：" + (sl.st === "ok" ? sl.ch + "，注音 " + sl.zy + "，拼音 " + sl.py : SLOT_SAY[sl.st] || ""));
      }
      hint.textContent = r.hint;
      go.hidden = !r.code; go.disabled = !r.code || !!(opt.busy && opt.busy());
      if (opt.onChange) opt.onChange(r);
    }
    function fire() { if (last && last.code && !(opt.busy && opt.busy()) && opt.onGo) opt.onGo(last.code, last); }
    ["input", "compositionstart", "compositionupdate", "compositionend", "keyup", "change", "paste"].forEach(function (ev) {
      inp.addEventListener(ev, function () { if (ev === "paste") setTimeout(render, 0); else render(); });
    });
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); render(); fire(); } });
    box.addEventListener("submit", function (e) { e.preventDefault(); render(); fire(); });
    go.addEventListener("click", function () { render(); fire(); });
    render();
    return { input: inp, box: box, hint: hint, button: go, render: render, result: function () { return last; }, clear: function () { inp.value = ""; render(); }, focus: function (o) { try { inp.focus(o); } catch (e) { try { inp.focus(); } catch (e2) { } } }, setBusy: function () { render(); } };
  }

  return { decode: decode, norm: norm, mount: mount, size: E.length, chars: function () { return E.map(function (e) { return e.c; }); }, info: function (c) { var i = BYC[c]; return i === undefined ? null : { c: E[i].c, zy: E[i].zy, py: E[i].py, pb: E[i].pb, t: E[i].t, dc: E[i].dc }; }, pool: POOL };
})();
(function(){
  var $ = function(id){ return document.getElementById(id); };
  /* ══════════ 安全：不讓別的網站用框框把這一頁包進去（防有人做假網站騙人點）══════════ */
  if (window.top !== window.self) { try { document.documentElement.innerHTML = ""; } catch (e) {} return; }
  /* ══════════ 連結：#x=網頁專案部署ID&app=鑰匙（藥師版）／&dev=鑰匙（開發者版）══════════
     鑰匙放在 # 後面：瀏覽器不會把 # 後面的東西送給任何伺服器（GitHub 也看不到）。
     舊外殼的 ?x=…&app=… 也收：收了就搬到 # 後面、網址列也換掉。 */
  (function(){ var qs=location.search||""; if(!/[?&](x|app|dev|lst)=/.test(qs)) return;
    var p=new URLSearchParams(qs), f=[]; ["x","app","dev","lst"].forEach(function(k){ if(p.get(k)) f.push(k+"="+encodeURIComponent(p.get(k))); });
    try{ history.replaceState(null,"",location.pathname+"#"+f.join("&")); }catch(e){ location.replace(location.pathname+"#"+f.join("&")); } })();
  function hashParams(){ var o={}; String(location.hash||"").replace(/^#/,"").split("&").forEach(function(kv){ var i=kv.indexOf("="); if(i>0){ try{ o[decodeURIComponent(kv.slice(0,i))]=decodeURIComponent(kv.slice(i+1)); }catch(e){} } }); return o; }
  var HP=hashParams(), X=HP.x||"", T=HP.dev||HP.app||"", FROMSAVED=false, SESS=0;   /* SESS：每次登入／登出／鑰匙失效就 +1；慢回來的舊回應看到不一樣就丟掉 */
  /* v11.22.2：加到主畫面／桌面之後，從圖示開的網址沒有帶連結（鑰匙）→ 用這台瀏覽器記住的那一條（上一次從 LINE 開、後端說 OK 的）。
     記在這台跟 LINE 裡那條連結一樣：拿到手機的人都開得了；鑰匙 30 天到期、或 LINE 打「網頁 重發」之後就失效，後端說失效就清掉。 */
  function keyLoad(){ try{ var o=JSON.parse(localStorage.getItem("bk")||"null"); if (o&&/^[A-Za-z0-9_-]{20,120}$/.test(String(o.x||""))&&/^[0-9a-f]{32}$/.test(String(o.t||""))) return o; }catch(e){} return null; }
  /* v11.22.2 beta：另外記一個「後端在哪」（bx，只是網址的一段，不是鑰匙）：鑰匙過期、登出之後，這台直接打網址還是知道要連哪個後端，就能出代號登入的畫面 */
  var XRE=/^[A-Za-z0-9_-]{20,120}$/;
  function bxLoad(){ try{ var v=localStorage.getItem("bx"); if (XRE.test(v||"")) return v; }catch(e){} return ""; }
  function bxSave(){ try{ if (XRE.test(X||"")) localStorage.setItem("bx", X); }catch(e){} }
  function keySave(){ if (!XRE.test(X||"") || !/^[0-9a-f]{32}$/.test(T||"")) return; try{ localStorage.setItem("bk", JSON.stringify({x:X, t:T})); }catch(e){} bxSave(); }
  function keyDrop(){ try{ localStorage.removeItem("bk"); }catch(e){} }
  /* cfg.js（選用，開發者在 GitHub 放一次）：window.BUYAO_X="後端部署ID" —— 只寫「後端在哪」，不是鑰匙；沒有它就靠從 LINE 的「🌐 補藥神器網頁」開過一次（上面的 bx） */
  var CFGX=""; try{ if (typeof window.BUYAO_X==="string" && XRE.test(window.BUYAO_X)) CFGX=window.BUYAO_X; }catch(e){}
  /* 沒帶鑰匙時用這台記著的那一條（同一個後端，或連結只帶後端 #x=…）；都沒有才看有沒有記後端、cfg.js */
  if (!T && !HP.lst){ var SK=keyLoad(); if (SK && (!X || SK.x===X) && (!CFGX || SK.x===CFGX)){ X=SK.x; T=SK.t; HP.app=T; FROMSAVED=true; } }
  if (!X && !T && !HP.lst){ X=CFGX||bxLoad(); }
  /* v11.22.2：鑰匙已經記在這台瀏覽器了 → 網址列只留短的（複製貼上分享出去就不會帶著鑰匙）。沒記成功（瀏覽器不讓記）就不藏，不然重新整理就進不來了 */
  function keyOk(){ var o=keyLoad(); return !!(o && o.x===X && o.t===T); }
  function hideKey(){ try{ if (!HP.lst && /(^|[#&])(x|app|dev)=/.test(location.hash||"") && keyOk()) history.replaceState(null,"",location.pathname); }catch(e){} }
  var q=$("q"), out=$("out"), hint=$("hint"), nobox=$("nobox");
  /* v11.22.2（電腦版版面）：整頁跟著視窗縮放（CSS 的 body{zoom:var(--z)}）。電腦（760 以上）：1280 寬＝125%（ZOOM_BASE），
     再往上照寬度放大（ZOOM_FOLLOW），最多 ZOOM_MAX（你設 125%，所以再寬也是 125%）；760～1280 之間照比例縮（最小 80%）。手機不縮。數字是你在設計頁定的 */
  var ZOOM_BASE=1.25, ZOOM_FOLLOW=1, ZOOM_MAX=1.25;
  function fitZoom(){
    var w=window.innerWidth||document.documentElement.clientWidth||0, z=1;
    if (w>=760){ z=ZOOM_BASE*(1+ZOOM_FOLLOW*(w-1280)/1280); z=Math.min(ZOOM_MAX, Math.max(0.8, z)); }
    document.documentElement.style.setProperty("--z", String(Math.round(z*1000)/1000));
  }
  fitZoom();
  /* v11.22.2 beta（第 3 批）：卡片頁（電腦）整張卡片一屏看完。先用 100%，如果整頁比視窗還高，就縮小卡片（一格 2%：98、96、…、66，最多縮到 65%），
     用二分法找「放得下的最大一格」（最多量 6 次，不是一格一格試 18 次——每縮一格字就換一個大小，第一次排版很花時間）。
     不算「藥品家族」（它是後來才載入的，載入完不要整張卡片又縮一次）。手機不縮。
     ・量的時候把家族藏起來、頁面會變短，瀏覽器會把捲動位置往上夾 → 量完把捲動位置放回原處。
     ・改視窗大小時等 80 毫秒（拖視窗一路都在觸發）才算一次；手機／平板這種觸控裝置，網址列收起來、鍵盤跳出來也會觸發，
       只有「寬度」變了（轉向）才重算，光是高度變不重算。 */
  var CARD_MIN=0.65, FIT_W=0, FIT_T=0, FIT_S=[], COARSE=false;
  for (var fk=0; fk<=17; fk++) FIT_S.push(Math.round((1-0.02*fk)*100)/100);
  FIT_S.push(CARD_MIN);
  try{ COARSE=!!(window.matchMedia&&window.matchMedia("(pointer:coarse)").matches); }catch(e){}
  function fitCard(){
    var c=document.getElementById("card"); if(!c) return;
    c.style.removeProperty("--cz");
    var w=window.innerWidth||document.documentElement.clientWidth||0; FIT_W=w; if (w<760) return;
    var se=document.getElementById("same"), sd=se?se.style.display:"", de=document.documentElement, y=window.pageYOffset||0;
    function put(i){ if (i) c.style.setProperty("--cz", String(FIT_S[i])); else c.style.removeProperty("--cz"); }
    function fits(i){ put(i); return de.scrollHeight<=de.clientHeight; }
    if (se) se.style.display="none";
    if (!fits(0)){
      var lo=0, hi=FIT_S.length-1, mid;      /* lo：放不下；hi：放得下（或已經是最小的 65%） */
      while (hi-lo>1){ mid=(lo+hi)>>1; if (fits(mid)) hi=mid; else lo=mid; }
      put(hi);
    }
    if (se) se.style.display=sd;
    if (y) window.scrollTo(0,y);
  }
  window.addEventListener("resize", function(){
    fitZoom();
    clearTimeout(FIT_T);
    FIT_T=setTimeout(function(){ if (COARSE&&(window.innerWidth||0)===FIT_W) return; fitCard(); }, 80);
  });
  /* 手機那格比較窄，提示字縮短一點才放得下 */
  try{ if (window.innerWidth<480) q.placeholder="輸入藥名或 CODE，再按「搜尋」"; }catch(e){}
  var DEV=false, SPOT={}, FULL={}, HOME=null, TAB="錠", SORT="name", NCAT=0;
  var NICON={"停止供貨":"⛔","改包裝通知":"📦","製廠缺貨":"🏭","換廠":"🔁","給慢箋":"📄","其他":"📌"};
  var HINT0='<span>點左上 logo 回首頁</span> <span>🎤 用講的</span> <span>📷 拍包裝</span>';
  var ICON={"錠":"data:image/png;base64,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","水":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAABgFBMVEUTm/Wi2fkKY9XS4vMCMqobTrNhqek3xP4GnYcLnW6Qr+AZS7AkzGKU5Fdk1lUDclxPc8Vqy/otz5KV4zkDNKlRaKtLaLYAAP/8qFcDMaQrjTMVnVvt5+j/1FZUrVoA//8ib1EsUaVbZ55bqzQLdDMHbkwSR65pb2z47bEQNqCescsCc1d///9Xm1cnWTP/4xoTDnYrk06y6Y/I8qR5yzVqk6Rp01LhpaienaTzp+iYd5Sz4uoSYscinFIA/38syFh2f/azyNb0YnYmk+AA/wBLZqxvg7JqkM5xyzufq9YAPMQCR8MwjDYzpONuGWBmZjtQukhohLZrxTtg042ekW6Dk7yVsqObsc2L4E/H3OEJGy46xftLO41OeMJNrT1ilq9ticOqeW2hctCN4Tq6ztz/cpnlXeX/qioCEVsAf/8gnD9MMwBmM8xTtzd//39hzkeg8GOU5WCNxqr/AH8AAADz/P7Q+P6u9f6M6f7+/v5Jyf104/4tuP1q2v5V1f6V8/6DOF2/AAAAgHRSTlP+/v7+9/j+/v76/Wv9/fr5/P/++6Ne9gEGW/+ZEQb5AR0pF//7XJwKBS5kpgIcGwQIJf7++/aaBw4HDRRoXQKaAlwJewGUaCaFGf+qJJgNDVulaP0OYe2YnVMNtRFOJxZbCgWYqwoEBlkCjAoFQAJENnoJAgD+/v//Av///v////14JAcAAA/8SURBVHja7ZuHd9tGEoexKAuBFAtMmjIlRt0qtuTu2I7tS7k0p/d26cnlehcqAfJfv5nZRSVBUomU5L27zbMlUwrmw29mZ2Z3AeVk5gimjZOzHMrUT1c2hKlXvv6iDqMvBn5b/+IVibFyjgDBweAVstrVdaM09C6xvBIcBBvnBLDy1Xa93zWMNue8Vqux/IB/w6e8Z3T79e3B+QCsHG33dYMzprmVgzHe07v1eyvnosAzfaOmOY5Lt1yk0DRNfuo4Wq+7HZwHQHBR74F9Mdyyffwif1bT62cQiRUALEWoGJp2zgDM0ZjjIAei5P7Qx8xhtZ8BQENLCKHl/rCfCaDmaLVfCqAuAf6XFWj/H+CXBfjVzIJfUIH2r2AaQibkqbUyQO18Aba7BsN6I2tBQQEnEQWKQru7dS7l+OTgsGu0a5o2sxbWeK97+MzGuQAc7W9RL9jrYUemFQf2ZL0etIa63t9/7pya0o1gSycT1JKqhSE/16E5PTgL+xVd8faeAQ6v1e72cKQdMf2rh7JABHaDG+cI0EWAqjDAOfJzAHDsPqkLTQIgac7t2rkD7BGAh/0nKzamHi0PHKZ3B386P4CtLodUo1E68KYCaHr3meC8AAIoB3CPzGWTnblLywVIksaZrAoqAPb3dIhzRiuAiVURSsAZJeKN8wFYubfVbUMxrABwpQ+MM8nE0wBwDmDRcb3pAJ7wAUhw7+g8AJ6714cIgDkg1mDZWqxAUHMcKEYHG2cPsHEPp0AqgJOtBTMESgbkhIOzBzjY6vbIAdJwzr5TikN2FjNBmUwBFAAstZ8DcEpTsab3f7ITygAQgDIApgEkCCwh6B4OzhQgOKAArFXalwSe2K9xHOhKgjMFwAwADvA8z5kFICVgZ5ANlFIKxACAKsQya1MBUAJfEPR/Wk0oANyriwwAITgHACTQRBjw00jwYhD8J6gGoCrs0L6cMzEFywDYL8uUvKgEQfDDjc2bNysBNg6oCBYEqARAJ2lJVRqsLHT3P3z2+J1nn70ZVAEE32AE8JwAFIlVPnBJAg4S7F1aQILg3rV3nm42l5cfDzaqALaxCOYBUAG3ygdAIKKgvUA+DE72j8E82F9euxdMB8g84Gs5U5VBQJlA+mBuPtx+4x9onwD2qwCu13VGHvDdqiQwCYA+0OtPzZTgevDG38i8ALhWARA8VTc0bR5AqS8RQdCfCRAcfinNN5sWELxRBXAJAFguBKZOgpRCSwA0Te0fBDPm3vF7nyT2lxHgz4PfLAzgZotCsUktRjoVOQVBu/tVJUCwffxJp9lsCIBVBFh75mgegNiWZpxzRZ0YsFpst7OTBATQL1YBBJvH33UazcatRmp/ee2tYDYA53YYMt/nqjJlSAxauPbafDZAsPned2D8zq1bt9H+KtpffvbtmQBw00ocx77nxcrMIdQw1BkAwc1XO43bzu1OAwbYtwTAtVkAcOUo8odDDwEiMWYhqJA7KgBeJPuQU243Oo0O2EcBmnMAeBTGZjQkAD8yxajAQPPwJQ9wvag/2KdoBoDGzs4OCNBsQAzcnAWght4w9Ic+Apj5MYUC7UcKTwGCra2C/u+BXbR/u9Np7KzugADNDihgPc7PwzKAoozCWGaaOB7RCDOEzHrEMVgBIlVgY1CvZ/cW3Hjnzi0HPKA1Op3OndU7ZJ8A1h7MBAAXQAjKPCCaP5gSPiuPWM7RFCD4pru3lTrhwZevwu03GnD7YH/3DjgA7IMHFgAw/bEH1j0y63nJcVmyP2HbMFWyCZkBHO4Z/YPUAU83If5udWisrnZ2l1GJZQL4/cZMgJAAQIDxeDwUg3wRhmYxCIoAG0Gf1/aS/ux4De1rMAPB7M5qZ9WiqSAAXjiaARABwFgCQCQCxBiUSDAAIouFIkAw6HJNlV16cHP5fbTf2EEBdu/cWW2m9ucBDPMAY8/1EAAJ4liqMBVgg3Y1ev2BaK/XLA3t4/03wAGr65iKln8EgIwF3/ekAmGVAvf7BnO5WKgMblrvO9otTIB3Gju7nR0LvluW9ucDhCUFxlKDeJT4wLYnAPCcw7GZ0b8Plzpes5hD9hs7jd3VBgjQTO3PCcIiAMUAAgxTH4RmCHMQc7bCcwAHfVhURm77dQjDYHPNggQsAHZ2m+uWNE/2YRqeAqAQhkKCiLmxHdpFBVa2YVXvR4zpj+5vIIAm7Dc6KICVt2+tzcyE8wHM2PVjSEMSQKTib/s6d5lpa8brhw+Dx9bdW6g+KgACtKzlZmbfWgs2TwswLgCYMYvtQgy8jNsKkKPMSKvpj/aDNQujbqcJfwkB8vaty7OK0UIAUAeiAkDt4z2dQ6o0TQ4SbA8kAEiwvrsOAlA7mIy1a6cD8IoAVJrERMwAuKEbzHZic4QS7L1rtVpNbEGajd3dhmXl7h4B3j5aECCdBAnASObCAgDEAB4icNt2Qvgx0wDGsFrrJAEI0GxZS9L08gX8++oHiwO49Hcahczz41Bm4zyAAjY1xWUAMFJgpYQAFrSi66uru4311pIYFy5ckCHw90UBsCJ7lIooE/ku/JGJIMxcoIWKrtfs0GEhKBQBkGostVCC5uqu1QAByLi0v1S9MpoC4FIMeJ4QwHehMYAYCKFXQQKpgA8CtJnCnBhdNFLcmqqrSxQFFoagtH5haQlRrMtVa8PgD2UAl1oSHDIPwBcMQkhEcZaI+EiFCAwjxx3FOEACrhoKEVi7TauVmBfD2qzaH5gE8PIAST2cAAhBgBqLYocJgFBhGjTsSqtl4QRsWXnzS9bVaoBLVQBuPhNiNfChXYwkQIhTELppx/EFACwn3Jqhq0AAgbBOIZAN6/L9UwB4wr6XBzBNCAIoCElfjg6oxYrvOLEcoWK7beGEFnigZH+zcpOKluflPIANoZfVAggz36dpKMuxMoIZwLUodMADom0aggSMgQQRAEBGKthvle3PBSgVI6pDYZQCCAfYMAUcmKKCACTgXk3XFQyDgges1uXj6n3CqZmwXAtKANEIwo0i0HGG1Djh742gU/C4bkTohKL9CQEWBPBlcxyPGASgmQCAAyAFaNwEAVwJgJ0T/JR56AQjDwD2rwUzdkqrXIAEMBGTlggESDNxGIEAmh3hjobvpwBDTJM+hAE4wcrb33948uL10jOh8xXAvhBTcjoL0lIgHKBFsUsAHstLwMfgBNNIFIAadPn4IRj/6+f7b58yCD3xLYtzXSllgZFCAoQ+/rKfZiwgMLFhHKsggSGsW63dzUHw4Mbm8T+fXnucj4QFAFyHrsz8uAhghrg7wIQATMolAEYYIr5t6JECtRgzUuujwf1rx//65Ol1aAj+cioAdIAgSACEfUwBatsJQ3HA62UE4KxIEU5QwQmYEG99tI7VcZ16gquXjhYEoEQI35cUCBkJEKEAWhg7uazpUSCIMFTsIcXh+keadne92WiCJ6goX160KRW3PqZLwzo5iYHQ90KKAD2NAEesod1EgljsL5EE3NHuQlO4LqxDXVrbDBYNQldOQ/jKWNYSogJqRBHghhQBkwA0TfgQo+CuZZH594V9aMkWBRiXMzG1hJhq4eIjuDtVY0KA5Iw/A6DfUYYKZiPqCdPpaF1+MBsAur6xX700w1jgFIKvQTtox2IvZQKA5oEaDnXdVLJsCBzW1Zmb1VIBv7w/4KfdAMQCAqAHoCMXITgFgIJA5TbkgshIm0L0QHVLdr1KAZneGO5bhdiQQgiECAAeqACA5lQka0qH1lKCsGStVXdEGYBfAJBTmzlQENiImgFVCbmaCwE3i0EmF/KmkGAERVE1cj4oF+RJgCEB4BwcizyIkxCKPdiHTMAkAKbhtmNPAsgQSAGMJB/LinAtWBTAFQAOZgK4KQCA8Bv5EmBISxKZBiVAmoeoaEkARQZB0pIOTk4WccFYAIADsCWjYuxKBSgP86GMwQRA5oxUgNCUHUMWBKIin5wGAAfmQbEooHwsuiGYX0YewPHytQgARNeK+TJXlK3W1ZkdUZIHTADwRTOKU0D2Q9iPsqQZUcNYAvh5AOZnAiQAIQBgFGJJnmK/CoBuXCYh2Y3FuYWxAGAlgJx94YEUoIXm0f7+wgCJAn5hUZTW4sQFI7GrTCf+LN1LQ1IJEIe6HqnYnl+9PM1+BcAwAUjsDwu9QApggwT0rI/PRD+W3D94QOxlowIAAPav3Q9mH99PxoCfLMv9TADcsiYAVQJAZMitTJmDhacUyJscV66cXAC3PwhOFgMYmeHQFzEvLoozLGkHYV0ahpySvPoaxx2BOB4Oc/blFgqszpjHRB4AgD8eD+Y/wJAHkGtxcf8AwOQeZYTLglAUQ+O1tuNidY6l/unq2YxAAE8CwNLRfPOt4OTUAFmbj9dPPeD5sc2pFkA/xMgH2JK4Un7hf1PhGgKolIpV89ELR4sDKFBuxDqIzo2SNamwb0Yxs2mL0gwNPDBjIWZjKBx+nNnHhRGo5taAEyaB8ubhwcmPAUDfJzlolAAkqzLoB3S9DYEGTnCSA6Y0UWDlJg/YEALKm58FpwIIozhVIJ2BaD+/U08+0JnDOBUkTx6pEIDCcQ65DCIFPGCYv33rlACmGcfD5LAmLtlPAUIVF6YuN6lNpGHKnQNGmqg0B3TldzOfdSoBkNuw8R2Nkg2PzH4C4NsYBNiWQ1vMInm+GSVrRgFA9kMS4MbCALoGskV0M8n0Fmd2dGgXx7Ztw1TkzKZCC1FgGOBqICgfajLGcfcE5uA8AUoATMPDUKx7XvFRifzg4lg/wqZIVzHYlDKA2L5DB6hzBMg/QzKo67jFBz0RHhGJ7i4f21HBAFw6RCe0gYDjEe5U+4aizHnaTSk/SggXC5lsLpK5jWPi6NjAOBQEvl0+TeQh2Yd+8NH2wgBHH+yBBHiCH0GnQytCWeN8ioCYgsAO7ZiSIVS5MEICg4/H9IkcCuehbXMD79989Hmw+MNswWEXwhpfpxQMfm7Fhy4RZ8gx5+JBDkOF6AP7kJDYGOWyMTq4HY+GNu5fo/05AVACWAkO8WLiERk8H44iuBkcdGWeKdwGOzYURCBQ6GkOlbPkmBdyB6e3EMC+Wp/7jFXhcb7nnuCrFTx5oFSTIZ8ap+9qpAQeYfd0VYHKq8p3IZJflf9Uo0jtXTkdwEnwcE9cq/xuQf65Zpge+NKrsAMimAo901Ic8Lli9L5/uH/aZ0oH7+7ppF+bHtQpvmAiXvzlvJ2852H0DJi2hJC+/KHjWyERCnP3++f/fdqnaleeBMGTl/bSN0lgtGmAVRhGaoWs3wXGuwbmLtOMsqdKKDKM3sfPPxkEpwU4gf9jEARXXr5Y3zPy5vScYTD90sWLH16h8fzHvR7ZTZ82QZDeS1c+ffjc0QLPGU48Wb2ysiLeeR9c+fDlizDq+YEfvAxWATK4/+0AvjwYfPr81+/2srdxCO9KENzYX+g9LKXyJyvBjIGXXtmA/1Y28D35wadXLqbjwysD/IUF39JXTs5kTOItOv4LmyGziwdiNVMAAAAASUVORK5CYII="};
  /* v11.22.2 beta（乙-4）：小圖示每一列都要放（一頁 500 多列、每列 2～3 次）。把圖轉成短網址（blob:）只放一次，
     不再每一列都帶一整段圖片文字：慢的手機畫清單少約 0.7 秒。轉不成（瀏覽器不讓）就照舊用原本那段 */
  try{ ["錠","水"].forEach(function(k){ var m=/^data:([^;,]+);base64,([A-Za-z0-9+\/=]+)$/.exec(ICON[k]); if(!m) return; var b=atob(m[2]), u=new Uint8Array(b.length), i; for(i=0;i<b.length;i++) u[i]=b.charCodeAt(i); ICON[k]=URL.createObjectURL(new Blob([u],{type:m[1]})); }); }catch(e){}
  try{ TAB=localStorage.getItem("bt")||"錠"; SORT=localStorage.getItem("bs")||"name"; }catch(e){}

  /* ══════════ 後端：網頁專案的 API（v11.20：網頁在 GitHub，用 fetch 打 Apps Script）══════════
     只送三樣：要做什麼（fn）、鑰匙（t）、這台裝置的裝置碼（dk，開發者連結綁裝置用）。沒有 cookie、不帶來源網址。
     v11.20.1：送出去的裝置碼＝這台瀏覽器自己的亂數（bdk，只存在這台）跟連結裡的部署 ID 一起算出來的——
     每個部署拿到的都不一樣：就算有人做假連結（連到他自己的部署），他拿到的那一串拿去真的後端也沒有用。 */
  var API="", LIVE=false, SYNC_T=null, DKX="", BOUND=false;
  /* 還沒有鑰匙（畫面上是代號登入，或「請從 LINE 開」那一頁）→ true：按 logo、貼上照片都什麼都不做，不然會拿空鑰匙去問後端。
     預覽（沒連後端、跑假資料）也沒有鑰匙，但那是假資料在跑，要照常動；正式版的 MOCK 是空的，所以這裡永遠是 true。 */
  function noKey(){ return !T && (LIVE || !(MOCK && MOCK.appInfo)); }
  var DK=(function(){ var k=""; try{ k=localStorage.getItem("bdk")||""; }catch(e){ k=""; }
    if (/^[0-9a-f]{32}$/.test(k)) return k;
    try{ var a=new Uint8Array(16); crypto.getRandomValues(a); k=Array.prototype.map.call(a,function(x){ return ("0"+x.toString(16)).slice(-2); }).join(""); localStorage.setItem("bdk",k); if(localStorage.getItem("bdk")!==k) k=""; }catch(e){ k=""; }
    return k; })();
  /* 送一次。ms＝這一次最久等多久（逾時就當這一次斷線，由 call 自動重送）；沒給就不設時限 */
  function post(fn, a, bg, ms){
    var ctl=(ms&&window.AbortController)?new AbortController():null, tm=0;
    if (ctl) tm=setTimeout(function(){ try{ ctl.abort(); }catch(e){} }, ms);
    var o={method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify({v:1, fn:fn, t:T, dk:DKX, a:a}),
      credentials:"omit", cache:"no-store", referrerPolicy:"no-referrer", redirect:"follow", keepalive:!!bg};
    if (ctl) o.signal=ctl.signal;
    return fetch(API, o)
      .then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.json().catch(function(){ throw new Error("後端回的不是補藥神器的格式"); }); })
      .then(function(j){ clearTimeout(tm); return j; }, function(e){ clearTimeout(tm); throw (e&&e.name==="AbortError")?new Error("等太久沒回應"):e; });
  }
  /* v11.22.2（斷線自動重送）：只是「查」或「辨識」的，同樣的東西再送一次不會出事 → 斷線、等太久、Google 回怪東西時自動重送
     （最多 3 次，中間隔 0.7、1.6 秒）。iPhone 的 Safari 常在「拍完照回來的第一個請求」出 Load failed，重送一次就過了。
     會改資料、存照片的（appEdit、appPic、appBind）只送一次：怕重送變兩份。 */
  var SAFE={appInfo:1, appHome:1, appSearch:1, appSame:1, appPhoto:1, appVoice:1, appEditInfo:1};
  /* 照片（appPhoto）：伺服器最慢的情況是 AI 慢加上 OCR 慢（45 秒上下），40 秒就放棄的話，伺服器還在跑的那一份白做、又重送一份 → 照片每一次最久等 90 秒，其他 40 秒 */
  var TRIES=3, WAITS=[700,1600], LIMIT_MS=40000, LIMIT_PHOTO=90000;
  function snip(j){ var s=""; try{ s=JSON.stringify(j); }catch(e){} return String(s===undefined?"":s).replace(/\s+/g," ").slice(0,60); }
  function call(fn, args, ok, bad, opt){
    if (!LIVE){ setTimeout(function(){ MOCK[fn].apply(null, args.concat([ok, bad])); }, 260); return; }
    opt=opt||{};
    var sid=SESS;
    var fail=bad||function(e){ setHint("❌ "+(e&&e.message||e), true); };
    var tries=SAFE[fn]?TRIES:1, n=0, t0=Date.now();
    function again(){ setTimeout(go, WAITS[n-1]||1600); }
    function go(){
      if (sid!==SESS) return;
      n++;
      var a=(opt.args?opt.args(n):args).slice(1);
      if (n>1&&opt.retrying) opt.retrying(n);
      post(fn, a, false, SAFE[fn]?(fn==="appPhoto"?LIMIT_PHOTO:LIMIT_MS):0).then(function(j){
        if (sid!==SESS) return;
        if (!j || j.ok!==1){
          var code=j&&typeof j.code==="string"?j.code:"", msg=j&&typeof j.err==="string"?j.err:"";   /* 字串才收（後端回物件、數字也不會變成「[object Object]」） */
          if (!msg&&!code&&n<tries){ again(); return; }   /* 收到的不是補藥神器的格式（多半是 Google 那邊一時的狀況）→ 重送 */
          if (!msg) msg="後端沒有回應"+(code?"":"（收到的不是補藥神器的格式："+snip(j)+(n>1?"；已自動再試 "+(n-1)+" 次":"")+"）");
          if (code==="tok"||code==="bind"||code==="down"||code==="moved"){ stop(msg, code, j.need); return; }
          fail(new Error(msg)); return;
        }
        var res=j.r;
        if (res && res.sync) syncSoon();
        ok(res);
      }, function(err){
        if (sid!==SESS) return;
        if (n<tries){ again(); return; }
        var why=String(err&&err.message||err||"?"), sec=Math.max(1,Math.round((Date.now()-t0)/1000));
        var e=new Error("連不上後端（"+why+(n>1?"；已自動再試 "+(n-1)+" 次、共 "+sec+" 秒":"")+"），網路好了再試一次");
        e.net=true; e.tech=why+"；試了 "+n+" 次、共 "+sec+" 秒";
        fail(e);
      });
    }
    go();
  }
  /* 改了資料（sync:1）→ 1.5 秒內沒有再改，就在背景通知 LINE 那邊清快取（這裡不用等）；
     還沒送就切走、關掉網頁 → 馬上送（萬一還是沒送到，網頁專案的保溫排程 30 分鐘內會補） */
  function syncNow(){ if(!SYNC_T) return; clearTimeout(SYNC_T); SYNC_T=null; post("appSync", [], true).catch(function(){}); }
  function syncSoon(){ clearTimeout(SYNC_T); SYNC_T=setTimeout(syncNow, 1500); }
  document.addEventListener("visibilitychange", function(){ if(document.visibilityState==="hidden") syncNow(); });
  window.addEventListener("pagehide", syncNow);
  /* 整頁停下來（鑰匙不對、LINE 專案連不到、舊連結、連結有問題）；開發者版這台還沒綁定 → 出輸入綁定碼的框 */
  function resetSession(){   /* 登出、鑰匙失效、換人登入：上一個人的記憶體、畫面上的標籤、搜尋字全部清掉；SESS+1 讓還在路上的舊回應作廢 */
    SESS++;
    T=""; HP.app=""; HP.dev=""; FROMSAVED=false; DEV=false; HOME=null; LAST=null; CARD=null; UPD=false; BOUND=false; FULL={}; SAME={};
    var h=$("home"); h.classList.remove("dev"); var dt=h.querySelector(".devtag"); if (dt) dt.parentNode.removeChild(dt);
    q.value="";
  }
  function stop(msg, code, need){
    SESS++;
    if (code==="tok"||code==="bind"){ UPD=false; homeDrop(); }   /* v11.22.2 beta：鑰匙壞了／這台還沒綁定 → 這台記著的上次清單也不要了 */
    if (code==="bind" && need){ bindForm(msg); return; }
    /* 鑰匙壞了、過期了：記住的那一條也不要了（從 LINE 開新的那一次會再記）。
       v11.22.2 beta：只清「同一個後端」的；記的是另一個後端（例如按了「用新連結」、那條連結的後端說鑰匙不對），就不動——不該讓一條別的連結把原本好的清掉 */
    if (code==="tok"){ var sk=keyLoad(); if (!sk || (sk.x===X && (FROMSAVED || sk.t===T))) keyDrop(); if (sk && sk.x===X) bxSave(); }   /* 失敗的是「連結帶來的鑰匙」、跟這台記的好鑰匙不是同一把 → 別把記的好鑰匙清掉（舊連結不該讓人被登出） */   /* 後端只在「這台自己記過的鑰匙壞了」時才記下來（那個後端之前登入成功過）；一條新連結帶來的後端、說鑰匙不對，不記 */
    /* v11.22.2 beta：鑰匙過期了／被換掉了 → 後端還記著（bx）、這個瀏覽器也記得住東西 → 直接出代號登入的畫面，不用再回 LINE 找連結 */
    if (code==="tok" && canCode()){ resetSession(); codeForm(msg+"\n可以回 LINE 按「🌐 補藥神器網頁」再開，或用代號登入："); return; }
    out.innerHTML='<div class="empty"><b>'+esc(msg).replace(/\n/g,"<br>")+'</b>'+(code==="tok"?"回 LINE 按下面那排的「🌐 補藥神器網頁」再開一次。"+(FROMSAVED?"<br>開過一次，主畫面的圖示就會換成新的連結。":""):"")
      +(code==="down"||code==="moved"?'<div><button type="button" class="retry" data-go="reload">🔄 重新載入</button></div>':"")+'</div>';   /* 後端暫時連不到：給一顆重新載入，不用自己找重新整理 */
    setHint(""); $("sf").hidden=true; $("inst").hidden=true;
  }
  /* 首頁載入失敗、又沒有上次的清單可以先顯示：兩個框不要一直寫「載入中…」，改成一句話＋重新載入 */
  function homeFail(msg){
    if (HOME) return;
    var n=$("nlist"), a=$("alist");
    if (n) n.innerHTML='<div class="none">沒有載入成功</div>';
    if (a) a.innerHTML='<div class="none">'+esc(msg||"載入失敗")+'<br><button type="button" class="retry" data-go="reload">🔄 重新載入</button></div>';
  }
  /* ══════════ 代號登入（v11.22.2 beta）══════════
     沒有 LINE 連結的瀏覽器（直接打網址）：
       ① 這個網頁向後端要一組 6 位數的「代號」，顯示在畫面上（同時手上有一把看不到的暗鑰匙，只存在這個分頁）
       ② 到 LINE 補藥神器把代號打進去（直接打 482915 就行）→ LINE 回一組 4 個漢字的「驗證碼」（卡片上每個字附注音、拼音）；
          藥師拿到藥師版、開發者拿到開發者版（這台還會被綁定，並通知開發者）
       ③ 回到這個網頁把驗證碼打進來 → 登入。輸入框：漢字、注音、拼音（wo3）、忘了切換輸入法打成的字母（ji394su3）都認得，
          先轉成 4 個「系統看懂的字」給你確認，再按「登入」；送給後端的永遠只有暗鑰匙跟這 4 個漢字。
     驗證碼只認「出這組代號的這個網頁」：換鑰匙時後端要核對這把暗鑰匙跟這台裝置，別的瀏覽器拿到驗證碼也沒用。
     ④ ①～③ 要在代號出現後的 2 分鐘（CODE_MIN）內做完：畫面上倒數；倒數到 0 就自動換一組新的代號（舊的一起作廢），上面留一句說明。藥師和開發者一樣。
        網頁自己倒數，不會去問後端「LINE 領了沒」（沒有那種查詢）。沒人理的分頁（人不在、一直開著）連續最多自己換 2 次（AUTO_MAX）就停在「代號過期了」＋「重新取得代號」，
        免得一直用後端的額度；看不到的分頁（切去 LINE、螢幕關了）不換，人回來（看得到了）才換。
     「後端代號」＝這個網頁要連的後端（部署 ID 的最後 6 個字）：要跟 LINE 卡片上的一樣才輸入，不一樣就不是補藥神器。 */
  function canCode(){ return !!(X && XRE.test(X) && DKX && window.fetch && window.CodeIn && CodeIn.mount); }
  function strOf(){ for (var i=0;i<arguments.length;i++){ var a=arguments[i]; if (typeof a==="string" && a) return a.slice(0,300); } return ""; }   /* 後端回來的訊息：是字串才用（物件、數字不要變成「[object Object]」） */
  function devLabel(){
    var u=navigator.userAgent||"";
    var b=/Edg\//.test(u)?"Edge":/OPR\//.test(u)?"Opera":/Firefox\/|FxiOS/.test(u)?"Firefox":/CriOS|Chrome\//.test(u)?"Chrome":/Safari\//.test(u)?"Safari":"瀏覽器";
    var o=/Windows/.test(u)?"Windows":/iPhone|iPad|iPod/.test(u)?"iOS":/Android/.test(u)?"Android":/Mac OS X|Macintosh/.test(u)?"macOS":/Linux/.test(u)?"Linux":"";
    if (o==="macOS" && (navigator.maxTouchPoints||0)>1) o="iPadOS";   /* iPad 的 Safari 預設自稱是 Mac，但 Mac 沒有多點觸控 */
    return o?b+" / "+o:b;
  }
  /* 這個分頁手上的那一組代號：{x:後端, code:"482915", sec:暗鑰匙, ex:到期時間(本機毫秒；拿到之後 2 分鐘), dead:1=已過期／作廢, stale:1=從 sessionStorage 讀回來、已經到期了}。
     記在 sessionStorage（只在這個分頁，關掉就沒了；重新整理、手機切去 LINE 再切回來被瀏覽器重載，還是同一組）。
     過期、作廢的不記；PAIR 本身留著，「重新取得代號」要把舊的暗鑰匙帶給後端，請 LINE 把舊的作廢 */
  var CODE_MIN=2;   /* 代號出現後幾分鐘內要做完（要跟 LINE 專案的 LC_SEC 一樣；tools 的測試會對） */
  var AUTO_MAX=2;   /* 沒人理的分頁，連續自動換新代號最多幾次（人碰過畫面、按了鍵、切回來就重算） */
  var PAIR=null, PSEQ=0, PTM=0, PBUSY=false, PCM=null, PNOTE="", AUTO=0, PFOC=false;
  var PAUTO_MORE="（超過會自動換新的代號）", PAUTO_LAST="（超過要按「重新取得代號」）";   /* 連續自動換到上限了（AUTO_MAX）之後的那一組：不會再自己換，要照實說 */
  var NOTE_AUTO="⌛ 超過 "+CODE_MIN+" 分鐘沒有登入，已經自動換成新的代號。把下面這組新的代號再打進 LINE 就好。";
  var NOTE_FAIL="⌛ 超過 "+CODE_MIN+" 分鐘沒有登入，原來的代號已經不能用了。";   /* 自動換新的那一次沒拿到新代號（斷線、暫停…）：不能說「已經換成新的」 */
  function pairSave(){ try{ if (PAIR && !PAIR.dead) sessionStorage.setItem("bpair", JSON.stringify({x:PAIR.x, code:PAIR.code, sec:PAIR.sec, ex:PAIR.ex})); else sessionStorage.removeItem("bpair"); }catch(e){} }
  function pairLoad(){
    var now=Date.now();
    if (PAIR && !PAIR.dead && PAIR.x===X && PAIR.ex>now+3000) return PAIR;
    try{
      var o=JSON.parse(sessionStorage.getItem("bpair")||"null");
      if (o && o.x===X && /^\d{6}$/.test(String(o.code||"")) && /^[0-9a-f]{32}$/.test(String(o.sec||"")) && +o.ex>0){
        var p={x:X, code:String(o.code), sec:String(o.sec), ex:+o.ex};
        if (p.ex>now+3000 && p.ex<=now+600000) return p;   /* 還沒到期的接著用 */
        p.stale=1; return p;   /* 到期了（手機切去 LINE 太久、分頁放著再回來、重新整理）：交回去，呼叫的人會自動換新的並說明 */
      }
    }catch(e){}
    return null;
  }
  function fmtMS(s){ return Math.floor(s/60)+":"+("0"+(s%60)).slice(-2); }
  /* 倒數：每秒更新「m:ss」（剩 20 秒以內變紅）；到 0 就自動換新的。畫面換掉了（元素不在）就自己停 */
  function pairTick(){
    var el=$("pcd");
    if (!el || !PAIR || PAIR.dead){ if (PTM){ clearInterval(PTM); PTM=0; } return; }
    var s=Math.ceil((PAIR.ex-Date.now())/1000);
    if (s<=0){ pairExpire(); return; }
    el.textContent=fmtMS(s); el.className=s<=20?"low":"";
    var pa=$("pauto"); if (pa) pa.textContent=AUTO>=AUTO_MAX?PAUTO_LAST:PAUTO_MORE;   /* 人碰過畫面（AUTO 歸零）就改回「會自動換」 */
  }
  /* 倒數到 0：自動換一組新的（藥師、開發者一樣）。
     正在送出登入就等回應（下一秒再看）；看不到的分頁（切去 LINE、螢幕關了）不換，人回來才換；
     連續換了 AUTO_MAX 次、中間人都沒碰過（沒打字、沒按鍵、沒切回來）＝沒人理的分頁，就停在「代號過期了」，不再用後端的額度 */
  function pairExpire(){
    if (PBUSY || document.visibilityState==="hidden") return;
    if (AUTO>=AUTO_MAX){ pairGone("這組代號已經過期（"+CODE_MIN+" 分鐘）", "⌛ 代號過期了"); return; }
    AUTO++; pairStart(NOTE_AUTO);
  }
  document.addEventListener("visibilitychange", function(){ if (document.visibilityState==="visible"){ AUTO=0; pairTick(); } });
  /* 畫面：st＝load（正在拿）／live（有代號，下面出輸入框）／gone（代號沒有了，只剩「重新取得代號」）／err（沒拿到） */
  function pairHtml(why, big, btn, extra){
    return '<div class="pst" role="status">'+esc(why).replace(/\n/g,"<br>")+'</div><div class="pcode gone">'+esc(big)+'</div>'
      +(extra?'<div class="pst">'+esc(extra).replace(/\n/g,"<br>")+'</div>':"")
      +(btn?'<button type="button" class="pbtn" data-go="pair">'+esc(btn)+'</button>':"");
  }
  function renderPair(st, why, big, extra){
    var el=$("pair"), wrap=$("cdwrap"); if (!el || !wrap) return;
    var note=PNOTE?'<div class="pnote" role="status">'+esc(st==="err"?NOTE_FAIL:PNOTE)+'</div>':"";   /* 自動換新代號之後，上面留一句說明（按「重新取得代號」或登入就收掉）；沒拿到新的就改說「原來的不能用了」 */
    if (st==="live" && PAIR && !PAIR.dead){
      var c=PAIR.code;
      el.innerHTML=note+'<div class="pst" role="status">① 打開 LINE 補藥神器（一對一，不是群組），把這組<b>代號</b>打進去</div>'
        +'<div class="pcode" id="pcode" role="img" aria-label="代號 '+c.split("").join(" ")+'">'+c.slice(0,3)+" "+c.slice(3)+'</div>'
        +'<div class="pmeta">請在 <b id="pcd"></b> 內完成登入<span id="pauto"></span><br>這台：'+esc(devLabel())+'　·　<button type="button" class="plink" data-go="pair">重新取得代號</button></div>';
      wrap.hidden=false; PFOC=false;
      if (PTM) clearInterval(PTM);
      pairTick(); if (PAIR && !PAIR.dead) PTM=setInterval(pairTick, 1000);
      return;
    }
    if (PTM){ clearInterval(PTM); PTM=0; }
    wrap.hidden=true;
    if (PCM) PCM.clear();
    var m=$("cdm"); if (m){ m.className="bindm"; m.textContent=""; }
    var hadFoc=PFOC || el.contains(document.activeElement);   /* 鍵盤操作的人按了「重新取得代號」「再試一次」，按鈕被換掉：焦點要接到新的按鈕，不要掉到網頁最上面 */
    if (st==="load") el.innerHTML=note+pairHtml("① 正在向後端要代號…", "⏳", "", "");
    else if (st==="err") el.innerHTML=note+pairHtml("① 沒拿到代號", why||"沒拿到代號，再試一次", "再試一次", "");
    else el.innerHTML=pairHtml("① "+(why||"這組代號已經不能用了"), big||"請重新取得代號", "重新取得代號", extra||"");
    if (hadFoc && st!=="load"){ PFOC=false; var nb=el.querySelector(".pbtn"); if (nb) try{ nb.focus({preventScroll:true}); }catch(x){} }
  }
  /* 這組代號沒有了（過期、作廢、被用掉、開發者名額滿）：留著 PAIR（標記 dead）給「重新取得」帶舊暗鑰匙，不再記在 sessionStorage */
  function pairGone(why, big, extra){
    if (PAIR) PAIR.dead=1;
    PNOTE="";
    pairSave();
    renderPair("gone", why, big, extra);
  }
  /* 向後端要一組代號（打開畫面時、按「重新取得代號」「再試一次」時、倒數到 0 自動換時）。舊的暗鑰匙一起帶去，LINE 會把舊的作廢。
     note＝畫面上方的說明（自動換新的那次才有）；沒給 note＝人按的（算碰過畫面，沒人理的次數重算）。
     PSEQ：慢回來的舊回應（已經又拿了新的、或畫面已經換掉）直接丟掉 */
  function pairStart(note){
    if (PBUSY) return;
    var my=++PSEQ, old=PAIR&&PAIR.sec?PAIR.sec:"", t0=Date.now();
    if (typeof note!=="string") AUTO=0;
    PNOTE=typeof note==="string"?note:"";
    PAIR=null; pairSave();
    renderPair("load");
    post("appCodeStart",[devLabel(), old], false, 20000).then(function(j){
      if (my!==PSEQ || !$("pair")) return;
      var r=j&&j.ok===1?j.r:null;
      if (r&&r.ok&&/^\d{6}$/.test(String(r.code||""))&&/^[0-9a-f]{32}$/.test(String(r.sec||""))){
        /* 倒數從「送出要代號」那一刻算（不是收到的那一刻）：後端是在中間才開始算的，這樣網頁的倒數一定不會比後端的期限晚，倒數還在走的時候打進 LINE 的代號一定領得到 */
        PAIR={x:X, code:String(r.code), sec:String(r.sec), ex:t0+Math.max(30,Math.min(600,+r.ttl||CODE_MIN*60))*1000};
        pairSave(); renderPair("live"); if (PCM) PCM.focus({preventScroll:true}); return;
      }
      renderPair("err", strOf(r&&r.err, j&&j.err)||"沒拿到代號，再試一次");
    }, function(e){
      if (my!==PSEQ || !$("pair")) return;
      renderPair("err", e&&/等太久/.test(String(e.message))?"等太久沒有回應，再試一次":"連不上後端，網路好了再試一次");
    });
  }
  /* 登入沒成功：依後端說的分類。字留著的（還沒收到代號、忙線、暫停）不是打錯；打錯的清掉重打；代號沒有了就換成「重新取得」 */
  function pairFail(r, j){
    var em=strOf(r&&r.err, j&&j.err), m=$("cdm"), say=function(t, wait){ m.className=wait?"bindm wait":"bindm"; m.textContent=t; };
    if (r&&r.dead){ pairGone("輸錯太多次，這組代號作廢了", "🔒 請重新取得代號", "重新取得後，再把新的代號打進 LINE 拿新的驗證碼。"); return; }
    if (r&&r.gone){
      if (r.full) pairGone("驗證碼對了，但這台登不進去", "🔒 開發者版名額滿了", em.replace(/^🔒\s*/,""));
      else if (PAIR && !PAIR.dead && PAIR.ex-Date.now()<=8000) pairStart(NOTE_AUTO);   /* 後端說沒有了，而且這邊的倒數也剛好（差不多）到了（網路慢、倒數歸零的瞬間按的）→ 就是時間到了：跟倒數到 0 一樣，自動換新的 */
      else pairGone("這組代號已經不能用了（過期、用掉了，或已經作廢）", "⌛ 請重新取得代號", "");
      return;
    }
    if (r&&r.wait){ say("⏳ LINE 還沒收到這組代號。到 LINE 補藥神器打 "+(PAIR?PAIR.code:"畫面上的代號")+"，拿到驗證碼再回來輸入。", true); return; }
    if (r&&typeof r.left==="number"){ say("❌ 驗證碼不對（這組代號還剩 "+r.left+" 次機會）。再看一次 LINE 上的 4 個字。"); PCM.clear(); PCM.focus(); return; }
    say((em.indexOf("🔒")===0?"":"❌ ")+(em||"沒登入成功，再試一次"));
  }
  function codeForm(msg){
    LIVE=true; API="https://script.google.com/macros/s/"+X+"/exec";
    /* 電腦（寬螢幕）：① 代號在左、② 驗證碼輸入在右，並排（筆電 1366×768 第一屏就看得到輸入格和登入鍵）；手機上下排。標題和「後端代號」同一列（放不下就換行） */
    out.innerHTML='<div class="empty codebox"><div class="cdhead"><b>'+esc(msg||"🔐 登入補藥神器").replace(/\n/g,"<br>")+'</b>'
      +'<span class="cdbk">後端代號 <b class="mono">'+esc(X.slice(-6))+'</b>　要跟 LINE 卡片上的一樣才輸入</span></div>'
      +'<div class="cdgrid"><div class="pairbx" id="pair"></div>'
      +'<div id="cdwrap" hidden><div class="pst2">② LINE 會回你 4 個字的<b>驗證碼</b>，打在這裡</div><div id="cdhost"></div><span class="bindm" id="cdm" role="status"></span></div></div>'
      +'<small>代號和驗證碼都只能在這個網頁用，換別的瀏覽器打沒用。<br>代號出現後 '+CODE_MIN+' 分鐘內要完成登入，超過了這裡會自己換一組新的代號；驗證碼只能用一次，不要傳給任何人。</small></div>';
    setHint(""); $("sf").hidden=true; $("inst").hidden=true;
    PBUSY=false; PSEQ++; if (PTM){ clearInterval(PTM); PTM=0; }
    PNOTE=""; AUTO=0;
    var cm=null, msgEl=$("cdm");
    cm=PCM=CodeIn.mount($("cdhost"),{
      busy:function(){ return PBUSY; },
      onGo:function(code){
        if (PBUSY) return;
        var P=PAIR;
        AUTO=0;   /* 按了登入＝有人在 */
        if (!P || P.dead){ pairGone("這組代號已經不能用了", "⌛ 代號過期了"); return; }
        if (P.ex<=Date.now()){ pairStart(NOTE_AUTO); return; }   /* 倒數剛好到 0 的瞬間按的 → 自動換新的 */
        /* 等的時候：登入鍵停用、輸入框唯讀（不讓人改到一半）、「確認中…」用一般顏色（不是錯誤的紅字） */
        PBUSY=true; cm.setBusy(); cm.input.readOnly=true; msgEl.className="bindm wait"; msgEl.textContent="確認中…";
        var done=function(){ PBUSY=false; cm.input.readOnly=false; msgEl.className="bindm"; cm.setBusy(); };
        /* 最久等 20 秒：不自動重送（重送時第一次可能其實已經成功、驗證碼已經被用掉了） */
        post("appCodeLogin",[P.sec, code, devLabel()], false, 20000).then(function(j){
          done();
          var r=j&&j.ok===1?j.r:null;
          if (r&&r.ok&&/^[0-9a-f]{32}$/.test(String(r.t||""))){ msgEl.textContent=""; PAIR=null; pairSave(); PSEQ++; loginOk(r); return; }
          if (P!==PAIR || !$("pair")) return;   /* 這中間畫面已經換掉了 → 這個回覆不管 */
          pairFail(r, j);
        }, function(e){
          done();
          if (P!==PAIR || !$("pair")) return;
          msgEl.textContent=e&&/等太久/.test(String(e.message))?"❌ 等太久沒有回應。再試一次；若說「代號已經不能用」，是第一次其實已經用掉了——按「重新取得代號」重來。":"❌ 連不上後端，網路好了再試一次";
        });
      }
    });
    var SIXMSG=false;
    cm.input.addEventListener("input", function(){
      AUTO=0;   /* 有人在打字＝有人在 */
      /* 把上面 6 位數的代號誤打進這一格（代號是要打進 LINE 的）：直接說，不要只說「看不懂」 */
      if (/^\s*\d{3}[\s\-]?\d{3}\s*$/.test(cm.input.value)){ msgEl.className="bindm wait"; msgEl.textContent="這裡要打 LINE 回給你的 4 個字，不是上面的 6 位數代號（6 位數代號是要打進 LINE 的）。"; SIXMSG=true; }
      else if (SIXMSG){ SIXMSG=false; msgEl.className="bindm"; msgEl.textContent=""; }
    });
    var p=pairLoad();
    if (p && p.stale){ PAIR=p; pairStart(NOTE_AUTO); }   /* 離開太久才回來（手機切去 LINE、重新整理）：代號已經到期 → 自動換新的並說明 */
    else if (p){ PAIR=p; renderPair("live"); cm.focus({preventScroll:true}); }
    else pairStart();
  }
  /* 驗證碼對了：後端給了鑰匙 → 記在這台（之後直接打網址就進得去）、開始用 */
  function loginOk(r){
    PNOTE="";
    resetSession();
    T=String(r.t); HP.app=T; HP.dev=""; FROMSAVED=false; DEV=!!r.dev;
    keySave();
    out.innerHTML=""; $("sf").hidden=false;
    BOUND=!!r.dev;   /* 開發者版：這台已經綁好了，提示行寫一句 */
    start();
  }
  /* 首頁最下面「登出這台」：開發者 → 先請後端把這台從綁定名單拿掉（名額還回去）；藥師 → 這台把鑰匙忘掉就好。之後這台直接打網址會出現代號登入的畫面 */
  function logoutAsk(){
    note({h:"登出這台？", p:(DEV?"這台會從開發者版的綁定名單拿掉（名額還回去）。":"這台會把登入忘掉。")+"\n之後要再用：直接打網址會出現代號，照畫面上的步驟登入；或從 LINE 的「🌐 補藥神器網頁」按鈕開。", go:"登出", x:"取消"},
      function(v){ if (v==="go") logoutDo(); });
  }
  function logoutDo(){
    var wasDev=DEV, done=false;
    function fin(sent, released){
      if (done) return; done=true;
      keyDrop(); homeDrop(); bxSave();
      resetSession();
      try{ if (/(^|[#&])(x|app|dev)=/.test(location.hash||"")) history.replaceState(null,"",location.pathname); }catch(e){}   /* 網址列上的鑰匙也清掉，不然重新整理又登入了 */
      /* 開發者：後端沒回、或回說「名額沒還成」（released:false，後端正忙拿不到鎖）→ 不要讓人以為還了 */
      var m="✅ 已登出這台。"+(wasDev&&(!sent||released===false)?"\n（開發者名額可能沒能還回去："+(sent?"後端正忙":"連不上後端")+"。回 LINE 打「開發者網頁 重發」可以全部清掉重來）":"");
      if (canCode()) codeForm(m+"\n要再用：照下面的步驟拿代號、到 LINE 換驗證碼，或從 LINE 的「🌐 補藥神器網頁」按鈕開。");
      else { out.innerHTML='<div class="empty"><b>'+esc(m).replace(/\n/g,"<br>")+'</b>要再用：回 LINE 按下面那排的「🌐 補藥神器網頁」開。</div>'; setHint(""); $("sf").hidden=true; $("inst").hidden=true; }
    }
    if (wasDev && LIVE){
      var tm=setTimeout(function(){ fin(false); }, 6000);
      post("appLogout",[]).then(function(j){ clearTimeout(tm); var r=j&&j.ok===1&&j.r; fin(!!(r&&r.ok), r&&r.released); }, function(){ clearTimeout(tm); fin(false); });
    } else fin(true);
  }
  /* 開發者版：這台還沒綁定 → 輸入 LINE「開發者網頁 綁定」給的 6 位數碼（10 分鐘、只能用一次；錯 5 次鎖 1 小時；最多 3 處） */
  function bindForm(msg){
    out.innerHTML='<div class="empty bindbox"><b>'+esc(msg).replace(/\n/g,"<br>")+'</b>'
      +'<form class="bindf" id="bindf" autocomplete="off"><input id="bindc" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6 位數碼" aria-label="綁定碼"><button type="submit" id="bindb">綁定</button></form>'
      +'<span class="bindm" id="bindm" role="status"></span>'
      +'<small>碼 10 分鐘內有效、只能用一次；錯 5 次鎖 1 小時；最多綁 3 處。<br>這組碼只打在這裡，不要傳給任何人。</small></div>';
    setHint(""); $("sf").hidden=true;
    var inp=$("bindc"); try{ inp.focus(); }catch(e){}
    $("bindf").onsubmit=function(e){
      e.preventDefault();
      var c=String(inp.value||"").replace(/\D/g,"");
      if (!/^\d{6}$/.test(c)){ $("bindm").textContent="請輸入 6 位數字"; return; }
      $("bindb").disabled=true; $("bindm").textContent="確認中…";
      post("appBind",[c]).then(function(j){
        $("bindb").disabled=false;
        var r=j&&j.ok===1?j.r:null;
        if (r&&r.ok){ out.innerHTML=""; $("sf").hidden=false; BOUND=true; setHint("✅ 這台綁好了"); start(); return; }
        $("bindm").textContent="❌ "+((r&&r.err)||(j&&j.err)||"沒綁成功，再試一次");
        inp.value=""; try{ inp.focus(); }catch(x){}
      }, function(){ $("bindb").disabled=false; $("bindm").textContent="❌ 連不上後端，網路好了再試一次"; });
    };
  }
  /* 連結檢查：格式對才連。裝置碼跟部署 ID 一起算（算不出來就不送：藥師版照常用，開發者版會請他改用一般模式） */
  function hex(buf){ return Array.prototype.map.call(new Uint8Array(buf),function(x){ return ("0"+x.toString(16)).slice(-2); }).join(""); }
  function gate(cb){
    var later=function(v){ setTimeout(function(){ cb(v); }, 0); };
    if (HP.lst && !T) { later("oldlst"); return; }
    if (!X && !T) { later("none"); return; }
    /* v11.22.2 beta：只知道後端、沒有鑰匙（直接打網址）→ "code"（出代號登入的畫面）。代號、驗證碼都要綁這台的裝置碼：算不出來（無痕模式…）就 "nodk" */
    if (!XRE.test(X) || (T && !/^[0-9a-f]{32}$/.test(T))) { later("bad"); return; }
    if (!window.fetch) { later("old"); return; }
    if (!DK || !(window.crypto&&crypto.subtle&&window.TextEncoder)) { later(T?"ok":"nodk"); return; }
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(DK+"|"+X)).then(function(b){ DKX=hex(b).slice(0,32); cb(T?"ok":"code"); }, function(){ cb(T?"ok":"nodk"); });
  }
  var GATE_MSG={
    none:"🌐 請從 LINE 按下面那排的「🌐 補藥神器網頁」開這個網頁。\n（想直接打網址、用代號登入：這個瀏覽器要先從 LINE 的「🌐 補藥神器網頁」開過一次（或由開發者在 GitHub 放好 cfg.js，LINE 打「開發者網頁 設定」有步驟），之後直接打網址，畫面上就會出現代號。\n主畫面的圖示也要先從 LINE 開過一次，之後才能直接開。）",
    nodk:"🔒 這個瀏覽器沒辦法記住這台裝置（可能是無痕模式、關掉了網站資料，或瀏覽器太舊），沒辦法用代號登入。\n請用一般模式開（或換 Chrome、Safari 最新版），或從 LINE 的「🌐 補藥神器網頁」按鈕開。",
    oldlst:"📋 清單校對的連結換新了。\n回 LINE 打「清單校對」，再按「📤 多張上傳」或「📋 待審清單」。",
    bad:"這條連結不完整。\n回 LINE 按下面那排的「🌐 補藥神器網頁」再開一次。",
    old:"這個瀏覽器太舊，開不了補藥神器。請改用最新的 Chrome 或 Safari。"
  };

  /* ══════════ 小工具 ══════════ */
  /* 照片載不到就拿掉那一張（v11.20.0：不寫行內的錯誤處理，嚴格的安全設定不准網頁裡有行內程式） */
  document.addEventListener("error", function(e){ var t=e.target; if(t&&t.tagName==="IMG"&&t.hasAttribute("data-rm")&&t.parentNode) t.parentNode.removeChild(t); }, true);
  function esc(s){ return String(s===null||s===undefined?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  /* v11.22.2 beta（第 8 批）：查無時搜尋列下面的黃色提示框，跟著「這一屏」：換提示字（查下一個、回首頁、登出…）或內容換掉（開一支藥、回首頁、換成登入畫面…）就收起來。
     只有「查無」那兩處，在畫面排好之後叫 noBox(true)（這一輪的內容變動不算，下一輪才算；顯示時捲回最上面，一定看得到）。 */
  var nbKeep=false;
  function nbHide(){ if (nobox) nobox.hidden=true; }   /* 保險：index.html 漏換（找不到黃框那個元素）時，黃框的程式整個略過，其他功能照常 */
  if (nobox && window.MutationObserver) new MutationObserver(function(){ if (!nbKeep) nbHide(); }).observe(out,{childList:true});
  function noBox(on){ if (!nobox) return; nobox.hidden=!on; nbKeep=!!on; if (on){ setTimeout(function(){ nbKeep=false; },0); window.scrollTo({top:0}); } }
  function setHint(s, bad, busy){ nbHide(); if(s===HINT0) hint.innerHTML=s+(window.innerWidth>=700?' <span>拖照片進來或 Ctrl+V 貼上也能辨識</span>':''); else hint.textContent=s||""; hint.className="hint"+(bad?" bad":"")+(busy?" busy":""); }
  /* 錠／水：正式版由後端算好 r.kind；這裡的規則＝劑型有「水、液、漿、滴、注射、針」或位置開頭是「水」→ 水，其他都算錠 */
  function kindOf(r){ if(r.kind==="水"||r.kind==="錠") return r.kind; var f=String(r.form||""), l=String(r.location||""); return (/水|液|漿|滴|注射|針/.test(f)||/^\s*水/.test(l))?"水":"錠"; }   /* 只認「錠」「水」兩個字，後端給別的一律自己算 */
  function num(x){ return +x||0; }   /* 數字才放進畫面（不信任後端給的 length） */
  /* 每一列最前面一張小照片：有藥品照片就放照片（捲到才載入），沒有就放錠／水的小圖 */
  function thumbHtml(r){
    var th=r.thumb||(r.photo?String(r.photo).replace(/([?&]sz=w)\d+/,"$1320"):"");   /* v11.22.2 beta：w120→w320（照片框放大了） */
    return '<span class="ph"><img class="ki" src="'+ICON[kindOf(r)]+'" alt="">'+(th?'<img class="pi" src="'+esc(th)+'" loading="lazy" alt="" data-rm="">':'')+'</span>';
  }
  /* 一列的長相跟 LINE 公告卡一樣：照片｜藥名、中文（有數量就接 ×數量）、extra（公告補充）、劑型小圖＋錠／水＋CODE｜位置 */
  /* v11.22.2：照片才有的：藥師寫在藥名後面的數量（×20） */
  var PH_KEYS=["qty"];
  function isPh(r){ return !!(r&&r.qty); }
  function noPh(r){ var c={}, k; for (k in r) if (Object.prototype.hasOwnProperty.call(r,k) && PH_KEYS.indexOf(k)<0) c[k]=r[k]; return c; }
  /* 照片那一份（查到的＋「可能是」的候選）裡有沒有這一支 */
  function photoHas(res, code){ return (res.rows||[]).some(function(x){ return x.code===code; }) || (res.asks||[]).some(function(a){ return (a.rows||[]).some(function(x){ return x.code===code; }); }); }
  /* 開發者改完（✏️、📷 換照片、公告照片）：新的那一列照樣帶照片的數量 */
  function keepPh(from, to){ PH_KEYS.forEach(function(k){ if(from&&from[k]) to[k]=from[k]; }); return to; }
  /* 開發者改完：上一份清單（照片那一份也是）裡同一支換成新的，按「← 回清單」看到的是改好的（每一列自己的數量照舊） */
  function swapRow(nr){
    if (!LAST) return;
    var fix=function(list){ for (var i=0;list&&i<list.length;i++) if (list[i].code===nr.code) list[i]=keepPh(list[i], noPh(nr)); };
    fix(LAST.rows);
    if (LAST.photo){ if (LAST.photo.rows!==LAST.rows) fix(LAST.photo.rows); (LAST.photo.asks||[]).forEach(function(a){ fix(a.rows); }); }
  }
  function rowHtml(r, extra){
    var k=kindOf(r);
    return '<button type="button" class="row" data-code="'+esc(r.code)+'"'+(isPh(r)?' data-ph="1"':'')+'>'+thumbHtml(r)
      +'<span class="n"><b>'+esc(r.brand)+'</b><span class="z">'+esc(r.chName||"")+(r.qty?'　×'+esc(r.qty):'')+'</span>'+(extra||'')
      +'<span class="k"><img src="'+ICON[k]+'" alt="">'+esc(k)+'<span class="c mono">'+esc(r.code)+'</span></span></span>'
      +'<span class="l">'+esc(r.location||"")+'</span></button>';
  }
  /* 同成分彙整：三段（不同劑量／不同劑型／同劑量其他廠牌），列的長相跟清單一樣，點了開那支藥 */
  var SAME={};
  /* 藥品家族收起／打開（跟 LINE 一樣預設收起）：按過「▸ 打開」就記住，每支手機各記各的 */
  var FAMFOLD=true; try{ FAMFOLD=localStorage.getItem("bfam")!=="0"; }catch(x){}
  var SAME_SEC=[["dose","💊 同成分不同劑量"],["form","🔁 同成分不同劑型"],["brand","🏷 同成分同劑量"]];
  function sameHtml(res){
    /* 固定三段＋複方：多出來的成分一段（➕ CLAVULANATE 的成分）、只有部分成分的照它們有的成分一段（🧩 AMOXYCILLIN 的成分） */
    var secs=[];
    SAME_SEC.forEach(function(sec){ var list=res[sec[0]]||[]; if(list.length) secs.push({title:sec[1], rows:list}); });
    (res.combo||[]).forEach(function(g){ secs.push({title:"➕ "+g.name+" 的成分", rows:g.rows}); });
    (res.part||[]).forEach(function(g){ secs.push({title:"🧩 "+g.name+" 的成分", rows:g.rows}); });
    var h='', total=0;
    secs.forEach(function(sec){ total+=num(sec.rows.length); });
    if (!total) return '';
    h+='<button type="button" class="kg same" data-fam="1" aria-expanded="'+(!FAMFOLD)+'"><img src="'+ICON["錠"]+'" alt="">藥品家族<b>'+total+' 個品項</b><span class="fold">'+(FAMFOLD?'▸ 打開':'▾ 收起')+'</span></button>';
    secs.forEach(function(sec){
      h+='<div class="sub">'+esc(sec.title)+'<b>'+num(sec.rows.length)+' 個品項</b></div>';
      if (!FAMFOLD) sec.rows.forEach(function(x){ h+=rowHtml(x, x.formLabel?'<i class="fl">'+esc(x.formLabel)+'</i>':''); });
    });
    return '<div class="list samebox">'+h+'</div>';
  }
  function homeBtn(){ return '<div class="actions"><button type="button" class="quiet" data-go="home">🏠 首頁</button></div>'; }

  /* ══════════ 首頁：公告＋所有藥品 ══════════ */
  /* 首頁的骨架（公告、所有藥品兩個框，裡面寫「載入中…」）：不問後台。開頁時先畫這個，後台回來再填；他等的時候先去查別的，回來也不會被蓋掉 */
  function homeShell(){
    var h='<section class="sec"><div class="sh"><b>📢 公告</b><span id="ncount"></span></div><div class="tabs wrap" role="tablist" id="ntabs"></div><div class="list" id="nlist"><div class="none">載入中…</div></div></section>';
    h+='<section class="sec"><div class="sh"><b>💊 所有藥品</b><span id="acount"></span></div>'
      +'<div class="tabs" role="tablist"><button type="button" role="tab" data-tab="錠" aria-selected="'+(TAB==="錠")+'"><img src="'+ICON["錠"]+'" alt="">錠<small id="c錠"></small></button>'
      +'<button type="button" role="tab" data-tab="水" aria-selected="'+(TAB==="水")+'"><img src="'+ICON["水"]+'" alt="">水<small id="c水"></small></button></div>'
      +'<div class="sortrow">排序<button type="button" data-sort="name" aria-pressed="'+(SORT==="name")+'">藥名</button><button type="button" data-sort="loc" aria-pressed="'+(SORT==="loc")+'">位置</button></div>'
      +'<div class="list" id="alist"><div class="none">載入中…</div></div></section>';
    /* v11.22.2 beta：首頁最下面一行小字「登出這台」（只有首頁有；正式連線才有，預覽沒有） */
    if (LIVE) h+='<div class="lo"><button type="button" data-go="logout">登出這台</button></div>';
    out.innerHTML=h;
    window.scrollTo({top:0});
  }
  function renderHome(){
    homeShell();
    if (HOME) fillHome(HOME); else call("appHome",[T],function(res){ if(!res||res.err){ var em=String(res&&typeof res.err==="string"&&res.err||"首頁載入失敗"); setHint("❌ "+em, true); homeFail(em); return; } HOME=res; homeSave(res); if($("nlist")) fillHome(res); },
      function(e){ var em=String(e&&e.message||e||"連不上後端"); setHint("❌ "+em, true); homeFail(em); });
  }
  function fillHome(d){
    var n=0, groups=d.notices||[];
    groups.forEach(function(g){ n+=num(g.rows&&g.rows.length); });
    /* 公告：分類做成一排分頁（跟下面錠／水同一種長相），點哪一類、清單就換成那一類 */
    if (n){
      if (!(NCAT>=0 && NCAT<groups.length)) NCAT=0;
      $("ntabs").innerHTML=groups.map(function(g,gi){ return '<button type="button" role="tab" data-ncat="'+gi+'" aria-selected="'+(gi===NCAT)+'">'+(Object.prototype.hasOwnProperty.call(NICON,g.name)?NICON[g.name]:"📌")+' '+esc(g.name)+'<small>'+num(g.rows.length)+'</small></button>'; }).join("");
      fillNotice(groups);
    } else {
      $("ntabs").hidden=true;
      $("nlist").innerHTML='<div class="none">目前沒有藥品通知</div>';
    }
    $("ncount").textContent = n ? n+" 個品項" : "";
    var all=d.drugs||[], cnt={"錠":0,"水":0};
    all.forEach(function(r){ cnt[kindOf(r)]++; });
    $("acount").textContent = all.length+" 個品項"+(UPD?"・更新中…":"");
    $("c錠").textContent=cnt["錠"]; $("c水").textContent=cnt["水"];
    fillAll(all);
  }
  function fillNotice(groups){
    var g=groups[NCAT]; if(!g) return;
    var h=""; g.rows.forEach(function(r){ h+=rowHtml(r, r.memo?'<i>'+esc(r.memo)+'</i>':''); });
    $("nlist").innerHTML=h||'<div class="none">這一類沒有藥</div>';
  }
  function fillAll(all){
    var rows=all.filter(function(r){ return kindOf(r)===TAB; });
    var cmp=function(a,b){ return String(a||"").localeCompare(String(b||""),"zh-Hant",{numeric:true,sensitivity:"base"}); };
    rows.sort(SORT==="loc" ? function(a,b){ return cmp(a.location,b.location)||cmp(a.brand,b.brand); } : function(a,b){ return cmp(a.brand,b.brand); });
    var h=""; rows.forEach(function(r){ h+=rowHtml(r); });
    $("alist").innerHTML = h || '<div class="none">這一類還沒有藥</div>';
  }

  /* ══════════ 清單／卡片 ══════════ */
  var LAST=null;   /* 上一份清單（回清單時要記得標題和分組） */
  var CARD=null;   /* 現在（或最後一次）打開的卡片：{r, back}。開發者身分比卡片晚到時，補上 ✏️ 要用 */
  function renderList(rows, title, extra, loc){
    if (LAST && rows===LAST.rows){ if(title===undefined) title=LAST.title; if(extra===undefined) extra=LAST.extra; if(loc===undefined) loc=LAST.loc; }
    LAST={rows:rows, title:title, extra:extra, loc:loc};
    var h='<div class="list"><div class="h">'+esc(title||("找到 "+rows.length+" 個品項，點一個看卡片"))+'</div>'+(extra||'');
    if (loc){
      /* 位置查詢：跟 LINE 的位置卡一樣分「錠劑類／水劑類」，圖用藥品卡片那兩張 */
      var tab=rows.filter(function(r){ return kindOf(r)!=="水"; }), water=rows.filter(function(r){ return kindOf(r)==="水"; });
      [["錠","錠劑類",tab],["水","水劑類",water]].forEach(function(g){
        if (!g[2].length) return;
        h+='<div class="kg"><img src="'+ICON[g[0]]+'" alt="">'+g[1]+'<b>'+g[2].length+' 個品項</b></div>';
        g[2].forEach(function(r){ FULL[r.code]=r; h+=rowHtml(r); });
      });
    } else rows.forEach(function(r){ FULL[r.code]=r; h+=rowHtml(r); });
    out.innerHTML=h+'</div>'+homeBtn();
    window.scrollTo({top:0});
  }
  /* 查無：後端給「你是不是要找」的候選 */
  function renderGuess(kw, guess){
    var h='<div class="list"><div class="h">沒有「'+esc(kw)+'」，你是不是要找：</div>';
    guess.forEach(function(r){ h+=rowHtml(r); });
    out.innerHTML=h+'</div>'+homeBtn();
    window.scrollTo({top:0});
  }
  /* 照片：查到的＋每一行讀到什麼＋沒對到的名字（附候選） */
  function renderPhoto(res){
    var rows=res.rows||[], asks=res.asks||[], read=res.read||[];
    var chips='';
    if (read.length){ chips='<div class="chips">'+read.map(function(x){ return '<span class="'+(x.none?"no":"ok")+'">'+esc(x.shown)+(x.qty?' ×'+esc(x.qty):'')+'</span>'; }).join('')+'</div>'; }
    /* 只查到一支就直接出卡片；v11.22.2：OCR 接手的（res.via：AI 沒讀到、可能有漏）照樣出清單，上面那一句才看得到 */
    if (rows.length===1 && !asks.length && !res.via){ renderCard(rows[0], null); return; }
    /* v11.22.2：記住這一份，卡片上的「← 回清單」回到這裡（以前會回到更早的查詢清單） */
    LAST={rows:rows, photo:res};
    var h='', mine={};
    /* 語音只有候選（沒有讀到的行、也沒有查到的）→ 不出「📷 讀到 0 行」那一塊 */
    if (rows.length || read.length || !asks.length){
      h='<div class="list"><div class="h">📷 讀到 '+num(read.length)+' 行，查到 '+num(rows.length)+' 個品項'+(res.via?'（'+esc(res.via)+'）':'')+'</div>'+chips;
      rows.forEach(function(r){ FULL[r.code]=r; mine[r.code]=1; h+=rowHtml(r); });
      if (!rows.length && !asks.length) h+='<div class="none">沒有對到院內的藥。拍清楚一點（字面朝上、光線夠）再試，或直接打字查。</div>';
      h+='</div>';
    }
    asks.forEach(function(a){
      h+='<div class="list"><div class="g">❓ 「'+esc(a.name)+'」沒對到，可能是：</div>';
      /* v11.22.2：候選裡剛好有上面查到的那一支 → 不蓋掉上面那一列（它帶著照片上的數量） */
      a.rows.forEach(function(r){ if(!mine[r.code]) FULL[r.code]=r; h+=rowHtml(r); });
      h+='</div>';
    });
    out.innerHTML=h+homeBtn();
    window.scrollTo({top:0});
  }
  /* v11.22.2 beta（第 4 批）：位置框裡的紅色圖釘（一小段內嵌的向量圖，不用另外載圖，也不違反網頁的安全設定 CSP；給讀螢幕軟體念「位置」） */
  var PIN2='<svg class="pinsvg" viewBox="0 0 24 30" role="img" aria-label="位置" focusable="false"><path d="M12 0C5.4 0 0 5.3 0 11.8 0 20.4 12 30 12 30s12-9.6 12-18.2C24 5.3 18.6 0 12 0z" fill="#E5403A"/><circle cx="12" cy="11.8" r="6.8" fill="#fff"/><g transform="rotate(-45 12 11.8)"><rect x="6.6" y="8.6" width="10.8" height="6.4" rx="3.2" fill="#fff" stroke="#E5403A" stroke-width="1.3"/><path d="M6.6 11.8a3.2 3.2 0 0 1 3.2-3.2H12v6.4H9.8a3.2 3.2 0 0 1-3.2-3.2z" fill="#E5403A"/></g></svg>';
  function renderCard(r, backTo){
    FULL[r.code]=r; CARD={r:r, back:backTo};
    var spot = SPOT[r.code] || (r.spots&&r.spots.length ? r.spots[0].name : "");
    var mapUrl = r.map||"";
    if (r.spots&&r.spots.length){ r.spots.forEach(function(s){ if(s.name===spot&&s.map) mapUrl=s.map; }); }
    var refOk = /^https?:\/\//i.test(String(r.ref||""));   /* 參考網站只接 http(s)（後端給別的開頭的，當作沒有；縱深防禦） */
    var h='<article class="card" id="card" data-code="'+esc(r.code)+'">';
    h+='<div class="head"><div class="t"><div class="code mono">'+esc(r.code)+(r.qty?' <span class="qty">×'+esc(r.qty)+'</span>':'')+'</div><div class="brand">'+esc(r.brand)+'</div>'
      +(r.chName?'<div class="zh">'+esc(r.chName)+'</div>':'')+(r.generic?'<div class="gen">'+esc(r.generic)+'</div>':'')+'</div>'
      +'<div class="side">'+(refOk?'<a class="icon" href="'+esc(r.ref)+'" target="_blank" rel="noopener noreferrer" title="點圖院內藥物查詢" aria-label="點圖院內藥物查詢">':'<div class="icon" title="'+esc(r.form||"")+'">')
      +'<img src="'+ICON[kindOf(r)]+'" alt="'+esc(kindOf(r))+'">'+(refOk?'</a>':'</div>')
      +'</div>';
    if (r.notice){
      h+='<div class="box notice"><span class="k" role="img" aria-label="公告">⚠️</span><span class="v">'+esc(r.notice)+'</span>';
      var zt=(r.zones&&r.zones.length)?'<table class="zones"><caption>📍 各區位置</caption>'+r.zones.map(function(z){ return '<tr><th>'+esc(z.name)+'</th><td>'+esc(z.pos)+'</td></tr>'; }).join("")+'</table>':'';
      var np=r.npic?'<img class="npic" src="'+esc(String(r.npic).replace(/([?&]sz=w)\d+/,"$1400"))+'" alt="公告照片" data-big="'+esc(r.npic)+'">':'';
      if (zt||np) h+='<div class="nrow">'+(zt||(np?'<span class="sp"></span>':''))+np+'</div>';
      h+='</div>';
    }
    h+='</div>';   /* /.head（公告放在標題區裡：標題下面整條淡黃橫幅） */
    /* v11.22.2 beta（第 4 批）：灰底外框（.pnl）包住 藥品特徵＋適應症（＋注意、曾用藥品、縮寫）＋照片；位置（📍粉紅框＋平面圖＋多個位置的按鍵）自己一整行，在灰底外框下面 */
    var left='', hasNote=!!(r.pair||r.note||r.old||r.abbr);
    if (r.pair) left+='<div class="box pair"><span class="k">⚠️ 注意</span><span class="v">'+esc(r.pair)+'</span></div>';
    if (r.note) left+='<div class="kv"><span class="k">適應症</span><span class="v">'+esc(r.note)+'</span></div>';
    if (r.old)  left+='<div class="kv"><span class="k">曾用藥品</span><span class="v">'+esc(r.old)+'</span></div>';
    if (r.abbr) left+='<div class="kv"><span class="k">縮寫</span><span class="v">'+esc(r.abbr)+'</span></div>';
    var pn='', hf=!!r.feat, hp=!!r.photo;
    if (hf) pn+='<div class="box feat"><span class="k">🔍 藥品特徵</span><span class="v">'+esc(r.feat)+'</span></div>';
    if (hasNote||hp) pn+='<div class="grid2'+(hp?'':' nophoto')+'"><div class="pinfo">'+left+'</div>'
      +(hp?'<img class="photo" src="'+esc(r.photo)+'" alt="藥品照片" data-big="'+esc(r.photo)+'">':'')+'</div>';
    /* 電腦版灰底框裡的格子：有什麼放什麼（f＝特徵、i＝注意＋適應症那一疊、p＝照片）；特徵和注意／適應症都有就排成 3 欄（手機是直排，不用這兩串） */
    var ga = hp ? (hf&&hasNote ? "'f i p'" : hf ? "'f p'" : hasNote ? "'i p'" : "'p'") : (hf&&hasNote ? "'f i'" : hf ? "'f'" : "'i'");
    var gc = hp&&!hf&&!hasNote ? 'auto' : hp ? (hf&&hasNote ? 'minmax(0,1.1fr) minmax(0,1fr) auto' : 'minmax(0,1fr) auto') : (hf&&hasNote ? 'minmax(0,1.1fr) minmax(0,1fr)' : 'minmax(0,1fr)');
    /* 位置（自己一整行）：粉紅框跟字一樣寬、文字一行不換行；多個位置的按鍵放在粉紅框正下面；平面圖在右邊（手機放不下就換到下面） */
    var sp='';
    if (r.spots&&r.spots.length>1){
      sp='<div class="spots">'+r.spots.map(function(s){ return '<button type="button" data-spot="'+esc(s.name)+'" aria-pressed="'+(s.name===spot)+'">'+esc(s.name)+'</button>'; }).join("")+'</div>';
    }
    var lr='<div class="locrow"><div class="lleft"><div class="loc"><span class="pin">'+PIN2+'</span><span class="t">'+esc(r.location||"—")+'</span></div>'+sp+'</div>'
      +(mapUrl?'<img class="map" src="'+esc(mapUrl)+'" alt="平面圖" data-big="'+esc(r.mapBig||mapUrl)+'">':'')+'</div>';
    h+='<div class="cbody">'+(pn?'<div class="pnl'+(hp&&!hf&&!hasNote?' solo':'')+'" style="--ga:'+ga+';--gc:'+gc+'">'+pn+'</div>':'')+lr+'</div>';
    /* 有清單才有「← 回清單」；開發者版多一顆「✏️ 修改」（跟 LINE 卡片一樣）。首頁請點左上 logo。
       v11.22.2 beta（第 3 批）：按鍵放在藥品家族「上面」——家族是後來才載入的，放在按鍵上面會把按鍵擠出視窗（手機也會往下跳一下） */
    var acts=[];
    if (backTo&&(backTo.length>1||(LAST&&LAST.photo&&LAST.rows===backTo))) acts.push('<button type="button" class="quiet" id="back">← 回清單</button>');
    /*DEV*/if (DEV) acts.push('<button type="button" class="edit" id="edit">✏️ 修改</button>');/*/DEV*/
    if (acts.length) h+='<div class="actions">'+acts.join("")+'</div>';
    /* 藥品家族（v11.18.0）：卡片最下面；另外問後端，有才出現 */
    h+='<div id="same">'+(SAME[r.code]?sameHtml(SAME[r.code]):'')+'</div>';
    h+='</article>';
    out.innerHTML=h;
    Array.prototype.forEach.call(out.querySelectorAll("img[data-big]"),function(im){ im.onclick=function(){ $("lbimg").src=im.dataset.big; $("lb").hidden=false; }; });
    Array.prototype.forEach.call(out.querySelectorAll(".spots button"),function(b){ b.onclick=function(){ SPOT[r.code]=b.dataset.spot; renderCard(r, backTo); }; });
    if ($("back")) $("back").onclick=function(){ if (LAST&&LAST.photo&&LAST.rows===backTo) renderPhoto(LAST.photo); else renderList(backTo); };
    if (!SAME[r.code]) call("appSame",[T, r.code],function(res){ if(!res||res.err) return; SAME[r.code]=res; var el=$("same"); if(el&&out.contains(el)&&el.closest("article")&&el.closest("article").getAttribute("data-code")===String(r.code)) el.innerHTML=sameHtml(res); });   /* v11.22.2：比卡片上記的 CODE（以前比 .code 的字，有「×數量」時永遠對不上，藥品家族第一次打開出不來） */
    /*DEV*/if ($("edit")) $("edit").onclick=function(){ renderEdit(r, backTo); };/*/DEV*/
    fitCard();
    window.scrollTo({top:0});
  }
  /* 點清單任何一列：查過的直接開卡片，沒查過的（首頁的精簡列）用 CODE 去後端拿完整資料 */
  /* 從查詢清單點進卡片 → 卡片有「← 回清單」（回到同一份清單、同樣的分組） */
  /* v11.22.2：照片上的數量（×20）只跟著照片那一份清單走；
     首頁、公告、藥品家族裡點到同一支（FULL 裡還是照片那一列）→ 開沒有數量的卡片，不會把紙條上的數量帶到別的地方 */
  function openCode(code, ph){
    var r=FULL[code]; if (r && !ph && isPh(r)) r=noPh(r);
    /* 「← 回清單」：照片那一份（查到的、候選的都算，幾列都一樣）回照片；查詢清單照舊（兩列以上才有） */
    var back = LAST&&LAST.photo ? (photoHas(LAST.photo, code)?LAST.rows:null) : (LAST&&LAST.rows&&LAST.rows.length>1&&LAST.rows.some(function(x){return x.code===code;})?LAST.rows:null);
    if (r) renderCard(r, back); else search(code);
  }
  out.addEventListener("click", function(e){
    var b=e.target.closest ? e.target.closest("button") : null; if(!b) return;
    if (b.dataset.code){ openCode(b.dataset.code, b.hasAttribute("data-ph")); return; }
    if (b.hasAttribute("data-fam")){ FAMFOLD=!FAMFOLD; try{localStorage.setItem("bfam",FAMFOLD?"1":"0");}catch(x){} var fe=$("same"), fa=fe&&fe.closest("article"), fc=fa&&fa.getAttribute("data-code"); if (fe&&SAME[fc]) fe.innerHTML=sameHtml(SAME[fc]); return; }
    if (b.dataset.go==="home"){ renderHome(); return; }
    if (b.dataset.go==="logout"){ logoutAsk(); return; }
    if (b.dataset.go==="reload"){ try{ location.reload(); }catch(x){} return; }
    if (b.dataset.go==="pair"){ PFOC=true; pairStart(); return; }   /* v11.22.2 beta：代號登入的「重新取得代號」「再試一次」 */
    if (b.dataset.ncat!==undefined){ NCAT=+b.dataset.ncat; Array.prototype.forEach.call(out.querySelectorAll("[data-ncat]"),function(t){ t.setAttribute("aria-selected", +t.dataset.ncat===NCAT); }); if(HOME) fillNotice(HOME.notices||[]); return; }
    if (b.dataset.tab){ TAB=b.dataset.tab; try{localStorage.setItem("bt",TAB);}catch(x){} Array.prototype.forEach.call(out.querySelectorAll("[data-tab]"),function(t){ t.setAttribute("aria-selected", t.dataset.tab===TAB); }); if(HOME) fillAll(HOME.drugs||[]); return; }
    if (b.dataset.sort){ SORT=b.dataset.sort; try{localStorage.setItem("bs",SORT);}catch(x){} Array.prototype.forEach.call(out.querySelectorAll("[data-sort]"),function(t){ t.setAttribute("aria-pressed", t.dataset.sort===SORT); }); if(HOME) fillAll(HOME.drugs||[]); return; }
  });
  $("home").onclick=function(){ if (noKey()) return; q.value=""; setHint(HINT0); renderHome(); };   /* 還沒登入（畫面上是代號登入）：按 logo 什麼都不做——不然會拿空鑰匙去問首頁，還把登入中的畫面重畫一次 */

  /*DEV*/
  /* ══════════ 修改（開發者版才有這一段；藥師版出頁時整段拿掉）══════════ */
  /* 16 欄跟 LINE 的 ✏️ 改 一模一樣；字母＝LINE「一次改」的代號（A～J），沒有代號的就是 LINE 上沒給字母的那幾欄 */
  var EF=[
    {k:"brand", c:"A", l:"商品名"},
    {k:"zh",    c:"B", l:"中文"},
    {k:"loc",   c:"C", l:"小藥庫位置", cap:1},
    {k:"form",  l:"劑型", list:1},
    {k:"gen",   c:"E", l:"學名", ta:1, nl:1},
    {k:"ref",   l:"藥品查詢參考網站", url:1, hint:"貼院內網站那一頁的整串網址（http:// 或 https:// 開頭）；卡片右上角的劑型圖會連過去"},
    {k:"feat",  c:"D", l:"藥品特徵", ta:1, nl:1},
    {k:"note",  l:"適應症", ta:1, nl:1},
    {k:"pair",  l:"注意", ta:1, nl:1},
    {k:"old",   c:"I", l:"曾用藥品", ta:1, nl:1, hint:"一行一個（卡片上就一行一個），或用「、」分開"},
    {k:"pic",   l:"📷 換照片", pic:1},
    {k:"photo", c:"F", l:"藥品外觀（照片網址）", url:1, hint:"通常不用手動改——上面「換照片」存好會自動填"},
    {k:"nk",    c:"G", l:"公告類別", nk:1},
    {k:"nm",    c:"H", l:"公告補充說明", ta:1, nl:1},
    {k:"npic",  l:"📷 公告照片", npic:1},
    {k:"zones", l:"📍 各區位置（公告框裡的表格）", zones:1},
    {k:"map",   l:"🗺 平面圖", map:1},
    {k:"abbr",  c:"J", l:"縮寫", hint:"多個用逗號分開，例如 HCTZ, HCT；清空＝全部拿掉"}
  ];
  var NK={"":"（沒有公告）","1":"1 停止供貨","2":"2 改包裝通知","3":"3 製廠缺貨","4":"4 換廠","5":"5 給慢箋"};
  var ZONES=[["z1","成錠"],["z2","兒錠"],["z3","兒水"],["z4","急診"],["z5","UD1"],["z6","UD2"]];
  var FORMS=["錠劑","膠囊","口服液","糖漿","懸液","眼藥水","滴劑","噴劑","藥膏","乳膏","貼片","栓劑","注射液","粉劑","顆粒","外用液"];
  function mapOpts(m){
    var cur=m&&m.now||"", h='';
    var opt=function(v,l){ return '<option value="'+esc(v)+'"'+(v===cur?" selected":"")+'>'+esc(l)+'</option>'; };
    h+=opt("","自動判斷（跟著小藥庫位置走）")+opt("公藥","沒有平面圖（公藥那種）");
    h+='<optgroup label="棧板">'+opt("棧左","棧左")+opt("棧中","棧中")+opt("棧右","棧右")+'</optgroup>';
    var n=m&&m.names||{};
    [["錠櫃",n.tab],["水櫃",n.water],["其他",n.other],["雲端資料夾裡的圖",n.drive]].forEach(function(g){
      if(!g[1]||!g[1].length) return;
      h+='<optgroup label="'+esc(g[0])+'">'+g[1].map(function(x){ return opt(x,x); }).join("")+'</optgroup>';
    });
    if (cur && h.indexOf('value="'+esc(cur)+'"')<0) h+=opt(cur,cur+"（現在設的）");
    return h;
  }
  function renderEdit(r, backTo){
    out.innerHTML='<article class="card"><div class="head"><div class="t"><div class="code mono">'+esc(r.code)+'</div><div class="brand">'+esc(r.brand)+'</div></div></div><div class="edit"><div class="t">✏️ 讀現在的內容…</div></div></article>';
    window.scrollTo({top:0});
    call("appEditInfo",[T, r.code],function(info){
      if (!info || info.err){ setHint("❌ "+(info&&info.err||"讀不到現在的內容"), true); renderCard(r, backTo); return; }
      buildEdit(r, backTo, info);
    });
  }
  function buildEdit(r, backTo, info){
    var v=info.vals||{}, h='<article class="card"><div class="head"><div class="t"><div class="code mono">'+esc(r.code)+'</div><div class="brand">'+esc(r.brand)+'</div></div></div>';
    h+='<div class="edit"><div class="t">✏️ 跟 LINE 的 ✏️ 改 同樣 16 欄：直接改下面的框，按「存」就寫進試算表。照片選好會直接存進雲端（不用按「存」）。學名、藥品特徵、適應症、注意、曾用藥品、公告補充說明可以多行：按 Enter 換行，卡片上就跳行。</div>';
    EF.forEach(function(f){
      var k=f.k, cur=v[k]===undefined||v[k]===null?"":String(v[k]);
      h+='<div class="f"><label for="e_'+k+'">'+(f.c?'<b>'+f.c+'</b>':'')+esc(f.l)+'</label>';
      if (f.pic){
        h+='<div class="picrow drop" id="e_picdrop" data-zone="photo" tabindex="0"><span class="ph big"><img class="ki" src="'+ICON[kindOf(r)]+'" alt="">'+(r.thumb||r.photo?'<img class="pi" id="e_picimg" src="'+esc(r.thumb||r.photo)+'" alt="" data-rm="">':'')+'</span>'
          +'<span class="dz"><button type="button" class="quiet" id="e_picbtn">📷 拍照或選照片</button><small>或把照片拖到這一格、點一下這格再 Ctrl+V 貼上</small></span><input type="file" id="e_picfile" accept="image/*" hidden></div>'
          +'<span class="was" id="e_picmsg">存進雲端照片資料夾（檔名 '+esc(r.code)+'.jpeg），舊的會移到「舊照片」，卡片馬上換新照片</span></div>';
        return;
      }
      if (f.npic){
        var np=v.npic||"";
        h+='<div class="picrow drop" id="e_npicdrop" data-zone="npic" tabindex="0"><span class="ph big" id="e_npicph">'+(np?'<img class="pi" id="e_npicimg" src="'+esc(String(np).replace(/([?&]sz=w)\d+/,"$1120"))+'" alt="" data-rm="">':'<span class="none">沒有</span>')+'</span>'
          +'<span class="dz"><span class="dzb"><button type="button" id="e_npicbtn">📷 拍照或選照片</button>'+(np?'<button type="button" id="e_npicdel">🗑 移除</button>':'')+'</span><small>或把照片拖到這一格、點一下這格再 Ctrl+V 貼上</small></span><input type="file" id="e_npicfile" accept="image/*" hidden></div>'
          +'<span class="was" id="e_npicmsg">顯示在藥品卡片的公告框裡（例如新包裝的外盒）；選好直接存進雲端「公告照片」，公告移除時一起拿掉</span></div>';
        return;
      }
      if (f.zones){
        h+='<div class="zgrid">'+ZONES.map(function(z){ var zv=v[z[0]]||""; return '<label class="zc"><span>'+esc(z[1])+'</span><input id="e_'+z[0]+'" value="'+esc(zv)+'" autocapitalize="characters" placeholder="（沒放）"></label>'; }).join("")+'</div>'
          +'<span class="was">成錠、兒錠、兒水、急診、UD1、UD2 各區的位置；有填的區才會出現在公告框的表格（有公告的藥才顯示）</span></div>';
        return;
      }
      if (f.map){
        var m=info.map||{}, now=m.now||"", nowText=!now?"自動判斷":(now==="公藥"?"沒有平面圖":now);
        h+='<select id="e_map">'+mapOpts(m)+'</select><span class="was">原本：'+esc(nowText)+'　設完全院立刻生效</span></div>';
        return;
      }
      if (f.nk){
        h+='<select id="e_'+k+'">'+Object.keys(NK).map(function(n){ return '<option value="'+n+'"'+(cur===n?" selected":"")+'>'+esc(NK[n])+'</option>'; }).join("")+'</select>';
      } else if (f.ta){
        h+='<textarea id="e_'+k+'">'+esc(cur)+'</textarea>';
      } else if (f.list){
        h+='<input id="e_'+k+'" value="'+esc(cur)+'" list="l_'+k+'"><datalist id="l_'+k+'">'+FORMS.map(function(x){ return '<option value="'+esc(x)+'">'; }).join("")+'</datalist>';
      } else {
        h+='<input id="e_'+k+'" value="'+esc(cur)+'"'+(f.cap?' autocapitalize="characters"':'')+(f.url?' inputmode="url"':'')+'>';
      }
      h+='<span class="was">'+(f.nl?'按 Enter 換行＝卡片上跳行　':'')+(f.hint?esc(f.hint)+'　':'')+'原本：'+(cur?esc((cur.length>60?cur.slice(0,60)+"…":cur).replace(/\n/g," ⏎ ")):"（空的）")+'</span></div>';
    });
    h+='<div class="actions"><button type="button" class="quiet" id="ecancel">取消</button><button type="button" class="pri" id="esave">💾 存</button></div></div></article>';
    out.innerHTML=h;
    $("ecancel").onclick=function(){ renderCard(r, backTo); };
    /* 📷 換照片：選好就直接送（跟 LINE 一樣，照片是唯一不用按「存」的） */
    $("e_picbtn").onclick=function(){ $("e_picfile").click(); };
    $("e_picfile").onchange=function(e){ var file=e.target.files&&e.target.files[0]; e.target.value=""; if(file) uploadPic(file); };
    function uploadPic(file){
      if (!file||!/^image\//.test(file.type||"")) { setHint("❌ 這不是照片檔", true); return; }
      $("e_picbtn").disabled=true; $("e_picmsg").textContent="📷 讀照片…";
      shrink(file,function(b64,mime,kb){
        $("e_picmsg").textContent="📷 存進雲端（"+kb+" KB）…";
        call("appPic",[T, r.code, b64, mime],function(res){
          $("e_picbtn").disabled=false;
          if (!res || res.err){ $("e_picmsg").textContent="❌ "+(res&&res.err||"沒存成"); setHint("❌ "+(res&&res.err||"照片沒存成"), true); return; }
          $("e_picmsg").textContent="✅ 換好了（雲端 "+(res.name||"")+(res.moved&&res.moved.length?"；舊的移到「舊照片」":"")+"）新照片要幾秒鐘才會出現";
          if (res.url){ var im=$("e_picimg"); var th=String(res.url).replace(/([?&]sz=w)\d+/,"$1120"); if(im) im.src=th; else { var ph=$("e_picbtn").parentNode.querySelector(".ph"); if(ph) ph.insertAdjacentHTML("beforeend",'<img class="pi" id="e_picimg" src="'+esc(th)+'" alt="" data-rm="">'); } r.photo=res.url; r.thumb=th; if($("e_photo")) $("e_photo").value=res.url; v.photo=res.url; }
          if (res.row){ keepPh(r, res.row); FULL[res.row.code]=res.row; r=res.row; swapRow(res.row); }
          HOME=null; homeDrop();
          setHint("✅ "+r.code+" 照片換好了");
        });
      });
    }
    /* 📷 公告照片：選好直接存（跟換照片一樣）；🗑 移除＝按「存」時一起送 npic:"" */
    var npicDel=false;
    $("e_npicbtn").onclick=function(){ $("e_npicfile").click(); };
    if ($("e_npicdel")) $("e_npicdel").onclick=function(){ npicDel=!npicDel; this.textContent=npicDel?"↩ 不移除":"🗑 移除"; $("e_npicmsg").textContent=npicDel?"按「存」就把公告照片拿掉":"顯示在藥品卡片的公告框裡"; };
    $("e_npicfile").onchange=function(e){ var file=e.target.files&&e.target.files[0]; e.target.value=""; if(file) uploadNpic(file); };
    function uploadNpic(file){
      if (!file||!/^image\//.test(file.type||"")) { setHint("❌ 這不是照片檔", true); return; }
      $("e_npicbtn").disabled=true; $("e_npicmsg").textContent="📷 讀照片…";
      shrink(file,function(b64,mime,kb){
        $("e_npicmsg").textContent="📷 存進雲端（"+kb+" KB）…";
        call("appPic",[T, r.code, b64, mime, "npic"],function(res){
          $("e_npicbtn").disabled=false;
          if (!res || res.err){ $("e_npicmsg").textContent="❌ "+(res&&res.err||"沒存成"); setHint("❌ "+(res&&res.err||"公告照片沒存成"), true); return; }
          npicDel=false; $("e_npicmsg").textContent="✅ 公告照片換好了（雲端 公告照片／"+(res.name||"")+"）"+(v.nk?"":"　⚠️ 這支藥還沒掛公告，掛上才會顯示");
          if (res.url){ var th=String(res.url).replace(/([?&]sz=w)\d+/,"$1120"); $("e_npicph").innerHTML='<img class="pi" id="e_npicimg" src="'+esc(th)+'" alt="" data-rm="">'; v.npic=res.url; }
          if (res.row){ keepPh(r, res.row); FULL[res.row.code]=res.row; r=res.row; swapRow(res.row); }
          HOME=null; homeDrop();
        });
      });
    }
    /* 拖進格子／貼上：兩格各自收拖進來的照片；Ctrl+V 貼上放到「最後點過」的那一格（預設藥品照片） */
    EDIT_ZONE={photo:uploadPic, npic:uploadNpic, active:"photo"};
    [$("e_picdrop"), $("e_npicdrop")].forEach(function(z){
      if (!z) return;
      z.addEventListener("click", function(){ EDIT_ZONE.active=z.dataset.zone; markZone(); });
      z.addEventListener("focus", function(){ EDIT_ZONE.active=z.dataset.zone; markZone(); });
      z.addEventListener("dragover", function(e){ e.preventDefault(); e.stopPropagation(); z.classList.add("over"); });
      z.addEventListener("dragleave", function(){ z.classList.remove("over"); });
      z.addEventListener("drop", function(e){ e.preventDefault(); e.stopPropagation(); z.classList.remove("over"); var f=dropFile(e); if (f){ EDIT_ZONE.active=z.dataset.zone; markZone(); EDIT_ZONE[z.dataset.zone](f); } });
    });
    function markZone(){ [$("e_picdrop"), $("e_npicdrop")].forEach(function(z){ if(z) z.classList.toggle("active", z.dataset.zone===EDIT_ZONE.active); }); }
    markZone();
    $("esave").onclick=function(){
      var ch={};
      EF.forEach(function(f){ if(f.pic||f.map||f.npic||f.zones) return; var k=f.k, el=$("e_"+k); if(!el) return; var val=el.value; var cur=v[k]===undefined||v[k]===null?"":String(v[k]); if(k==="loc") val=val.toUpperCase(); if(val!==cur) ch[k]=val; });
      ZONES.forEach(function(z){ var el=$("e_"+z[0]); if(!el) return; var val=el.value.trim(), cur=(v[z[0]]||"").toString(); if(val!==cur) ch[z[0]]=val; });
      if (npicDel) ch.npic="";
      var mapNow=(info.map&&info.map.now)||"", mapSel=$("e_map")?$("e_map").value:mapNow; if(mapSel!==mapNow) ch.map=mapSel;
      if (!Object.keys(ch).length){ setHint("沒有改任何東西"); renderCard(r, backTo); return; }
      if (ch.ref && !/^https?:\/\/\S+$/i.test(ch.ref)){ setHint("❌ 藥品查詢參考網站：要以 http:// 或 https:// 開頭、中間不能有空格", true); $("e_ref").focus(); return; }
      $("esave").disabled=true; setHint("寫進試算表…", false, true);
      call("appEdit",[T, r.code, ch],function(res){
        if (!res || res.err){ setHint("❌ "+(res&&res.err||"寫入失敗"), true); $("esave").disabled=false; return; }
        var done=res.done||[], errs=res.errs||[];
        if (errs.length) setHint((done.length?"✅ 改好 "+done.join("、")+"；":"")+"⚠️ 沒改成："+errs.join("；"), true);
        else setHint("✅ 改好 "+done.length+" 項（"+done.join("、")+"），已寫進試算表"+(res.undo?"　↩️ 改錯了：LINE 打「復原 "+res.undo+"」":""));
        var nr=res.row?res.row:r; if(res.row){ keepPh(r, nr); FULL[nr.code]=nr; swapRow(nr); }   /* v11.22.2：照片來的那一張，改完照樣帶數量；上一份清單裡那一列也換成改好的 */
        HOME=null; homeDrop();                      /* 首頁的公告、藥品清單下次回首頁重抓 */
        renderCard(nr, backTo);
      });
    };
    window.scrollTo({top:0});
  }
  /*/DEV*/

  /* ══════════ 查詢 ══════════ */
  function show(res, label, kw){
    if (!res || res.err){ setHint("❌ "+(res&&res.err||"查詢失敗"), true); return; }
    var rows=res.rows||[];
    if (!rows.length){
      setHint(label+"：查無 😥　換個關鍵字，或打 CODE 試試", true);
      if (res.guess&&res.guess.length) renderGuess(kw||"", res.guess);
      noBox(true);   /* 要在畫面排好之後才叫：下面那個「內容一換就收起來」不會把剛出現的黃框收掉 */
      return;
    }
    if (res.warn) setHint("⚠️ "+res.warn, true);
    else setHint(label+"：找到 "+rows.length+" 個品項"+(res.ms?"　"+res.ms+" ms":""));
    if (rows.length===1) renderCard(rows[0], null); else renderList(rows, res.title, undefined, res.loc||"");
  }
  function search(kw){
    kw=(kw||q.value||"").trim(); if(!kw) return;
    /* 看起來像連結、鑰匙的不送出去：補藥神器永遠不會叫人把連結貼進搜尋框（假網頁騙鑰匙的常見手法） */
    if (/[0-9a-f]{32}/i.test(kw) || /[#&?](x|app|dev|lst)=|https?:\/\/|script\.google|github\.io/i.test(kw)){ q.value=""; setHint("⚠️ 這看起來是連結或鑰匙，沒有送出去。補藥神器不會叫你把連結貼在這裡，有人這樣要求就是詐騙。", true); return; }
    q.value=""; setHint("查「"+kw+"」…", false, true);
    call("appSearch",[T, kw],function(res){ show(res, "「"+kw+"」", kw); });
  }
  $("sf").onsubmit=function(e){ e.preventDefault(); search(); q.blur(); };   /* Enter（手機鍵盤的「搜尋」）就送出 */

  /* ══════════ 語音 ══════════
     v11.20.0：網頁在 GitHub 上是最外層的一頁，可以直接用麥克風（不用外殼幫忙）：
     按 🎤 錄最長 6 秒 → 轉成 16kHz 單聲道 WAV → 送後端聽寫（跟 LINE 語音同一套：Groq → Deepgram → Gemini）。
     不能錄音的瀏覽器才退回瀏覽器自己的語音辨識；都不行就請他用鍵盤上的麥克風。
     v11.22.2：講完點畫面任何地方就停止並送出（見 tapOn）；不用再找 🎤 按第二次，6 秒到也會自己送出。 */
  var SR=window.SpeechRecognition||window.webkitSpeechRecognition, rec=null, listening=false;
  var NOMIC=false; try{ NOMIC=localStorage.getItem("nomic")==="1"; }catch(e){}
  var canRec=!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder);
  function micOff(){ $("mic").hidden=true; HINT0='<span>點左上 logo 回首頁</span> <span>🎤 用鍵盤上的麥克風講，講完按 Enter</span> <span>📷 拍包裝</span>'; }
  var MAX_MS=6000, mrec=null, mstream=null, chunks=[], mtimer=null, recOn=false;
  function pickMime(){ var list=["audio/mp4","audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus"]; for(var i=0;i<list.length;i++){ try{ if(MediaRecorder.isTypeSupported(list[i])) return list[i]; }catch(e){} } return ""; }
  function stopRec(){ if(mtimer){ clearTimeout(mtimer); mtimer=null; } try{ if(mrec&&mrec.state!=="inactive") mrec.stop(); }catch(e){} }
  /* v11.22.2：錄音中點畫面任何地方＝停止並送出（不用再找 🎤 按第二次）。錄音的時候蓋一層看不見的膜接住點擊：
     點的這一下只負責停止，不會同時打開被點到的藥、跳出鍵盤、回首頁、叫出相機。停止後膜再留 0.7 秒（吃掉這一下的尾巴，不會點穿）；
     不管出什麼事，最久 MAX_MS＋3 秒一定拿掉，不會卡住整個網頁。剛開始錄的 0.4 秒內點不算（按兩下不會變成沒錄到）。 */
  var tapEl=null, tapFn=null, tapAt=0, tapFail=0;
  function tapOff(now){
    tapFn=null; clearTimeout(tapFail); tapFail=0;
    var el=tapEl; tapEl=null; if (!el) return;
    var rm=function(){ try{ if(el.parentNode) el.parentNode.removeChild(el); }catch(x){} };
    if (now===true) rm(); else setTimeout(rm, 700);
  }
  function tapOn(fn){
    tapOff(true); tapFn=fn; tapAt=Date.now();
    var el=document.createElement("div"); el.setAttribute("aria-hidden","true");
    el.style.cssText="position:fixed;top:0;left:0;right:0;bottom:0;z-index:30;background:transparent;touch-action:none;cursor:pointer;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none";
    var hit=function(e){ try{ e.preventDefault(); e.stopPropagation(); }catch(x){} if (Date.now()-tapAt<400) return; var f=tapFn; tapFn=null; if (f){ try{ f(); }catch(x){} } };
    el.addEventListener("pointerdown",hit); el.addEventListener("touchstart",hit,{passive:false}); el.addEventListener("click",hit);
    document.body.appendChild(el); tapEl=el;
    tapFail=setTimeout(function(){ tapOff(true); }, MAX_MS+3000);
  }
  function release(){ try{ if(mstream) mstream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){} mstream=null; mrec=null; tapOff(); }
  /* 錄音轉成 16kHz 單聲道 WAV：手機錄出來的 webm／m4a 各家不同，聽寫拿 wav 最穩；解不開就回 null、照送原檔 */
  function toWav(blob, cb){
    var AC=window.OfflineAudioContext||window.webkitOfflineAudioContext;
    if (!AC||!blob.arrayBuffer){ cb(null); return; }
    var done=false; function fin(v){ if(!done){ done=true; cb(v); } }
    setTimeout(function(){ fin(null); }, 4000);
    blob.arrayBuffer().then(function(buf){
      var probe=new AC(1,16000,16000);
      var pr=probe.decodeAudioData(buf,function(audio){ fin(encode(audio)); },function(){ fin(null); });
      if (pr&&pr.then) pr.then(function(audio){ fin(encode(audio)); }).catch(function(){ fin(null); });
    }).catch(function(){ fin(null); });
    function encode(audio){
      try{
        var sr=audio.sampleRate, n=audio.length, ch=audio.numberOfChannels, mono=new Float32Array(n);
        for(var c=0;c<ch;c++){ var d=audio.getChannelData(c); for(var i=0;i<n;i++) mono[i]+=d[i]/ch; }
        var target=16000, ratio=sr/target, len=Math.floor(n/ratio), pcm=new Int16Array(len);
        for(var j=0;j<len;j++){ var s0=Math.floor(j*ratio), s1=Math.min(n,Math.floor((j+1)*ratio)), sum=0, cnt=0; for(var k=s0;k<s1;k++){ sum+=mono[k]; cnt++; } var v=cnt?sum/cnt:0; v=Math.max(-1,Math.min(1,v)); pcm[j]=v<0?v*32768:v*32767; }
        var wav=new ArrayBuffer(44+pcm.length*2), dv=new DataView(wav);
        function str(o,t){ for(var i=0;i<t.length;i++) dv.setUint8(o+i,t.charCodeAt(i)); }
        str(0,"RIFF"); dv.setUint32(4,36+pcm.length*2,true); str(8,"WAVE"); str(12,"fmt ");
        dv.setUint32(16,16,true); dv.setUint16(20,1,true); dv.setUint16(22,1,true); dv.setUint32(24,target,true);
        dv.setUint32(28,target*2,true); dv.setUint16(32,2,true); dv.setUint16(34,16,true); str(36,"data"); dv.setUint32(40,pcm.length*2,true);
        new Int16Array(wav,44).set(pcm);
        return new Blob([wav],{type:"audio/wav"});
      }catch(e){ return null; }
    }
  }
  function recErr(why){ recOn=false; $("mic").className=""; tapOff(true); setHint("🎤 "+(why==="denied"?"麥克風沒有允許：請在瀏覽器的網站設定允許麥克風（在 LINE 裡開的，請按右上角改用瀏覽器開）":"錄音失敗（"+why+"），再試一次"), true); }
  function startRec(){
    if (mrec&&mrec.state==="recording") return;
    chunks=[];
    navigator.mediaDevices.getUserMedia({audio:true}).then(function(st){
      mstream=st; var mime=pickMime();
      try{ mrec=mime?new MediaRecorder(st,{mimeType:mime}):new MediaRecorder(st); }catch(e){ release(); recErr("recorder"); return; }
      mrec.ondataavailable=function(ev){ if(ev.data&&ev.data.size) chunks.push(ev.data); };
      mrec.onstop=function(){
        var type=mrec&&mrec.mimeType||mime||"audio/mp4", blob=new Blob(chunks,{type:type});
        release(); recOn=false; $("mic").className="";
        if (!blob.size){ setHint("🎤 沒錄到聲音，再試一次", true); return; }
        setHint("🎤 整理錄音…", false, true);
        toWav(blob,function(wav){
          var o=wav||blob, om=wav?"audio/wav":type.split(";")[0], fr=new FileReader();
          fr.onload=function(){ var u=String(fr.result); sendVoice(u.substring(u.indexOf(",")+1), om, Math.round(o.size/1024)); };
          fr.onerror=function(){ setHint("🎤 錄音讀不出來，再試一次", true); };
          fr.readAsDataURL(o);
        });
      };
      mrec.onerror=function(){ release(); recErr("recorder"); };
      mrec.start(); recOn=true; $("mic").className="on"; setHint("🎤 請講藥名或 CODE，講完點畫面任何地方就送出"); hint.classList.add("rec"); tapOn(stopRec);
      mtimer=setTimeout(stopRec, MAX_MS);
    }).catch(function(err){ recErr(err&&(err.name==="NotAllowedError"||err.name==="SecurityError")?"denied":(err&&err.name||"mic")); });
  }
  function sendVoice(b64, mime, kb){
    setHint("🎤 聽寫中（"+kb+" KB）…", false, true);
    call("appVoice",[T,b64,mime],function(res){
      if (!res || res.err){ setHint("❌ "+(res&&res.err||"語音查詢失敗"), true); return; }
      var rows=res.rows||[], asks=res.asks||[];
      var heard=res.said?"🎤 聽到「"+res.said+"」":"🎤 沒聽到";
      if (!res.said){ setHint(heard+"　再講一次，只講藥名或 CODE", true); return; }
      if (!res.kw){ setHint(heard+"，但沒聽出藥名 😥　直接講藥名或 CODE 就好", true); return; }
      if (rows.length){ setHint(heard+(res.kw!==res.said?" → 查「"+res.kw+"」":"")+(res.loose?"（沒有完全一樣的，用最接近的）":"")+"：找到 "+rows.length+" 個品項"); if(rows.length===1) renderCard(rows[0],null); else renderList(rows); return; }
      if (asks.length){ setHint(heard+" → 查「"+res.kw+"」沒有完全一樣的，可能是下面這幾個品項", true); renderPhoto({rows:[],asks:asks,read:[]}); return; }
      setHint(heard+" → 查無「"+res.kw+"」😥　聽錯字的話改講 CODE 最準", true);
      noBox(true);
    }, null, { retrying:function(n){ setHint("🎤 網路剛斷了一下，自動再送一次（第 "+n+" 次）…", false, true); } });
  }
  if (NOMIC || (!canRec && !SR)) { micOff(); }
  else if (canRec) { $("mic").title="按一下講藥名，講完點畫面任何地方就送出（最長 6 秒）"; $("mic").onclick=function(){ if(recOn) stopRec(); else startRec(); }; }
  else {
    $("mic").onclick=function(){
      if (listening){ try{rec.stop();}catch(e){} return; }
      rec=new SR(); rec.lang="zh-TW"; rec.interimResults=true; rec.maxAlternatives=1;
      rec.onstart=function(){ listening=true; $("mic").className="on"; setHint("🎤 請講藥名…講完點畫面任何地方就查"); hint.classList.add("rec"); tapOn(function(){ try{rec.stop();}catch(e){} }); };
      rec.onresult=function(e){ var t=""; for(var i=0;i<e.results.length;i++) t+=e.results[i][0].transcript; q.value=t; if(e.results[e.results.length-1].isFinal){ search(t); } };
      rec.onerror=function(e){
        if (e.error==="not-allowed"||e.error==="service-not-allowed"){ try{localStorage.setItem("nomic","1");}catch(x){} micOff(); setHint("這個瀏覽器不讓網頁用麥克風。改按鍵盤上的 🎤 講，講完按 Enter 就查", true); return; }
        setHint("🎤 沒聽到（"+(e.error||"?")+"），再試一次", true); };
      rec.onend=function(){ listening=false; $("mic").className=""; tapOff(); if (hint.classList.contains("rec")) setHint(HINT0); };
      try{ rec.start(); }catch(e){ setHint("🎤 這個瀏覽器不能用麥克風", true); }
    };
  }

  /* ══════════ 拍照 ══════════ */
  $("cam").onclick=function(){ $("file").click(); };
  $("file").onchange=function(e){ var f=e.target.files&&e.target.files[0]; e.target.value=""; if(!f) return; sendPhoto(f); };
  /* 拖進來、貼上（v11.17.5）：修改表單開著 → 給那兩格；其他時候 → 當成拍包裝辨識 */
  var EDIT_ZONE=null;
  function dropFile(e){ var dt=e.dataTransfer; if(!dt) return null; var fs=dt.files; for (var i=0;i<(fs?fs.length:0);i++) if (/^image\//.test(fs[i].type||"")) return fs[i]; return null; }
  function pasteFile(e){ var cd=e.clipboardData; if(!cd||!cd.items) return null; for (var i=0;i<cd.items.length;i++) if (cd.items[i].kind==="file"&&/^image\//.test(cd.items[i].type||"")) return cd.items[i].getAsFile(); return null; }
  function editOpen(){ return !!$("esave"); }
  document.addEventListener("paste", function(e){
    var f=pasteFile(e); if(!f) return;            /* 貼的是文字就照常（例如貼進搜尋框） */
    e.preventDefault();
    if (editOpen()&&EDIT_ZONE){ EDIT_ZONE[EDIT_ZONE.active](f); return; }
    sendPhoto(f);
  });
  document.addEventListener("dragover", function(e){ if(!dropFile(e)&&!(e.dataTransfer&&e.dataTransfer.types&&Array.prototype.indexOf.call(e.dataTransfer.types,"Files")>=0)) return; e.preventDefault(); if(!editOpen()) setHint("📷 放開就辨識這張照片", false); });
  document.addEventListener("drop", function(e){
    var f=dropFile(e); if(!f){ e.preventDefault(); return; }
    e.preventDefault();
    if (editOpen()&&EDIT_ZONE){ EDIT_ZONE[EDIT_ZONE.active](f); return; }   /* 表單開著卻沒拖進格子 → 給最後點過的那格 */
    sendPhoto(f);
  });
  /* 縮圖。opt＝{px:最長邊, q:JPEG 品質, kb:目標大小(KB), fail:讀不到檔時呼叫}；沒給＝存藥品照片用的老樣子（2600px、品質 .92、3MB 內）。
     v11.22.2：檔案超過目標大小 → 品質一格一格降（最多降 4 次）直到進目標；不會再把小圖放大。
     cb(b64, mime, kb, alt)：alt(px, q, kb) 可以再縮出一個更小的版本（照片已經讀進來了，不用重讀）；照片解不開時 alt 是 null。 */
  function shrink(file, cb, opt){
    opt=opt||{};
    var fr=new FileReader();
    fr.onload=function(){ var raw=String(fr.result), im=new Image(), mime=file.type||"image/jpeg";
      var enc=function(px, q, kbMax){
        var w=im.width,h=im.height,lg=Math.max(w,h),kb=Math.round(raw.length*3/4/1024);
        if(lg<=px&&kb<=kbMax) return {b64:raw.substring(raw.indexOf(",")+1), mime:mime, kb:kb};
        var sc=Math.min(1,px/lg),cv=document.createElement("canvas"); cv.width=Math.round(w*sc); cv.height=Math.round(h*sc);
        cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);
        var u="", k=0;
        for (var i=0;i<5;i++){ u=cv.toDataURL("image/jpeg",q); k=Math.round(u.length*3/4/1024); if (k<=kbMax||q<=.55) break; q=Math.max(.55,q-.1); }
        return {b64:u.substring(u.indexOf(",")+1), mime:"image/jpeg", kb:k};
      };
      im.onload=function(){ var r=enc(opt.px||2600, opt.q||.92, opt.kb||3000); cb(r.b64, r.mime, r.kb, enc); };
      im.onerror=function(){ cb(raw.substring(raw.indexOf(",")+1), mime, Math.round(file.size/1024), null); };
      im.src=raw; };
    fr.onerror=function(){ if (opt.fail) opt.fail(); };
    fr.readAsDataURL(file);
  }
  /* v11.22.2：辨識用的照片縮到最長邊 2000px、900KB 內（以前 2600px、3MB：手機上傳一大包，網路一晃就斷）；
     斷線會自動重送，第 3 次改送最小的版本（1280px、250KB）。 */
  var PH_MAIN={px:2000, q:.85, kb:900}, PH_SMALL={px:1280, q:.75, kb:250};
  function sendPhoto(file){
    if (noKey()) return;   /* 還沒登入：貼上、拖進來的照片不送（沒有鑰匙，後端只會記一次錯誤） */
    setHint("📷 讀照片…", false, true);
    shrink(file,function(b64,mime,kb,alt){
      var cur={b64:b64, mime:mime, kb:kb, small:false}, sent=[];
      setHint("📷 辨識中（"+kb+" KB）…通常 3～8 秒", false, true);
      call("appPhoto",[T,b64,mime],function(res){
        if (!res || res.err){ setHint("❌ "+(res&&res.err||"辨識失敗"), true); return; }
        var n=(res.rows||[]).length, warn=[];
        if (res.truncated) warn.push("可能沒讀完");
        if (res.hand) warn.push("手寫");
        setHint("📷 讀到 "+(res.read||[]).length+" 行、查到 "+n+" 個品項"+(warn.length?"（"+warn.join("、")+"）":"")+(res.ms?"　"+(res.ms/1000).toFixed(1)+" 秒":""), false);
        if ((res.read||[]).length) aiWarnAdd();
        renderPhoto(res);
      }, function(e){
        setHint(e&&e.net?"❌ 照片送不出去（"+e.tech+"；照片 "+sent.join("→")+" KB）。網路不穩的話，換個訊號好的地方再按 📷；急的話直接把照片傳到 LINE 給補藥神器":"❌ "+(e&&e.message||e), true);
      }, {
        args:function(n){
          if (n>=3&&alt&&!cur.small){ var s=alt(PH_SMALL.px, PH_SMALL.q, PH_SMALL.kb); if (s&&s.kb<cur.kb) cur={b64:s.b64, mime:s.mime, kb:s.kb, small:true}; }
          sent.push(cur.kb);
          return [T,cur.b64,cur.mime];
        },
        retrying:function(n){ setHint("📷 "+(cur.small?"還是沒通，改送縮小的照片":"網路剛斷了一下，自動再送一次")+"（第 "+n+" 次，"+cur.kb+" KB）…", false, true); }
      });
    }, {px:PH_MAIN.px, q:PH_MAIN.q, kb:PH_MAIN.kb, fail:function(){ setHint("❌ 讀不到這張照片，請再選一次", true); }});
  }

  /* ══════════ 燈箱 ══════════ */
  $("lbx").onclick=function(){ $("lb").hidden=true; $("lbimg").src=""; };
  $("lb").onclick=function(e){ if(e.target===$("lb")) $("lbx").onclick(); };
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&!$("lb").hidden) $("lbx").onclick(); });

  /* ══════════ 提醒／確認視窗（v11.22.2 beta）══════════
     note(opt, cb)：跳出一張跟「加到主畫面」同樣式的視窗，一定要按其中一顆才會關（點旁邊、按 Esc 都不算）。
     opt＝{h:標題, p:第一段（可以帶 <b>，只放我們自己寫死的字）, ids:等寬的兩行字（用 textContent 放）, q:第二段, n:小字, go:主要按鍵的字（不給就不出）, x:次要按鍵的字}；
     cb("go") 或 cb("x")。 */
  function note(opt, cb){
    $("nth").textContent=opt.h||"";
    var p=$("ntp"); p.innerHTML=opt.p||""; p.hidden=!opt.p;
    var ids=$("nti"); ids.textContent=opt.ids||""; ids.hidden=!opt.ids;
    var q=$("ntq"); q.innerHTML=opt.q||""; q.hidden=!opt.q;
    $("ntn").textContent=opt.n||"";
    var g=$("ntgo"), x=$("ntx"); g.textContent=opt.go||""; g.hidden=!opt.go; x.textContent=opt.x||"知道了";
    var done=false;
    function fin(v){ if (done) return; done=true; $("nts").hidden=true; if (cb) cb(v); }
    g.onclick=function(){ fin("go"); };
    x.onclick=function(){ fin("x"); };
    $("nts").hidden=false; try{ if (opt.nofocus){ var nh=$("nth"); nh.setAttribute("tabindex","-1"); nh.focus(); } else (opt.go?g:x).focus(); }catch(e){}
  }
  /* 第一次使用：拍照、錄音前的提醒（每個瀏覽器只出現一次，按「知道了」就記住；瀏覽器不讓記的就每次都出） */
  var NOTE_KEY="bn1";
  function noticeSeen(){ try{ return localStorage.getItem(NOTE_KEY)==="1"; }catch(e){ return false; } }
  function noticeFirst(){
    if (noticeSeen()) return;
    note({h:"📷 拍照、錄音前請注意", p:"AI 可能讀錯，請核對 CODE 再拿藥。",
          n:"這個網頁請只用 LINE 補藥神器給的東西進來：按鈕「🌐 補藥神器網頁」，或自己打網址、把畫面上的代號打給 LINE 補藥神器換驗證碼。不要點別人傳來的連結；驗證碼不要給別人，別人傳給你的代號也不要幫他打進 LINE。", x:"知道了"},
         function(){ try{ localStorage.setItem(NOTE_KEY,"1"); }catch(e){} });
  }
  /* 防釣魚：這台瀏覽器記著原本的後端（bk.x），這次連結帶的後端卻不一樣 → 先問，不直接蓋掉。
     只看連結裡有沒有帶新的後端（#x=…）；沒帶（從主畫面圖示開）、或這台還沒記過（第一次）都不問。
     按「維持原來的」＝照舊用記住的那一條、把網址列清掉；按「用新連結」＝用這條，後端說 OK 之後才蓋掉原本記的。 */
  function backendCheck(cb){
    /* v11.22.2 beta：原本用的後端＝記著的鑰匙（bk）、其次是記著的後端（bx）、其次是 cfg.js；連結只帶後端（#x=…）也要比 */
    var S=keyLoad(), RX=CFGX||(S?S.x:bxLoad());   /* cfg.js（開發者自己放的）優先於這台記的 */
    if (CFGX && S && S.x!==CFGX) S=null;   /* 記的鑰匙不是 cfg.js 那個後端 → 不拿它當原本的 */
    if (!RX || !HP.x || RX===HP.x || !XRE.test(HP.x) || (HP.lst && !(HP.dev||HP.app))){ cb(); return; }   /* 舊的清單校對連結（帶 lst、沒有鑰匙）不問：下面會直接說「連結換新了」 */
    note({h:"⚠️ 這條連結要連到不同的後端", p:"這台原本連的後端，跟這條連結的不一樣。<b>拿 LINE 卡片上的「後端代號」來對</b>，哪一個一樣就選哪一個：", ids:"原本連的：…"+RX.slice(-6)+"\n這條連結：…"+HP.x.slice(-6),
          q:"兩個都對不上、或這條連結不是你自己從 LINE 按的，請直接關掉這個網頁。", go:"用原本連的", x:"用這條連結的", nofocus:true},
         function(v){
           if (v==="go"){
             X=RX; HP.x=RX; HP.dev="";
             if (S){ T=S.t; HP.app=S.t; FROMSAVED=true; } else { T=""; HP.app=""; }
             try{ history.replaceState(null,"",location.pathname); }catch(e){}
           }
           cb();
         });
  }
  /* 照片辨識完，搜尋框下面那行多一句提醒（只查到一支、直接出卡片時也看得到） */
  function aiWarnAdd(){ var w=document.createElement("span"); w.className="aiw"; w.textContent="⚠️ AI 可能讀錯，請核對 CODE 再拿藥"; hint.appendChild(document.createElement("br")); hint.appendChild(w); }

  /* ══════════ 開場 ══════════
     v11.22.2 beta（乙-2、乙-3）：開頁只問後台一趟——首頁清單和「身分、版本、剩幾天」一起回來（appHome 的第二個參數 1）。
     這台記得上次的清單（bh1，最多 7 天、同一個後端）就先畫出來，後台回來再換（一樣就不動）；後台說鑰匙不對、這台還沒綁定就清掉。
     後台還是舊的（回來沒有 info）→ 退回原本的兩趟（appInfo；清單已經拿到就直接用）。有 ?q= 直接查的、預覽（假資料）照原本走。 */
  var UPD=false, HOME_KEEP_MS=7*864e5;
  function homeLoad(){ try{ var o=JSON.parse(localStorage.getItem("bh1")||"null"), now=Date.now();
    if (o && o.x===X && typeof o.at==="number" && o.at<=now+6e4 && now-o.at<HOME_KEEP_MS && o.d && Array.isArray(o.d.notices) && Array.isArray(o.d.drugs) && o.d.drugs.length) return o;
    if (o && o.x===X) homeDrop();   /* 同一個後端記的、但太舊／壞掉／在未來 → 順手清掉（別的後端記的不動） */
    }catch(e){} return null; }
  function homeSave(d){ try{ if (T && LIVE && d && Array.isArray(d.notices) && Array.isArray(d.drugs) && d.drugs.length) localStorage.setItem("bh1", JSON.stringify({x:X, at:Date.now(), d:{notices:d.notices, drugs:d.drugs}})); }catch(e){} }
  function homeDrop(){ try{ var o=JSON.parse(localStorage.getItem("bh1")||"null"); if (!o || o.x===X) localStorage.removeItem("bh1"); }catch(e){ try{ localStorage.removeItem("bh1"); }catch(x){} } }
  function homeSig(d){ try{ return JSON.stringify([d.notices, d.drugs]); }catch(e){ return ""; } }
  function updOff(){ UPD=false; var a=$("acount"); if (a) a.textContent=a.textContent.replace("・更新中…",""); }
  /* 原本 appInfo 回來之後做的事（順序沒變） */
  function ready(info){
    DEV=!!(info&&info.dev);
    /*DEV*/if (DEV && !$("home").querySelector(".devtag")){ $("home").classList.add("dev"); $("home").insertAdjacentHTML("beforeend",'<span class="devtag">開發者版</span>'); }/*/DEV*/
    HINT0=HINT0.replace(/^<span>⚠️ 這條連結[^<]*<\/span> /,"");   /* 先拿掉上一位留下的到期警告 */
    if (info&&typeof info.days==="number"&&info.days<=3) HINT0='<span>⚠️ 這條連結 '+num(info.days)+' 天後過期，回 LINE 打「網頁」換新的</span> '+HINT0;
    if (LIVE){ keySave(); hideKey(); } instShow();
    noticeFirst();
    /* 先秒開了上次的清單、他在後台回來前就點進某一支：那時還不知道是不是開發者，卡片沒有 ✏️ → 身分到了補上（重畫同一張卡片） */
    /*DEV*/if (DEV && CARD && !$("edit") && out.querySelector("article.card[data-code]")) renderCard(CARD.r, CARD.back);/*/DEV*/
  }
  /* 開發者版才有：搜尋框下面一行小字，量「開頁」到底等了幾秒（藥師看不到） */
  function devTime(ms, srv, cached){
    /*DEV*/if (!DEV) return;
    var w=document.createElement("span"); w.className="tm";
    w.textContent="⏱ 開頁 "+(ms/1000).toFixed(1)+" 秒"+(typeof srv==="number"?"（後台算清單 "+(srv/1000).toFixed(1)+" 秒）":"")+(cached?"・先秒開了上次的清單":"");
    hint.appendChild(document.createElement("br")); hint.appendChild(w);/*/DEV*/
  }
  function hint0(){ return BOUND?"✅ 這台綁好了，以後在這裡直接開就好（不用再輸入）。":HINT0; }
  function start(){
    if (!LIVE || HP.q){
      call("appInfo",[T],function(info){
        if (info&&info.err){ stop(info.err, "tok"); return; }
        ready(info);
        if (HP.q){ search(HP.q); return; }
        setHint(hint0()); BOUND=false; renderHome();
      });
      return;
    }
    var t0=Date.now(), c=homeLoad(), shown=!!c;
    /* 先把畫面放好（這樣等後台的時候他可以先做別的事，後台回來不會蓋掉他做的）：提示行、首頁（有記住的 → 上次的清單，個數後面標「更新中…」；沒有 → 「載入中…」的骨架） */
    setHint(hint0());
    var h0=hint.innerHTML+"|"+hint.className;
    if (c){ HOME=c.d; UPD=true; renderHome(); } else homeShell();
    call("appHome",[T,1],function(res){
      if (!res){ updOff(); setHint("❌ 首頁載入失敗", true); if (!shown) homeFail("首頁載入失敗"); return; }
      if (res.err){ stop(typeof res.err==="string"?res.err:"登入的鑰匙有問題", "tok"); return; }
      function go(info){
        var ms=Date.now()-t0, d={notices:res.notices||[], drugs:res.drugs||[], ms:res.ms};
        ready(info);
        /* 搜尋框下面那行：他這段時間沒動它才更新（他已經在查東西、拍照的話不動） */
        var mine=(hint.innerHTML+"|"+hint.className)===h0;
        if (mine) setHint(hint0());
        BOUND=false;
        if (shown && !d.drugs.length){   /* 後台這次沒給藥品清單（讀不到）：不蓋掉、不記；他看到的還是上次的 */
          updOff();
          if (mine) setHint("⚠️ 後台這次沒給藥品清單，先顯示上次的（可能不是最新）", true);
          return;
        }
        var same=shown && homeSig(HOME)===homeSig(d);
        HOME=d.drugs.length?d:null; homeSave(d);   /* 沒有藥品（後台這次讀不到）就不留著，點 logo 回首頁時會再問一次 */
        if ($("nlist")){ if (same) updOff(); else { UPD=false; fillHome(d); } }   /* 還在首頁才動畫面；他已經去別的畫面了，回首頁時會用新的 */
        else UPD=false;
        if (mine) devTime(ms, res.ms, shown);
      }
      if (res.info) go(res.info);
      else call("appInfo",[T],function(info){ if (info&&info.err){ stop(info.err, "tok"); return; } go(info); },   /* 後台還是舊的 → 原本的兩趟 */
        function(){ go(null); });   /* 這一趟也斷了：清單已經拿到了，照樣顯示（身分讀不到就當藥師） */
    }, function(e){
      updOff();
      if (shown && $("acount")){ setHint("⚠️ "+(e&&e.net?"連不上後端":(e&&e.message||"後台沒有回應"))+"，先顯示上次的清單（可能不是最新）", true); return; }
      setHint("❌ "+(e&&e.message||e), true);
      if (!shown) homeFail(String(e&&e.message||e||"連不上後端"));
    });
  }

  /* ══════════ 📲 加到主畫面／桌面（v11.22.2）══════════
     Android 的 Chrome、電腦的 Chrome／Edge：瀏覽器先問過「這個網頁可以安裝」（beforeinstallprompt）→ 按一下就跳出安裝視窗，
     裝好 = 手機主畫面／電腦桌面有一個「補藥神器」圖示，開起來沒有網址列。iPhone、iPad 的 Safari 沒有這種一鍵：按了出一張說明
     （分享 → 加入主畫面）。從 LINE 裡面開的先請他改用 Safari／Chrome 開。已經是從圖示開的（standalone）就不出這顆。 */
  var DP=null, UA=navigator.userAgent||"";
  var IOS=/iPhone|iPad|iPod/.test(UA)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  var ANDROID=/Android/i.test(UA), INLINE=/\bLine\//i.test(UA), MAC=/Macintosh/.test(UA)&&!IOS;
  var SAFARI=/Safari\//.test(UA)&&!/Chrome|CriOS|Chromium|Edg|FxiOS|OPR/.test(UA);
  var STANDALONE=false; try{ STANDALONE=(window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true; }catch(e){}
  var inst=$("inst");
  inst.textContent=(IOS||ANDROID)?"📲 加到主畫面":"📲 加到桌面";
  window.addEventListener("beforeinstallprompt", function(e){ e.preventDefault(); DP=e; });
  window.addEventListener("appinstalled", function(){ DP=null; inst.hidden=true; setHint("✅ 加好了！以後從"+((IOS||ANDROID)?"主畫面":"桌面")+"的圖示開就好。"); });
  function instShow(){ if (!STANDALONE && LIVE) inst.hidden=false; }
  inst.onclick=function(){
    if (DP){ var p=DP; DP=null; try{ p.prompt(); }catch(e){ instGuide(); } return; }
    instGuide();
  };
  /* LINE 裡面開的：一顆按鍵直接換到 Safari（iPhone：x-safari- 開頭的網址）／Chrome（Android：intent 網址；鑰匙放在 ?x=&app=，
     網頁一開就搬到 # 後面），到了那邊再按一次 📲 就是一鍵。按了沒反應（少數版本不讓跳）→ 下面還有手動的做法 */
  function handoff(){
    var here=location.origin+location.pathname;
    if (IOS) return "x-safari-"+here+"#x="+encodeURIComponent(X)+"&app="+encodeURIComponent(T);
    var q="?x="+encodeURIComponent(X)+"&app="+encodeURIComponent(T);
    return "intent://"+location.host+location.pathname+q+"#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url="+encodeURIComponent(here+q)+";end";
  }
  function instGuide(){
    var h="📲 加到主畫面", p="", s=[], n="加好之後從圖示開就直接進來，不用再從 LINE 找連結。連結 30 天到期時，回 LINE 打「網頁」開一次就好。", go="";
    if (INLINE){ go=IOS?"用 Safari 開這一頁":"用 Chrome 開這一頁"; p="LINE 裡面沒辦法加到主畫面，先按這顆換到 "+(IOS?"Safari":"Chrome")+"："; s=[]; n=(IOS?"到了 Safari 再按一次「📲 加到主畫面」，照那三步做。":"到了 Chrome 再按一次「📲 加到主畫面」→「安裝」就好。")+"\n按了沒反應的話，手動換："+(IOS?"右下角的「⋯」（或分享）→「以 Safari 開啟」":"右上角的「⋮」→「以其他瀏覽器開啟」（選 Chrome）")+"。"; }
    else if (IOS){ p=SAFARI?"照這三步（iPhone 只能這樣加，Apple 不讓網頁自己加）：":"iPhone、iPad 要用 Safari 開才能加（把這個網址貼到 Safari）："; s=["按 Safari 下面（iPad 是上面）的 分享 ⎋（方框加箭頭）","往下找「加入主畫面」","右上角按「新增」"]; }
    else if (ANDROID){ s=["按右上角的「⋮」","按「加到主畫面」（或「安裝應用程式」）","按「安裝」（或「新增」）"]; }
    else if (MAC&&SAFARI){ h="📲 加到 Dock"; s=["Safari 上面的選單「檔案」→「加入 Dock」","按「加入」"]; n="加好之後從 Dock 的圖示開就直接進來。"; }
    else { h="📲 加到桌面"; p="用 Chrome 或 Edge 開這個網頁："; s=["網址列右邊有一個「安裝」的小圖示（電腦加 ⊕），按它","按「安裝」→ 桌面就有圖示了"]; n="沒有那個小圖示：Chrome 右上角「⋮」→「投放、儲存和分享」→「安裝網頁」；Edge 是「⋯」→「應用程式」→「安裝」。"; }
    $("insh").textContent=h; $("insp").textContent=p; $("insp").hidden=!p;
    var g=$("insgo"); g.hidden=!go; g.textContent=go; if (go) g.setAttribute("data-href", handoff()); else g.removeAttribute("data-href");
    $("inso").innerHTML=s.map(function(x){ return "<li>"+esc(x)+"</li>"; }).join("");
    $("insn").textContent=n; $("inss").hidden=false; try{ $("insx").focus(); }catch(e){}
  }
  $("insgo").onclick=function(){ var u=this.getAttribute("data-href")||""; if (u) location.href=u; };
  $("insx").onclick=function(){ $("inss").hidden=true; };
  $("inss").onclick=function(e){ if (e.target===$("inss")) $("inss").hidden=true; };
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&!$("inss").hidden) $("inss").hidden=true; });

  var MOCK={};

  /* 先確認連結格式對，才開始連後端；預覽（沒有連結、有假資料）就用假資料 */
  backendCheck(function(){
    gate(function(g){
      if (g==="ok"){ LIVE=true; API="https://script.google.com/macros/s/"+X+"/exec"; start(); return; }
      if (g==="code"){ codeForm(); return; }   /* v11.22.2 beta：直接打網址、沒有鑰匙 → 代號登入（先拿代號、LINE 換驗證碼、打回來） */
      if (g==="none" && MOCK && MOCK.appInfo){ $("demo").hidden=false; start(); return; }
      stop(GATE_MSG[g]||GATE_MSG.bad, g);
    });
  });
})();
