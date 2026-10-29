"""Normalize the saved ZEEHO CN catalog. All manual overrides cite saved sources."""
import copy
import json
import re
import shutil
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = ROOT / 'research/sources/zeeho'
DATE = '2026-10-28'
index = json.loads((BASE / 'product-index.json').read_text())
assets = json.loads((BASE / 'assets-manifest.json').read_text())
media_assets = json.loads((BASE / 'media-assets-manifest.json').read_text())
sources = []
models = []

def source(id, url, title, snapshot, date=None, kind='media'):
    sources.append(dict(id=id, url=url, title=title, type=kind, publishedAt=date,
                        accessedAt=DATE, snapshotPath='research/sources/zeeho/'+snapshot))
    return id

nav_id = source('zeeho-cn-navigation', 'https://www.zeehoev.com/cn/products-dm/ae.html',
                '极核中国官网：电动摩托车／电动轻便摩托车／新国标电动自行车分类导航',
                'official-ae.html', kind='official_product')
news_id = source('zeeho-launch-2025-ez4-ae7-ae8', 'https://www.ithome.com/0/859/532.htm',
                 '极核发布 EZ4 / AE7 / AE8 S+ MY25 定制版三款电摩产品',
                 'launch-2025-ez4-ae7-ae8.md', '2025-06-09')
ez4_price_id = source('zeeho-ez4-launch-prices', 'https://finance.sina.com.cn/tech/roll/2025-06-10/doc-inezqfeq9097457.shtml',
                      '首发3780元起 极核EZ4电摩上市：最快能跑58km/h', 'ez4-versions-prices.md', '2025-06-10')
ae8_price_id = source('zeeho-ae8-my25-launch', 'https://finance.sina.com.cn/tech/roll/2025-04-26/doc-ineumyrc1281126.shtml',
                      '极速110km/h 极核AE8 S+MY25电动摩托车首发：23180元', 'ae8-my25.html', '2025-04-26')
ae2_mo3_id = source('zeeho-ae2-mo3-media', 'https://news.qq.com/rain/a/20260617A0978U00',
                    'TOP1摩托：AE2 Pro、MO3、MO2i上市与实车解读', 'launch-2026-ae2-mo3.md', '2026-06-17')
ae3_lr_id = source('zeeho-ae3-lr-launch', 'https://news.mydrivers.com/1/1156/1156452.htm',
                   '极核AE3 LR长续航版电摩开售', 'launch-2026-ae3lr.md', '2026-10-10')
ae6_ultra_id = source('zeeho-ae6-ultra-launch', 'https://news.mydrivers.com/1/1156/1156748.htm',
                      '极核AE6 Ultra电动摩托发布：官方指导价20999元', 'launch-2026-ae6ultra.md', '2026-10-12')
ae4_upgrade_id = source('zeeho-ae4-se-upgrade-launch', 'https://www.163.com/dy/article/L99LSEMJ0527D0EQ.html',
                        '车质网：极核AE4 SE+升级版上市 售价0.7199万元', 'ae4-se-upgrade.html', '2026-10-15')
ae3_pro_id = source('zeeho-ae3-pro-launch', 'https://news.qq.com/rain/a/20260507A02WXT00',
                    '极核AE3 Pro电摩发布，提供电摩与电轻摩版本', 'ae3-pro.html', '2026-05-07')
ae4_26_id = source('zeeho-ae4-26-launch', 'https://www.ithome.com/0/940/219.htm',
                   '2026款极核AE4电摩发布，首发权益价5699元起', 'launch-2026-ae4.md', '2026-04-17')
old_ae8_id = source('zeeho-ae8-2022-launch', 'https://www.tmtpost.com/nictation/5990969.html',
                    'ZEEHO极核发布电动摩托车AE8，售价17999元起', 'old-ae8.html', '2022-01-23')
old_ae6_id = source('zeeho-ae6plus-2023-launch', 'https://www.tmtpost.com/6415935.html',
                    'ZEEHO极核电摩AE6+上市', 'old-ae6-plus.html', '2023-02-17')

def clean(s):
    for old, new in [('\\u003c','<'),('\\u003e','>'),('\\r\\n','\n')]: s=s.replace(old,new)
    return re.sub('<[^>]+>', '；', s).strip()

def numeric(s):
    m=re.search(r'(\d+(?:\.\d+)?)', s)
    return float(m.group(1)) if m else None

def integer(value):
    return int(value) if value is not None and int(value)==value else value

groups = {}
for item in index:
    if item['category']=='products-dz' or item['series']=='概念车': continue
    slug=item['pageLink'].split('/')[-1].removesuffix('.html')
    group=item['category']+'-'+slug
    comps=json.loads((BASE/(group+'.components.json')).read_text())
    rows={}
    for c in comps:
        if c['tag']=='productspecificationcomponent':
            for section in json.loads(c['attrs']['specification']):
                for row in section['specification']: rows[row['key'].strip()]=clean(row['value'])
    sid=source('zeeho-'+group, 'https://www.zeehoev.com'+item['pageLink'].replace('/content/zeeho',''),
               '极核中国官网 '+item['title']+(' 电动摩托车' if item['category']=='products-dm' else ' 电动轻便摩托车'),
               group+'.html', kind='official_product')
    groups[group]=(item,rows,sid)

spec_keys=['topSpeedKmh','ratedPowerW','peakPowerW','rangeKm','rangeCondition','rangeType',
           'batteryVoltageV','batteryCapacityAh','batteryCount','batteryEnergyWh','batteryChemistry',
           'batteryRemovable','chargeHours','chargeCondition','curbWeightKg','seatHeightMm',
           'dimensionsMm','wheelbaseMm','tyres','brakes','abs','tcs','storageLitres','unlockModes','warrantyNote']
