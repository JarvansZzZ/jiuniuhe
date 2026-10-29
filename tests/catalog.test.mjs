import test from 'node:test';
import assert from 'node:assert/strict';
import { inBudget, compareNumeric, recommendModels, formatSpec } from '../src/data.js';

const row=(id,price,extra={})=>({id,price,saleStatus:'on_sale',vehicleClass:'motorcycle',specs:{abs:'unknown'},...extra});

test('官网车速下限的加号保留在展示中，不把它变成精确上限',()=>{
 assert.equal(formatSpec({specs:{topSpeedKmh:110},evidence:{topSpeedKmh:{quote:'最高车速：110km/h+'}}},'topSpeedKmh','km/h'),'110+ km/h');
 assert.equal(formatSpec({specs:{topSpeedKmh:110},evidence:{topSpeedKmh:{quote:'最高车速：110+km/h'}}},'topSpeedKmh','km/h'),'110+ km/h');
 assert.equal(formatSpec({specs:{topSpeedKmh:80},evidence:{topSpeedKmh:{quote:'最高车速：>80km/h'}}},'topSpeedKmh','km/h'),'>80 km/h');
 assert.equal(formatSpec({specs:{topSpeedKmh:80},evidence:{topSpeedKmh:{quote:'最高车速：≥80km/h'}}},'topSpeedKmh','km/h'),'≥80 km/h');
 assert.equal(formatSpec({specs:{topSpeedKmh:80},evidence:{topSpeedKmh:{quote:'最高车速：80km/h'}}},'topSpeedKmh','km/h'),'80 km/h');
 assert.equal(formatSpec({specs:{topSpeedKmh:null}},'topSpeedKmh','km/h'),'未公开');
});

test('预算边界覆盖低价到高价，未知价格不会进入已知预算',()=>{
 const cases=[
  [2999,'under-5000'],[4999,'under-5000'],[4999.99,'under-5000'],[5000,'5000-7999'],[7999,'5000-7999'],
  [8000,'8000-11999'],[11999,'8000-11999'],[12000,'12000-19999'],[19999,'12000-19999'],[20000,'20000-up'],[70000,'20000-up']
 ];
 const bins=['under-5000','5000-7999','8000-11999','12000-19999','20000-up'];
 for(const [price,expected] of cases)assert.deepEqual(bins.filter(id=>inBudget({price},id)),[expected]);
 for(const bin of bins)assert.equal(inBudget({price:null},bin),false);
 assert.equal(inBudget({price:null},'all'),true);
 assert.equal(inBudget({price:null},'unknown'),true);
 assert.equal(inBudget({price:2999},'unknown'),false);
});

test('升序和降序都将未知数值放到最后',()=>{
 const rows=[row('unknown',null),row('low',3000),row('high',24000)];
 assert.deepEqual([...rows].sort((a,b)=>compareNumeric(a,b,x=>x.price)).map(x=>x.id),['low','high','unknown']);
 assert.deepEqual([...rows].sort((a,b)=>compareNumeric(a,b,x=>x.price,-1)).map(x=>x.id),['high','low','unknown']);
});

test('选车问答先执行预算、类别和销售状态，再按公开指标排序',()=>{
 const rows=[
  row('eligible',6500,{specs:{abs:'single'}}),row('over-budget',25000,{specs:{abs:'dual'}}),
  row('unknown-price',null,{specs:{abs:'dual'}}),row('moped',6000,{vehicleClass:'moped',specs:{abs:'dual'}}),
  row('old',5500,{saleStatus:'discontinued',specs:{abs:'dual'}}),row('uncertain',5500,{saleStatus:'unconfirmed',specs:{abs:'dual'}}),
  row('stock',7000,{saleStatus:'channel_stock',specs:{abs:'dual'}})
 ];
 const ids=rows.map(x=>x.id);
 const result=recommendModels(rows,{budget:'5000-7999',vehicleClass:'motorcycle',priority:'safety'});
 assert.deepEqual(result.map(x=>x.id),['stock','eligible']);
 assert.deepEqual(rows.map(x=>x.id),ids);
 assert.deepEqual(recommendModels(rows,{budget:'20000-up',vehicleClass:'moped',priority:'safety'}),[]);
});
