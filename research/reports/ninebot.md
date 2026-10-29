# 九号 V2 内容采集报告

数据快照：**2026-10-28，中国大陆市场**。本次收尾仅使用当日已保存来源，最终本地校验于2026-10-29完成。

## 已交付内容

- 正式目录：79条独立车型/配置记录，含官方独立SKU的联名款；普通配色作为相册内容，不拆成新车型。
- 63条有官网详细参数，16条历史记录只确认产品身份。官网共有154条目录记录，本库明确排除75条电动自行车、非范围车型或Segway越野车型。
- 在售证据：60条官网有国内购买链接；另19条没有购买入口，状态为unconfirmed。官网有链接不保证经销商实时有货，未把历史记录擅自判定为停售。
- 类别：62条按官网“电动摩托车”表述记录，14条明确电轻摩；A2 60、A2蛋仔联名及Q70c仅确认机动车大类，普通/轻便细分待合格证复核。
- 来源61个，原始目录JSON、产品页、发布报道、车主文章均有本地快照。入口为 data/catalog/ninebot.json。

## 价格覆盖

4条可精确对应配置的历史标准发布售价，75条仍为空；不使用官网USD/0占位价格。M5三款与Q3/N3三款的首发促销、活动起价已移出price和launchPrice，金额、日期和条件只保留notes及evidence.price。M3两款使用原文明确的标准售价，首发优惠价也只保留notes；不把活动价伪装成指导价。A2蛋仔和M5 P的优惠起价只作文字补充。全部4条priceType为launch，不能当作采集日现价。

| 车型/配置 | 历史标准发布售价（元） | 来源发布日期 | 限定 |
|---|---:|---|---|
| M3 100 | 8199 | 2026-05-30 | 2026-05-30媒体转载的上市标准售价8199元；首发优惠价7599元仅保留在备注，不代表2026-10-28现价。 |
| M3 95 | 6599 | 2026-05-30 | 2026-05-30媒体转载的上市标准售价6599元；首发优惠价5999元仅保留在备注，不代表2026-10-28现价。 |
| Q80c 蛋仔派对联名版 | 3899 | 2026-08-28 | 2026-08-28发布报道回顾的该独立联名车型公开售价3899元，原文无“起”或优惠条件。作为历史发布售价记录；原始首发日期、当前成交价仍待核实。 |
| Q85c 蛋仔派对联名版 | 4399 | 2026-08-28 | 2026-08-28发布报道回顾的该独立联名车型公开售价4399元，原文无“起”或优惠条件。作为历史发布售价记录；原始首发日期、当前成交价仍待核实。 |

## 图片验收

正式图库共有**218张本地WebP**：207张官网产品展示图与11张真实实拍。官网展示图已逐张在5张联系表中人工查看，统一标official_render，不计入实拍达标数；未采用通用ClassicProduct占位图，也未用AI图、SVG或别款图补位。

- M95C：6张2024-06-03测评/车主实拍，含整车侧面、前后侧、后轮电机、仪表、座桶；仅匹配历史M95C，不共用于M95c+或MK2。
- E125：5张2023-04-10车主实拍，含仪表、正面、侧面、尾灯、车把；仅匹配旧E125，不共用于E125 MK2。
- 2条达到每款至少3张不同真实照片；63条有官网展示图但实拍不足，14条暂无可确认对应的公开车型图片。剩余77条均未达到实拍验收标准。
- N85c的2022晒单只找到2张明确车辆图，且与当前同名版本的代际关系待核实，因此没有放入当前图库；相关调研预览留在research/sources/ninebot/photo-review/。
- 车主加装的座套、车尾配件等可能可见，已在matchNote说明；不当作原厂配置依据。

每张正式图片均保存originalUrl、sourcePage、sourceId、caption、kind与版本匹配说明；M5单/双电等官网使用同一展示素材的情况通过sharedWith明示。

## 参数处理与可知边界