row_keys={
 'topSpeedKmh':['最高车速','最高车速*','最高速度','最高速度*','最高时速*','最高时速','最高车速(km/h)','最高车速（km/h）'],
 'ratedPowerW':['额定功率','额定输出功率','整机额定功率','功率'],
 'peakPowerW':['峰值功率','峰值功率*','最大输出功率','最大功率','最大峰值功率','最大(峰值)功率','功率'],
 'rangeKm':['GB工况续航*','GB工况续航','GB等速续航*','GB等速发续航*','工况续航*','工况续航','工况法/等速法续航*','工况法/等速法续航','WMTC工况、GB工况*','续航里程','续航','续航*','满把续航*','等速续航'],
 'batteryVoltageV':['电池容量','电池容量 ','电压及容量','电池类型'],
 'batteryCapacityAh':['电池容量','电压及容量','电池类型'],
 'batteryCount':['电池容量','电压及容量','电池类型'],
 'batteryChemistry':['电池容量','电芯类型','电池类型','电压及容量'],
 'curbWeightKg':['整车整备重量','整车整备质量'],
 'seatHeightMm':['座高'], 'wheelbaseMm':['轴距'], 'dimensionsMm':['整车尺寸','尺寸'],
 'tyres':['轮胎规格','轮胎尺寸','轮胎','前轮胎型号'], 'brakes':['制动规格','制动方式'],
 'abs':['ABS','ABS系统','双通道ABS','制动规格','制动方式'], 'tcs':['eTCS','TCS','TCS系统','eTcs牵引力控制系统','制动规格','制动方式'],
 'storageLitres':['座桶容积','座桶空间','座桶容量'], 'unlockModes':['解锁','锁具'],
 'chargeHours':['0-80%充电'], 'chargeCondition':['充电器','充电器功率','充电电流','0-80%充电']}

def raw_for(rows,field):
    return '；'.join(k+'：'+rows[k] for k in row_keys.get(field,[]) if k in rows)

def common_specs(rows):
    s={k:None for k in spec_keys};s.update(abs='unknown',tcs='unknown',rangeType='unknown',unlockModes=[])
    for field in ['topSpeedKmh','ratedPowerW','peakPowerW','curbWeightKg','seatHeightMm','wheelbaseMm','storageLitres']:
        vals=[rows[k] for k in row_keys[field] if k in rows]
        if not vals:continue
        v=vals[0]
        if any(c in v for c in [':','：','|','；']):continue
        n=numeric(v)
        if n is None:continue
        if field in ['ratedPowerW','peakPowerW'] and 'kw' in v.lower():n*=1000
        if field=='storageLitres' and 'L' not in v and '升' not in v:continue
        s[field]=integer(n)
    for key in ['整车尺寸','尺寸']:
        if key in rows:
            nums=re.findall(r'\d+(?:\.\d+)?',rows[key])
            if len(nums)==3:s['dimensionsMm']=[integer(float(x)) for x in nums]
    bat=next((rows[k] for k in ['电池容量','电压及容量','电池类型'] if k in rows),'')
    if not any(c in bat for c in [':','：','|','；']):
        match=re.search(r'(\d+(?:\.\d+)?)\s*V\s*(\d+(?:\.\d+)?)\s*Ah',bat,re.I)
        if match:
            s['batteryVoltageV'],s['batteryCapacityAh']=[integer(float(n)) for n in match.groups()]
            s['batteryCount']=2 if '双' in bat or re.search('[x×]2',bat,re.I) else 1
        if '铅酸' in bat:s['batteryChemistry']='铅酸'
        elif '锂' in bat:s['batteryChemistry']='锂电（具体材料未公开）'
    # A single explicitly named official test method; multi-variant ranges are overridden below.
    for key in row_keys['rangeKm']:
        if key in rows:
            v=rows[key]
            if any(c in v for c in [':','：','|','；']):break
            s['rangeKm']=integer(numeric(v));s['rangeCondition']=key+'：'+v;s['rangeType']='official_claim';break
    tyres=next((rows[k] for k in ['轮胎规格','轮胎尺寸','轮胎'] if k in rows),None)
    if tyres:s['tyres']=tyres
    elif '前轮胎尺寸' in rows and '后轮胎尺寸' in rows:s['tyres']='前'+rows['前轮胎尺寸']+'；后'+rows['后轮胎尺寸']
    elif '前轮胎型号' in rows and '后轮胎型号' in rows:s['tyres']='前'+rows['前轮胎型号']+'；后'+rows['后轮胎型号']
    brakes=next((rows[k] for k in ['制动规格','制动方式'] if k in rows),None)
    if brakes and not re.search(r'AE4|EZ4',brakes):s['brakes']=brakes
    ab=rows.get('ABS',rows.get('双通道ABS',''))
    if ab=='无' or ab=='/':s['abs']='none'
    elif '双通道' in (ab+' '+(s['brakes'] or '')) and not re.search(r'AE4|EZ4',ab):s['abs']='dual'
    tc=rows.get('eTCS',rows.get('TCS',rows.get('TCS系统',rows.get('eTcs牵引力控制系统',''))))
    if tc in ['有','ETCS','✓','√'] or 'TCS' in (s['brakes'] or ''):s['tcs']='standard'
    if '解锁' in rows:s['unlockModes']=[x for x in re.split('[、；,，]',rows['解锁']) if x and '锁' in x]
    else:s['unlockModes']=[k for k in rows if '解锁' in k and rows[k] in ['✓','√']]
    s['chargeCondition']=raw_for(rows,'chargeCondition') or None
    return s

