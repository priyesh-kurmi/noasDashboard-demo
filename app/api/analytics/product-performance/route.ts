// DEMO MODE
import { NextResponse } from "next/server";
export async function GET() {
  const topProducts = [
    {rank:1,name:"Flat White",revenue:18432.5,quantity:1843,avgPrice:10.0,category:"Hot Drinks"},
    {rank:2,name:"Cappuccino",revenue:14210.0,quantity:1421,avgPrice:10.0,category:"Hot Drinks"},
    {rank:3,name:"Croissant",revenue:9840.0,quantity:1640,avgPrice:6.0,category:"Bakery"},
    {rank:4,name:"Avocado Toast",revenue:8925.0,quantity:595,avgPrice:15.0,category:"Food"},
    {rank:5,name:"Iced Latte",revenue:7480.0,quantity:935,avgPrice:8.0,category:"Cold Drinks"},
  ];
  const bottomProducts = [
    {rank:1,name:"Sparkling Water",revenue:420.0,quantity:210,avgPrice:2.0,category:"Cold Drinks"},
    {rank:2,name:"Plain Bagel",revenue:540.0,quantity:180,avgPrice:3.0,category:"Bakery"},
  ];
  const categorySplit = [
    {category:"Hot Drinks",revenue:58430.25,percentage:40.9},
    {category:"Cold Drinks",revenue:34210.0,percentage:24.0},
    {category:"Food",revenue:28640.5,percentage:20.1},
    {category:"Bakery",revenue:21441.0,percentage:15.0},
  ];
  return NextResponse.json({
    topProducts, bottomProducts, categorySplit,
    categorySplitFoodDrinks:{Food:28640.5,Drinks:92640.25,Other:21441.0,FoodPct:20.1,DrinksPct:64.9,OtherPct:15.0},
    totalProducts:24, hasProductData:true,
    availableStores:["Noas Cafe Manchester","Noas Cafe Leeds","Noas Cafe Birmingham"],
    byStore:[
      {storeName:"Noas Cafe Manchester",topProducts:topProducts.slice(0,3),bottomProducts:bottomProducts,totalProducts:12,totalRevenue:54231.5,othersRevenue:4320.5,othersCount:7,othersQuantity:432},
      {storeName:"Noas Cafe Leeds",topProducts:topProducts.slice(1,4),bottomProducts:bottomProducts,totalProducts:11,totalRevenue:48670.25,othersRevenue:3890.25,othersCount:6,othersQuantity:389},
      {storeName:"Noas Cafe Birmingham",topProducts:topProducts.slice(2,5),bottomProducts:bottomProducts,totalProducts:10,totalRevenue:39820.0,othersRevenue:3180.0,othersCount:5,othersQuantity:318},
    ],
  });
}