- 504个数值规格字段均有同名evidence及源ID。额定/最大功率分开，原始电池文字保留在证据中，未默认单电池数量或自行计算能量。
- 续航采用官网“续航里程”字段，rangeCondition同时保留全速/工况/等速原文和不同口径说明；完整载荷、温度等测试脚注仍需逐车型补齐，数值不能直接视作同条件实测。
- ABS只有明确“双通道”原文才记dual，EABS只作能量回收描述；缺少明确有无证据的保持unknown。
- 空价格、座高、重量、充电时长等不以V1演示数据或其他车型值填补。官网旧记录的16条详细参数仍空，便于后续补说明书/合格证。
- 本次是官网目录可复查覆盖，不等于已证明覆盖全国所有经销商库存、所有历史年款和所有地区限定版本。没有把“官网出现”自动等同为确定全国在售。

## 本地校验

校验记录：research/sources/ninebot/validation-summary.json。

- 218条gallery本地路径全部存在，Pillow解码验证通过；每张图源ID都能解析。
- 所有模型sourceIds、evidence引用均有效，源快照路径存在。
- 所有价格和504个数值规格均有canonical evidence；所有已知来源发布日期不晚于2026-10-28。
- complete条目至少3张内容不同且文件哈希不同的实拍，0条以展示图凑实拍。

## 目录明细