# Overrides are transcribed per configuration from each saved official specification table.
# Tuple: speed, rated W, peak W, range km, condition, voltage, Ah, count, chemistry, ABS, weight.
configs = {
 'products-dm-ae8_s_my25':[
  ('standard','标准版',2025,(110,6000,15000,185,'GB工况；另WMTC工况120km',74,45,2,'锂电（具体材料未公开）','dual',None)),
  ('custom','定制版',2025,(110,6000,15000,185,'GB工况；另WMTC工况120km',74,45,2,'锂电（具体材料未公开）','dual',None))],
 'products-dm-ae8':[('standard',None,2024,(100,5000,12500,120,'官网工况续航；另最大续航190km，不能与工况混用',69,32,2,'锂电（具体材料未公开）','dual',None))],
 'products-dm-ae7':[(x,y,None,(97,3500,9200,100,'GB工况；另WMTC工况105km（官网标注顺序）',74,45,1,'锂电（具体材料未公开）','dual',112)) for x,y in [('standard','标准版'),('pro','Pro')]],
 'products-dm-ae6':[('standard',None,None,(80,2500,5500,65,'工况法；另等速法100km',69,27,1,'锂电软包电芯（ATL）','unknown',96))],
 'products-dm-ae4':[
  ('li-28ah','锂电 74V28Ah',None,(65,1600,3000,80,'工况续航，官网未公开完整测试条件',74,28,1,'锂电（具体材料未公开）','present_unspecified',96)),
  ('se-23ah','SE 铅酸 72V23Ah',None,(65,1600,2400,70,'工况续航，官网未公开完整测试条件',72,23,1,'铅酸','none',120)),
  ('se-32ah','SE 铅酸 72V32Ah',None,(65,1600,3000,95,'工况续航，官网未公开完整测试条件',72,32,1,'铅酸','none',133))],
 'products-dm-ae4-my25':[
  ('standard','标准版',2025,(63,1600,2400,50,'工况续航，官网未公开完整测试条件',72,23,1,'铅酸','none',123)),
  ('pro','Pro',2025,(65,1600,3000,70,'工况续航，官网未公开完整测试条件',72,32,1,'铅酸','none',135)),
  ('max','Max',2025,(70,1600,3500,70,'工况续航，官网未公开完整测试条件',72,32,1,'铅酸','dual',135))],
 'products-dm-ae4-se-':[('standard',None,2026,(80,3500,5620,35,'官网标称续航；完整测试方法未公开',72,23,1,'铅酸','none',133))],
 'products-dm-ae4-my26':[
  ('pro2','Pro2',2026,(65,1800,2700,50,'GB工况',72,23,1,'铅酸','none',125)),
  ('pro2-plus','Pro2+',2026,(70,2200,3000,75,'GB工况',72,32,1,'铅酸','none',141)),
  ('max2','Max2',2026,(75,2700,3500,75,'GB工况',72,32,1,'铅酸','dual',145)),
  ('max2-plus','Max2+',2026,(85,3500,5620,60,'GB工况',72,32,1,'铅酸','dual',148))],
 'products-dm-ae3-pro':[('standard',None,2026,(55,1300,2450,83,'Eco满把；Street满把71km；Sport满把59km',72,23,1,'铅酸','unknown',118))],
 'products-dm-ae2-pro':[('standard',None,2026,(65,1600,3000,75,'官网标称续航；完整测试方法未公开',72,23,1,'铅酸','none',121))],
 'products-dm-ae6-26_':[
  ('ultra','Ultra',2026,(110,9000,17500,204,'GB工况',76,100,1,'锂电（具体材料未公开）','dual',None)),
  ('max','Max',2026,(90,4000,6800,147,'GB工况',72,30,2,'锂电（具体材料未公开）','present_unspecified',None)),
  ('pro','Pro',2026,(86,4000,6800,69,'GB工况',72,32,1,'铅酸','present_unspecified',None))],
 'products-dm-ae3-lr':[('standard',None,2026,(None,1300,2450,160,'GB等速；另Sport档满把不掉速续航116km',72,50,1,'锂电（具体材料未公开）','unknown',None))],
 'products-dm-ae4-se--_':[('standard',None,2026,(80,3500,5620,35,'官网标称续航；完整测试方法未公开',72,23,1,'铅酸','present_unspecified',133))],
 'products-dm-ez3':[('standard','升级款',2026,(52,1300,None,71.7,'等速续航；另Street满把70.3km',72,23,1,'铅酸','unknown',None))],
 'products-dm-ez4':[
  ('standard','标准版',None,(53,1300,2400,63,'GB等速',72,23,1,'铅酸','none',None)),
  ('pro','Pro',None,(56,1600,3500,58,'GB等速',72,23,1,'铅酸','none',None)),
  ('max','Max',None,(56,1600,3500,58,'GB等速',72,23,1,'铅酸','present_unspecified',None)),
  ('max-li','Max Li',None,(58,1600,3500,72,'GB等速',72,30,1,'锂电（具体材料未公开）','present_unspecified',None))],
 'products-dm-mo1':[('standard','72V23Ah 铅酸',None,(52,1300,2100,62,'GB等速',72,23,1,'铅酸','unknown',None))],
 'products-dm-mo3-pro':[('standard',None,2026,(55,1500,None,80,'满把续航；完整测试条件未公开',72,23,1,'铅酸','unknown',108))],
 'products-dqm-ae5i':[
  ('23ah','72V23Ah',None,(47,1100,1700,45,'工况法；另等速法55km',72,23,1,None,'dual',None)),
  ('38ah','72V38Ah',None,(47,1100,1700,72,'工况法；另等速法100km',72,38,1,None,'dual',None))],
 'products-dqm-ae7':[(x,y,None,(50,1200,4000,100,'GB工况；另WMTC工况105km（官网标注顺序）',74,45,1,'锂电（具体材料未公开）','dual',112)) for x,y in [('standard','标准版'),('pro','Pro')]],
 'products-dqm-ae3-pro':[('standard',None,2026,(47,1100,1750,59,'Eco满把；Street满把54km；Sport满把46km',60,20,1,'铅酸','unknown',105))],
 'products-dqm-ez3':[('standard','升级款',2026,(47,1100,None,61,'等速续航；另Street满把57.5km',60,20,1,'铅酸','unknown',None))],
 'products-dqm-ez4':[
  ('standard','标准版',None,(47,800,2000,55,'GB等速',60,23,1,'铅酸','none',None)),
  ('max','Max',None,(47,1200,2400,None,'官网本页写“EZ4 Max 电摩：62km”，类别文字矛盾，续航数值暂不采纳',72,23,1,'铅酸','present_unspecified',None))],
 'products-dqm-mo1':[
  ('lead-20ah','60V20Ah 铅酸',None,(None,1000,None,54,'GB等速（官网表头有“等速发”笔误）',60,20,1,'铅酸','unknown',None)),
  ('li-30ah','48V30Ah 锂电',None,(None,1000,None,74,'GB等速（官网表头有“等速发”笔误）',48,30,1,'锂电（具体材料未公开）','unknown',None))],
 'products-dqm-mo3':[('standard',None,2026,(47,1200,None,75,'满把续航；完整测试条件未公开',60,23,1,'铅酸','unknown',99))]
}

