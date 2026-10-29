# V2 内容数据约定

范围：截至 2026-10-28，中国大陆官方及可核验授权渠道销售的九号／小牛／极核两轮电动摩托车和电动轻便摩托车；排除电动自行车。快照日期之后发布的车型不算当日在售。

品牌各自写 data/catalog/<brand>.json。顶层为 {brand, asOf, researchedAt, models:[], candidates:[], exclusions:[], sources:[], coverageNotes:[]}。

models 用已能确认国内市场身份及机动车大类的车型／配置记录；motorcycle_unspecified 表示官方能排除电自、但普通电摩／电轻摩细分待核。已停售可留但必须标记。证据不足的保留 candidates，不伪称正式库已核实。不能因价格未知或缺图删除型号。

每个车型记录字段：

- id：全局唯一 slug，带品牌前缀；brand：ninebot / niu / zeeho；brandName；series；name：营销车型名；variant：配置名或 null；modelYear：有明确依据才填年份数字，否则 null；aliases：数组。
- vehicleClass：motorcycle / moped / motorcycle_unspecified / unknown。classificationNote：对应证据说明。
- saleStatus：on_sale / channel_stock / preorder / discontinued / unconfirmed。saleNote：证据与日期。
- market：CN。
- price：可靠可比较的官方公开含对应电池整车价（人民币数字）或 null；priceType：official_current / launch / dealer / unknown；priceNote；launchPrice：数字或 null。促销和补贴不得伪装标准价。
- specs：对象，字段可空。topSpeedKmh、ratedPowerW、peakPowerW、rangeKm、rangeCondition、rangeType（official_claim / test / unknown）、batteryVoltageV、batteryCapacityAh、batteryCount、batteryEnergyWh、batteryChemistry、batteryRemovable（true/false/null）、chargeHours、chargeCondition、curbWeightKg、seatHeightMm、dimensionsMm、wheelbaseMm、tyres、brakes、abs（dual / single / present_unspecified / none / unknown；present_unspecified 表示已确认有 ABS，通道数未确认）、tcs（standard / optional / none / unknown）、storageLitres、unlockModes（数组）、warrantyNote。严格分开额定／峰值，不明单位不填；续航保留测试条件。
- highlights：基于证据的中文短标签数组；summary：客观简介，不造主观评分。
- sourceIds：引用顶层 sources 的 id 数组。
- evidence：按 vehicleClass / saleStatus / price / topSpeedKmh 等字段存 {sourceIds:[], quote:'原文或准确摘录', note:'说明'}。只填实际查到的值。
- gallery：数组，元素 {id, src, thumbnail（可与src相同）, originalUrl, sourcePage, sourceId, caption, angle（side/front/rear/detail/other）, kind（photo / official_render / unclassified）, matchNote, sharedWith:[]}。src 为项目内 /images/catalog/... 路径。依据实拍来源及人工查看确认 photo，官方白底/发布产品图不能自动算实拍。同图裁剪不凑数。
- imageStatus：complete / partial / missing。至少3张不同、对应准确的真实实拍才 complete；渲染补充不计实拍数。
- verifiedAt：YYYY-MM-DD；notes：数组。

sources 元素：{id, url, title, type（official_product / official_store / official_news / manual / homologation / authorized_dealer / media / other）, publishedAt（已知日期或null）, accessedAt:'2026-10-28', snapshotPath（有则填相对路径，否则null）}。

candidates 元素：{name, series, possibleClass, status, reason, sourceIds:[], notes:[]}；exclusions：{name, reason, sourceIds:[]}。来源不可靠、海外专供或电自不得混入正式电摩。

实拍目标每个可选版本至少3张，目标3–6张。可确认外观完全相同的版本允许明确标注共用图片；可见配置不同则分别核对。图不足明确记录缺口，不用其他型号、SVG或AI图代替。

数据快照和原页面保存 research/sources/<brand>/，公开采集报告保存 research/reports/<brand>.md。原始页面不随构建发布，网站只使用整理后的结构化数据和图片。