| 车型/配置 | 状态 | 标称极速 km/h | 价格覆盖 | 图库 |
|---|---|---:|---|---|
| A2 60 | on_sale | 38 | 待补核 | 4张 / partial |
| A2 60《蛋仔派对》联名款 | on_sale | 45 | 待补核 | 3张 / partial |
| C80c | on_sale | 47 | 待补核 | 4张 / partial |
| C85c | on_sale | 52 | 待补核 | 4张 / partial |
| E125 MK2 | on_sale | 70 | 待补核 | 4张 / partial |
| E150 MK2 | on_sale | 100 | 待补核 | 4张 / partial |
| E300P MK2 | on_sale | 135 | 待补核 | 1张 / partial |
| E80c MK2 | on_sale | 60 | 待补核 | 4张 / partial |
| E95c MK2 | on_sale | 55 | 待补核 | 3张 / partial |
| M1 100 | on_sale | 60 | 待补核 | 4张 / partial |
| M1 100 闪骑 | on_sale | 75 | 待补核 | 2张 / partial |
| M1 85 | on_sale | 55 | 待补核 | 3张 / partial |
| M3 100 | on_sale | 70 | 历史标准发布价 | 4张 / partial |
| M3 100 闪骑 | on_sale | 90 | 待补核 | 3张 / partial |
| M3 85 闪骑 | on_sale | 85 | 待补核 | 2张 / partial |
| M3 85c | on_sale | 52 | 待补核 | 4张 / partial |
| M3 85c MAX 闪骑 | on_sale | 70 | 待补核 | 3张 / partial |
| M3 95 | on_sale | 65 | 历史标准发布价 | 4张 / partial |
| M3 95c | on_sale | 55 | 待补核 | 4张 / partial |
| M3 95c MAX | on_sale | 65 | 待补核 | 3张 / partial |
| M3 95c MAX 闪骑 | on_sale | 70 | 待补核 | 3张 / partial |
| M3 95c MAX公孙离款 | on_sale | 65 | 待补核 | 1张 / partial |
| M3 95c MAX裴擒虎款 | on_sale | 65 | 待补核 | 1张 / partial |
| M5 100 | on_sale | 68 | 待补核 | 4张 / partial |
| M5 125（单电版） | on_sale | 68 | 待补核 | 4张 / partial |
| M5 125（双电版） | on_sale | 70 | 待补核 | 4张 / partial |
| M5 200 | on_sale | 110 | 待补核 | 2张 / partial |
| M85C | on_sale | — | 待补核 | 0张 / missing |
| M85c+ | on_sale | 52 | 待补核 | 4张 / partial |
| M85c+ MK2 | on_sale | 52 | 待补核 | 4张 / partial |
| M90 | on_sale | 52 | 待补核 | 4张 / partial |
| M95C | on_sale | — | 待补核 | 6张 / complete |
| M95c+ | on_sale | 55 | 待补核 | 4张 / partial |
| M95c+ MK2 | on_sale | 55 | 待补核 | 4张 / partial |
| N1 70 | on_sale | 47 | 待补核 | 3张 / partial |
| N1 85 | on_sale | 55 | 待补核 | 3张 / partial |
| N1 85 无畏契约联名款 | on_sale | 55 | 待补核 | 1张 / partial |
| N1 90 | on_sale | 60 | 待补核 | 4张 / partial |
| N3 70 2026 | on_sale | 47 | 待补核 | 4张 / partial |
| N3 70c | on_sale | 47 | 待补核 | 4张 / partial |
| N3 85 2026 | on_sale | 52 | 待补核 | 4张 / partial |
| N3 85c | on_sale | 52 | 待补核 | 4张 / partial |
| N70c | on_sale | 47 | 待补核 | 4张 / partial |
| N85c | on_sale | 51 | 待补核 | 3张 / partial |
| Q3 70 | on_sale | 45 | 待补核 | 4张 / partial |
| Q3 80c | on_sale | 45 | 待补核 | 4张 / partial |
| Q3 85c | on_sale | 52 | 待补核 | 4张 / partial |
| Q3 85c 《蛋仔派对》联名款 | on_sale | 52 | 待补核 | 1张 / partial |
| Q3泡泡玛特小甜豆联名款 | on_sale | 45 | 待补核 | 2张 / partial |
| Q5 80c | on_sale | 47 | 待补核 | 4张 / partial |
| Q5 85c | on_sale | 52 | 待补核 | 4张 / partial |
| Q5 95c | on_sale | 55 | 待补核 | 4张 / partial |
| Q70c | on_sale | 45 | 待补核 | 4张 / partial |
| Q80c | on_sale | 38 | 待补核 | 4张 / partial |
| Q80c 蛋仔派对联名版 | on_sale | 45 | 历史标准发布价 | 3张 / partial |
| Q85c | on_sale | 52 | 待补核 | 4张 / partial |
| Q85c 蛋仔派对联名版 | on_sale | 52 | 历史标准发布价 | 3张 / partial |
| QL 85 家庭版 | on_sale | 52 | 待补核 | 3张 / partial |
| QL 90 家庭版 | on_sale | 52 | 待补核 | 4张 / partial |
| V70 | on_sale | 45 | 待补核 | 3张 / partial |
| E100 | unconfirmed | — | 待补核 | 0张 / missing |
| E110L | unconfirmed | — | 待补核 | 0张 / missing |
| E125 | unconfirmed | — | 待补核 | 5张 / complete |
| E200P | unconfirmed | — | 待补核 | 0张 / missing |
| E200P MK2 | unconfirmed | 100 | 待补核 | 2张 / partial |
| E300P | unconfirmed | — | 待补核 | 0张 / missing |
| E70C | unconfirmed | — | 待补核 | 0张 / missing |
| E80 | unconfirmed | — | 待补核 | 0张 / missing |
| E80C | unconfirmed | — | 待补核 | 0张 / missing |
| E90 | unconfirmed | — | 待补核 | 0张 / missing |
| M5 P 千万台纪念版 | unconfirmed | 120 | 待补核 | 1张 / partial |
| M80C | unconfirmed | — | 待补核 | 0张 / missing |
| M80c+ | unconfirmed | 47 | 待补核 | 4张 / partial |
| N100 | unconfirmed | — | 待补核 | 0张 / missing |
| N3 80c | unconfirmed | 47 | 待补核 | 4张 / partial |
| N80C | unconfirmed | — | 待补核 | 0张 / missing |
| N90 | unconfirmed | — | 待补核 | 0张 / missing |
| Q3 85c LINE FRIENDS联名款 | unconfirmed | 52 | 待补核 | 1张 / partial |
| V30C | unconfirmed | — | 待补核 | 0张 / missing |