# Price means the reported official list price at launch, never the subsidy/promotion price.
pricing={
 ('products-dm-ae8_s_my25','standard'):(23980,ae8_price_id,'首发价23180元（原价23980元）'),
 ('products-dm-ae8_s_my25','custom'):(24980,news_id,'AE8 S+ MY25 定制版官方指导价24980元，首发权益价24280元'),
 ('products-dm-ae7','standard'):(13599,news_id,'AE7官方指导价13599元起；此处只对应起步标准版，未套给Pro或电轻摩'),
 ('products-dm-ez4','pro'):(5799,ez4_price_id,'EZ4 Pro电摩和EZ4 Max Li电摩，对应官方指导售价5799元和8399元'),
 ('products-dm-ez4','max-li'):(8399,ez4_price_id,'EZ4 Pro电摩和EZ4 Max Li电摩，对应官方指导售价5799元和8399元'),
 ('products-dm-ae2-pro','standard'):(5399,ae2_mo3_id,'AE2 Pro电摩版本官方指导价5399元，首发价格4499元'),
 ('products-dm-mo3-pro','standard'):(5499,ae2_mo3_id,'MO3 Pro电摩版本售价5499元，首发价4499元'),
 ('products-dqm-mo3','standard'):(4599,ae2_mo3_id,'MO3电轻摩版本售价4599元，首发价3699元'),
 ('products-dm-ae3-lr','standard'):(7899,ae3_lr_id,'AE3 LR官方指导价7899元；首发期间立减850元，叠加平台补贴至高250元，到手价6799元起'),
 ('products-dm-ae6-26_','ultra'):(20999,ae6_ultra_id,'AE6 Ultra官方指导价20999元；首发优惠及国家补贴后18999元，早期预约权益17999元'),
 ('products-dm-ae4-se--_','standard'):(7199,ae4_upgrade_id,'官方指导价0.7199万元，首发权益价0.6399万元')
}

def model_id(group,slug):
    if group=='products-dm-ae4-se-':return 'zeeho-dm-ae4-se-plus-'+slug
    if group=='products-dm-ae4-se--_':return 'zeeho-dm-ae4-se-plus-upgrade-'+slug
    return 'zeeho-'+group.replace('products-','').replace('_','-').strip('-')+'-'+slug

# Classify only after visual inspection of the four saved contact sheets.
# White-background product images are supplementary official renders; uncertain CGI stays unclassified.
def gallery(group, sid, model, config_slug):
    group_assets=[a for a in assets if a['group']==group and 'error' not in a]
    exact_photo_indices={
      'products-dm-ae8':set(range(1,7)),
      'products-dm-ae6':set(range(1,6)),
      'products-dm-ae4-se-':set(range(1,8)),
      'products-dm-ae3-pro':set(range(2,5)),
      'products-dqm-ae3-pro':set(range(2,5)),
      'products-dqm-ae5i':set(range(1,6))
    }
    # MY26 gallery's precise trim is not stated; do not infer it from the gallery's presence.
    if group=='products-dm-ae7' and config_slug=='pro':exact_photo_indices[group]={1,2,4,5,6}
    result=[]
    shared=[model_id(group,x[0]) for x in configs[group] if x[0]!=config_slug] if len(configs[group])>1 else []
    for a in group_assets[:7]:
        # Shared old bicycle / pre-upgrade galleries are not suitable display images for these records.
        if group in ['products-dm-mo1','products-dqm-mo1','products-dm-ez3','products-dqm-ez3'] and a['role']!='render':continue
        kind='official_render' if a['role']=='render' else ('photo' if a['index'] in exact_photo_indices.get(group,set()) else 'unclassified')
        if kind=='unclassified':continue
        # A clearly different visible trim is retained in research, not this version's public gallery.
        if a['role']=='render' and ((group=='products-dm-ae4-my26' and config_slug!='max2-plus')
                                  or (group=='products-dm-ae8_s_my25' and config_slug=='custom')
                                  or (group=='products-dm-ae4-my25' and config_slug!='max')
                                  or (group=='products-dm-ae4' and config_slug!='li-28ah')):continue
        if kind=='photo':
            note='官网本车型产品图展；已查看本地联系表，确认为车辆实拍。'
            if group=='products-dqm-ae5i':note+='同一车型的电池容量配置共用外观；照片不证明电池铭牌。'
            if group=='products-dm-ae7':note+='细节图可见AE7 Pro标识，按Pro收录。'
            if group=='products-dm-ae4-my26':note+='画廊车为Max2+外观，未用于无雷达的低配实拍计数。'
            if group in ['products-dm-ae3-pro','products-dqm-ae3-pro']:note+='官网电摩与电轻摩页面共用画廊；共用灯具/仪表/车身细节，电池和电机不可据图判断。'
        elif kind=='official_render':note='官网当前车型导航的产品展示图；作为官方渲染官图，不计实拍数量。'
        else:
            note='该车型官网画廊素材已查看，但实拍属性或具体配置匹配尚不能确认，不计入三张实拍目标。'
            if group in ['products-dm-mo1','products-dqm-mo1']:note+='原始路径位于电自MO1i目录，存在跨类别共用素材风险。'
            if group in ['products-dm-ez3','products-dqm-ez3']:note+='官网当前为升级款，画廊侧板图案与当前渲染不同，待核对年份。'
        caption=('官方产品展示图' if a['role']=='render' else ('实拍展示' if kind=='photo' else '官方画廊素材（待核对）'))
        if a['role']=='render' and group=='products-dm-ae4-my26' and config_slug!='max2-plus':
            caption='Max2+车系官图（当前配置外观待补）'
            note+='该官网产品图为Max2+；当前记录低配的雷达/制动等配置不同，仅作车系外观参考。'
        if a['role']=='render' and group=='products-dm-ae8_s_my25' and config_slug=='custom':
            caption='标准版车系官图（定制版卡钳不同）'
            note+='官网主图为标准版外观，定制版前卡钳为布雷博；不作为定制版实拍。'
        result.append(dict(id=model+'-image-'+str(a['index']),src=a['src'],thumbnail=a['src'],originalUrl=a['originalUrl'],
                           sourcePage=a['sourcePage'],sourceId=sid,caption=caption,
                           angle='detail' if a['role']=='detail' else ('side' if a['role']=='render' else 'other'),kind=kind,
                           matchNote=note,sharedWith=shared if kind!='photo' or group=='products-dqm-ae5i' else []))
    return result

for group, variants in configs.items():
    item,rows,sid=groups[group]
    vehicle_class='motorcycle' if item['category']=='products-dm' else 'moped'
    class_name='电动摩托车' if vehicle_class=='motorcycle' else '电动轻便摩托车'
    for slug,label,year,values in variants:
        ident=model_id(group,slug)
        s=common_specs(rows)
        fields=['topSpeedKmh','ratedPowerW','peakPowerW','rangeKm','rangeCondition','batteryVoltageV','batteryCapacityAh','batteryCount','batteryChemistry','abs','curbWeightKg']
        s.update(dict(zip(fields,values)));s['rangeType']='official_claim' if s['rangeKm'] is not None else 'unknown'
        if group.startswith('products-dm-ae6-26'):
            s['tyres']='前100/80-12；后'+('120/70-12' if slug=='ultra' else '110/70-12')
        if group in ['products-dm-ae4-my25']:
            s['brakes']='前后碟刹+eTCS'+('+双通道ABS' if slug=='max' else '')
            s['tcs']='standard'
        if group=='products-dm-ae8_s_my25':
            s['brakes']='前φ220mm/后φ190mm碟刹；前'+('布雷博浮动双活塞大力矩卡钳' if slug=='custom' else '航特对向四活塞卡钳')+'；后航特浮动单活塞卡钳'
            s['chargeHours']=2.5;s['chargeCondition']='双电0–80%约2.5小时，最大28A/1.9kW'
        if group=='products-dm-ae2-pro':s['tcs']='standard'
        if group in ['products-dm-ae7','products-dqm-ae7']:
            s['chargeCondition']='标配'+('28A（1900W）' if slug=='pro' else '13A（750W）')+'充电器；可选配第二组74V45Ah电池，未计入标准配置容量'
        if group=='products-dm-ae6':s['tcs']='unknown'
        evidence={
          'vehicleClass':dict(sourceIds=[nav_id,sid],quote=item['title']+'位于官网中国站“'+class_name+'”目录',note='按官方中国产品分类，未用车名或极速猜类别'),
          'saleStatus':dict(sourceIds=[nav_id,sid],quote='官网中国车型导航仍列出本车型，产品页保留参数与查找门店入口',note='仅证明在官方目录展示；未实时核验库存，不以页面存在直接推断在售')}
        for field,value in s.items():
            if value is not None and value!=[]:
                quote=raw_for(rows,field)
                if not quote:
                    if field=='rangeCondition' or field=='rangeType':quote=raw_for(rows,'rangeKm')
                    elif field=='tyres':quote='；'.join(k+'：'+v for k,v in rows.items() if '轮胎' in k)
                    elif field=='tcs' and group=='products-dm-ae2-pro':quote='官网产品卖点：TCS牵引力控制系统'
                    else:quote='；'.join(k+'：'+v for k,v in rows.items())
                note='摘自官网本车型参数表，含多版本字段时按本记录配置逐项转录。'
                if field=='batteryCount':note+='双锂电或×2记两组；单一电压容量未标双电的标准配置记一组，不计选装电池。'
                if field=='topSpeedKmh' and group in ['products-dm-ae8_s_my25','products-dm-ae8','products-dm-ae6','products-dm-ae4-se-','products-dm-ae4-se--_'] or (field=='topSpeedKmh' and group=='products-dm-ae6-26_' and slug=='ultra'):
                    note+='官网为“+”或“>”速度，此数值是下限；界面应保留原文加号，不能理解为精确极限速度。'
                evidence[field]=dict(sourceIds=[sid],quote=quote,note=note)
        if group=='products-dm-ae8_s_my25':
            evidence['abs']=dict(sourceIds=[sid],quote='官网功能段“可无感刹停 亦可暴力制动”：双通道阀式ABS100次/秒作动；参数表ABS：✓。',
                                 note='双通道依据功能段明文，未仅由ABS勾选推断；定制版另列前卡钳，其ABS参数仍为同页配置。')
        if group=='products-dm-ae8':
            evidence['abs']=dict(sourceIds=[sid],quote='官网功能段“标配 动态电子TCS”：双通道ABS+动态电子TCS，通过实时传输前后轮速信号，实时介入对后轮转速动态控制。',
                                 note='双通道依据官网功能段明文，参数表前后制动带ABS作为补充。')
        if group=='products-dm-ae6-26_':
            if slug=='ultra':
                evidence['abs']=dict(sourceIds=[sid,ae6_ultra_id],quote='官网功能标题“双通道阀式ABS+TCS”；2026-10-12 Ultra上市报道：前后碟刹制动系统，搭配双通道阀式ABS与TCS牵引力控制系统。',
                                     note='Ultra版本有独立上市报道确认双通道。')
            else:
                evidence['abs']=dict(sourceIds=[sid],quote='AE6 Ultra / AE6 Max / AE6 Pro参数表共用行：制动方式“前后碟刹+ABS+TCS”。',
                                     note='已确认配备ABS；官网通用功能段虽称双通道，存在以Ultra演示的版本限定，未找到Max/Pro独立通道明文，故仅记有ABS、通道待核。')
        if group=='products-dm-ae6':
            evidence['abs']=dict(sourceIds=[sid],quote='制动规格：前单向三活塞CBS；后对置二活塞；CBS系统：带CBS。',
                                 note='只确认CBS，不能仅凭未提ABS判断没有ABS，状态保留unknown。')
        if group=='products-dm-ae2-pro':
            evidence['abs']=dict(sourceIds=[ae2_mo3_id],quote='前后均为双活塞刹车卡钳，标配TCS功能，不过遗憾的是ABS功能缺席了。',
                                 note='ABS=none依据本车媒体实车报道的明确表述，不由碟刹描述反推。')
        if s['abs']=='present_unspecified':
            evidence['abs']['note']+=' 已确认有ABS，通道未核，不等于无ABS。'
        price=None;launch_price=None;price_type='unknown';price_note='本次未核实此准确配置的可比较整车官方公开价；不以系列起售价或补贴价代填。'
        refs=[nav_id,sid]
        if (group,slug) in pricing:
            price,psid,quote=pricing[(group,slug)];launch_price=price;price_type='launch';refs.append(psid)
            price_note='上市时媒体报道的官方指导整车价，配置含上列电池；不是截至采集日的实时成交价。优惠、平台补贴及国补未计入。'
            evidence['price']=dict(sourceIds=[psid],quote=quote,note=price_note)
        notes=['销售状态待核实：官方产品目录不等于各地区即时库存。','不同续航测试方法不可直接当作同一工况排名。']
        if s['topSpeedKmh'] is not None and '下限' in evidence.get('topSpeedKmh',{}).get('note',''):notes.append('官网极速标注为'+('>80km/h' if group=='products-dm-ae6' else str(s['topSpeedKmh'])+'km/h+')+'；结构化数字保存下限。')
        if group in ['products-dm-ae7','products-dqm-ae7']:notes.append('74V45Ah为单电标准配置；双电为选装，不把单电价与双电续航混在一起。')
        if s['abs']=='present_unspecified':notes.append('已确认有ABS；通道数未独立核实，保留present_unspecified，不代表无ABS。')
        if group=='products-dm-ae6':notes.append('官网只明确CBS；ABS是否配备未独立核实，不能把未提及当作没有。')
        if group=='products-dqm-ez4' and slug=='max':notes.append('官网轻摩页续航行写成“EZ4 Max 电摩：62km”，分类文字矛盾，暂不把62km填入轻摩续航。')
        g=gallery(group,sid,ident,slug)
        if group=='products-dm-ae6':aliases=['AE6+']
        elif group=='products-dm-ae8':aliases=['AE8 S+ 2024']
        else:aliases=[]
        status='unconfirmed'
        if group=='products-dm-ae3-lr' or group=='products-dm-ae4-se--_' or (group=='products-dm-ae6-26_' and slug=='ultra'):
            status='on_sale'
            recent={'products-dm-ae3-lr':ae3_lr_id,'products-dm-ae4-se--_':ae4_upgrade_id,'products-dm-ae6-26_':ae6_ultra_id}[group]
            evidence['saleStatus']=dict(sourceIds=[recent,sid],quote='2026年10月正式开售／上市，官网中国站仍列出该车',note='近期正式上市报道与官网现存产品页相互印证；具体地区库存仍需门店确认。')
        highlights=[]
        if s['abs']=='dual':highlights.append('双通道ABS')
        if s['tcs']=='standard':highlights.append('TCS牵引力控制')
        if s['batteryCount']==2:highlights.append('双电池')
        if group in ['products-dm-ae7','products-dqm-ae7'] and slug=='pro':highlights+=['前后毫米波雷达','标配胎压监测','28A充电器']
        if group=='products-dm-ae3-lr':highlights.append('72V50Ah锂电')
        name=item['title']
        models.append(dict(id=ident,brand='zeeho',brandName='极核',series=item['series'].replace('系列',''),name=name,variant=label,modelYear=year,
                           aliases=aliases,vehicleClass=vehicle_class,classificationNote='中国官网归类为'+class_name,
                           saleStatus=status,saleNote=evidence['saleStatus']['note'],market='CN',price=price,priceType=price_type,priceNote=price_note,launchPrice=launch_price,
                           specs=s,highlights=highlights,summary='极核'+name+(' '+label if label else '')+'，'+class_name+'；具体电池、功率与续航条件见参数。',
                           sourceIds=list(dict.fromkeys(refs)),evidence=evidence,gallery=g,imageStatus='complete' if sum(x['kind']=='photo' for x in g)>=3 else ('partial' if g else 'missing'),verifiedAt=DATE,notes=notes))

# Two independently confirmed CN moped configurations are absent from the current header navigation.
for ident,name,price,voltage,capacity,quote in [
 ('zeeho-dqm-ae2-pro-standard','AE2 Pro',4999,60,20,'AE2 Pro电轻摩版本官方指导价4999元，首发价格4199元；电轻摩版本电池规格60V20Ah铅酸'),
 ('zeeho-dqm-mo3-pro-standard','MO3 Pro',4999,60,23,'MO3 Pro电轻摩版本售价4999元，首发价4099元；电轻摩60V23Ah铅酸')]:
    specs={k:None for k in spec_keys};specs.update(batteryVoltageV=voltage,batteryCapacityAh=capacity,batteryCount=1,batteryChemistry='铅酸',abs='unknown',tcs='unknown',rangeType='unknown',unlockModes=[])
    evidence={'vehicleClass':dict(sourceIds=[ae2_mo3_id],quote=quote,note='大陆2026年6月新品发布会报道明确称电轻摩；官网当前导航未列此配置，未借用电摩版全套参数。'),
              'price':dict(sourceIds=[ae2_mo3_id],quote=quote,note='上市官方指导整车价，含对应铅酸电池，非优惠到手价。')}
    for field in ['batteryVoltageV','batteryCapacityAh','batteryCount','batteryChemistry']:evidence[field]=dict(sourceIds=[ae2_mo3_id],quote=quote,note='据报道对应电轻摩电池配置；一组电池。')
    models.append(dict(id=ident,brand='zeeho',brandName='极核',series='AE' if name.startswith('AE') else 'MO',name=name,variant='电轻摩版',modelYear=2026,aliases=[],vehicleClass='moped',
                       classificationNote='新品上市报道明确电轻摩版本',saleStatus='unconfirmed',saleNote='2026年6月已上市，但截至采集日官网导航未列，地区库存未核实。',market='CN',
                       price=price,priceType='launch',priceNote='上市官方指导整车价；不含优惠或补贴。当前成交价待核实。',launchPrice=price,specs=specs,highlights=[],
                       summary='媒体上市报道确认的'+name+'电轻摩配置；未用普通电摩版参数填补。',sourceIds=[ae2_mo3_id],evidence=evidence,gallery=[],imageStatus='missing',verifiedAt=DATE,
                       notes=['官方导航未列出的媒体确认配置，保留记录避免漏款；更多官方资料及准确配置实拍待补。']))

# Media photographs have been inspected separately. Rear-disc and TFT details confirm the MO3 Pro motorcycle pictured.
media_selections={'zeeho-dm-ae2-pro-standard':[2,4,6,7,11,14], 'zeeho-dm-mo3-pro-standard':[16,18,20,22,24,29]}
for m in models:
    if m['id'] not in media_selections:continue
    m['gallery']=[x for x in m['gallery'] if x['kind']=='official_render']
    for i in media_selections[m['id']]:
        a=media_assets[i];shutil.copy2(BASE/'media-assets'/a['file'],ROOT/'public/images/catalog/zeeho'/a['file'])
        src='/images/catalog/zeeho/'+a['file']
        m['gallery'].append(dict(id=m['id']+'-media-'+str(i),src=src,thumbnail=src,originalUrl=a['originalUrl'],sourcePage=a['sourcePage'],sourceId=ae2_mo3_id,
                                caption='TOP1摩托实车展示',angle='detail' if i in [6,7,11,18,20,22,24] else 'other',kind='photo',sharedWith=[],
                                matchNote='已查看媒体实车照片及原文相邻段落；'+('AE2 Pro试驾，车身、12寸轮胎及TFT仪表与官网对应。' if 'ae2' in m['id'] else 'MO3 Pro实车；TFT仪表和后碟刹与普通电摩参数一致，未套用于LCD/后鼓刹基础轻摩。')))
    if ae2_mo3_id not in m['sourceIds']:m['sourceIds'].append(ae2_mo3_id)
    m['imageStatus']='complete'

# Record actual gallery reuse across all versions without self references or nonexistent IDs.
shared_assets={}
for m in models:
    for image in m['gallery']:shared_assets.setdefault(image['src'],set()).add(m['id'])
for m in models:
    for image in m['gallery']:image['sharedWith']=sorted(shared_assets[image['src']]-{m['id']})

exclusions=[dict(name=i['title'],reason='中国官网明确归类“新国标电动自行车”，排除电摩库。',sourceIds=[nav_id]) for i in index if i['category']=='products-dz']
exclusions += [dict(name=i['title'],reason='中国官网明确归类“概念车”，不是本次国内可购买量产车型。',sourceIds=[nav_id]) for i in index if i['series']=='概念车']
candidates=[
 dict(name='AE8（2022首发标准版）',series='AE',possibleClass='motorcycle',status='unconfirmed',reason='2022年大陆上市记录明确，但当前官网只列MY24/MY25 S+，未核实截至2026-10-28是否仍有授权渠道库存。',sourceIds=[old_ae8_id],notes=['首发报道指导价18999元，未套用于MY24/MY25。']),
 dict(name='AE8 S+（2022首发版）',series='AE',possibleClass='motorcycle',status='unconfirmed',reason='2022年大陆上市记录明确，需与MY24/MY25版本区分；当前可购状态未核实。',sourceIds=[old_ae8_id],notes=['首发报道指导价21699元，未套用于新版。'])]
counts=Counter(m['imageStatus'] for m in models)
data=dict(brand='zeeho',asOf=DATE,researchedAt=DATE,models=models,candidates=candidates,exclusions=exclusions,sources=sources,coverageNotes=[
 '覆盖中国官网导航中的17个普通电摩产品页、7个轻摩产品页，按电池/性能/制动配置拆分；另加入发布报道明确但官网导航未列的AE2 Pro轻摩、MO3 Pro轻摩。',
 '官网不是在售库存清单。保留老款、同名不同年款，除近期可交叉核验的上市车型外，销售状态为unconfirmed，不能据此声称全部44个配置仍在售。',
 '上市官方指导价与补贴/促销到手价严格区分；未核实准确配置价格时保持null。',
 '105张不同官网素材已本地下载并人工查看联系表，另查看44张媒体素材后选用12张实车照片；仅明确匹配的实拍计入三张目标。',
 '部分官网画廊素材实拍属性、年款或配置未核准，保留在研究素材中，未进入车型展示图库。MO1跨电自目录、EZ3升级前图库及已知顶配/低配不匹配官图已排除。',
 '每配置3–6张真实实拍尚未全部达成；图片缺口保留，不以渲染、同图裁剪、AI图或其他车型填补。',
 '型号分类依据中国官网目录与大陆上市报道；“Pro”“i”后缀不能单独作为电摩/电自判断依据。',
 '车型参数以官网逐配置表为准。极速100+/110+等结构化数字为下限，原文及+号保留在证据和备注。'])
(ROOT/'data/catalog').mkdir(parents=True,exist_ok=True)
(ROOT/'data/catalog/zeeho.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
report=['# 极核 V2 采集记录','',f'范围：截至 {DATE}，中国大陆；排除电动自行车与概念车。','',
        f'已整理 {len(models)} 个配置记录，涉及 {len(groups)} 个官网产品页，加 2 个媒体确认轻摩配置。精确配置价格已核实 {sum(m["price"] is not None for m in models)} 条。',
        f'图库：三张实拍目标已达 {counts["complete"]} 条；partial {counts["partial"]} 条；missing {counts["missing"]} 条。','',
        '## 核验方法','',
        '先保存官网中国站导航，按电动摩托车/电动轻便摩托车目录逐页读取嵌入式产品参数表；保留全部原始HTML与解析components JSON。车型、年款、额定/峰值功率、电池容量与制动配置逐项拆分，不用顶配参数覆盖低配。',
        '价格只在准确配置可对应时采纳上市官方指导整车价，并标launch和报道日期。平台券、地区服务费、首发优惠及国补写入证据，不当标准价格。',
        '通过官网画廊或媒体原文取得原始链接，下载为本地WebP供站点加载。全部105张官网素材与44张媒体素材已在contact-sheet/media-contact联系表查看。官网白底官图标official_render；无法确定实拍属性或版本匹配的素材仅留研究目录，不进入车型展示图库。','',
        '## 关键发现与限制','',
        '- 17个电摩页面和7个轻摩页面均已整理；官网另有8个电自、2个概念车，全部列为排除。',
        '- 2026新增AE2 Pro、AE3 Pro、AE3 LR、AE4 Pro2/Max2、AE4 SE+升级版、AE6 Pro/Max/Ultra、MO3等，未局限在万元价位。',
        '- 当前导航缺AE2 Pro轻摩与MO3 Pro轻摩，但2026-06-17发布报道列出其类别、电池与指导价，作为独立记录保留；未借用普通电摩版全套参数。',
        '- 官网仍列出MY24及更早产品，无法单凭页面证明当前有货；本库多数销售状态保留unconfirmed。',
        '- AE7单电标准配置与选配双电严格区分；MY25 AE8定制版制动与标准版分别记录。',
        '- AE6官网老款展示实车尾标AE6+且与2023报道相符，以AE6为官网主名并保留AE6+别名；不是另造一个重复配置。',
        '- EZ4 Max轻摩续航行误写“EZ4 Max 电摩：62km”，保留冲突说明，轻摩rangeKm=null。',
        '- MO1官网画廊文件落在电自目录；EZ3升级款画廊侧板与新版官图不同，均不宣称准确配置实拍。',
        '- AE4 MY26画廊准确配置未核实，均不计入准确配置实拍；AE8 MY25画廊渲染属性不确定，未凑实拍。',
        '- 内容复审补齐AE8 MY24/MY25功能段“双通道ABS”明文。AE6 Ultra以独立上市报道确认双通道；Max/Pro仅确认有ABS，记present_unspecified。AE6老款只明确CBS，ABS记unknown。',
        '- 全部sharedWith依据实际使用同一本地图片的配置重建，无self引用；跨电摩/轻摩共用图片在原官方两页均有，注明只能说明共用外观细节。',
        '- 已知不匹配的MY25 AE8定制版标准官图、AE4低配顶配官图不进入对应版本图库，缺口保留。',
        '- AE2 Pro与MO3 Pro普通电摩各补入6张媒体实车照片，未套给轻摩。',
        '- 2022 AE8/AE8 S+仅列候选，未确认仍可买，未冒充当前在售。','',
        '## 逐配置缺口','', '| 配置 | 类别 | 价格口径 | 实拍 | 状态 |','|---|---|---|---:|---|']
for m in models:
    report.append('| '+m['name']+' '+(m['variant'] or '')+' | '+m['vehicleClass']+' | '+(str(m['price'])+' 上市指导价' if m['price'] else '待核实')+' | '+str(sum(x['kind']=='photo' for x in m['gallery']))+' | '+m['imageStatus']+' |')
report+=['','## 后续优先级','',
         '1. 逐配置核实官方商店即时在售/停产与完整电池整车价格，先解决当前未核实的销售状态。',
         '2. 补AE2 Pro轻摩、MO3 Pro轻摩、AE3 LR、AE6 26款与AE4 SE+升级版准确实车；对雷达、卡钳、轮胎有差别的版本分别取图。',
         '3. 核实MO1共享电自图库与EZ3升级款图库，未核准前不进入展示图库。',
         '4. 图片来源为厂商/媒体，保留原始URL和出处；项目代码许可不自动覆盖原厂图片。','']
(ROOT/'research/reports').mkdir(parents=True,exist_ok=True)
(ROOT/'research/reports/zeeho.md').write_text('\n'.join(report))
print(json.dumps(dict(models=len(models),prices=sum(m['price'] is not None for m in models),images=dict(counts),sources=len(sources)),ensure_ascii=False))
