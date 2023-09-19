import { ethers } from "ethers";
import  readlineSync from "readline-sync"
import {routerABI} from "./ABI's/pancakeRouterABI.js" ;
import {ERC20ABI} from "./ABI's/ERC20ABI.js"  
import {Constants} from "./constants.js"


// Taking input from the user
const tokenAddress  = readlineSync.question('Token Address : ').toString();
const privateKey = readlineSync.question("Private Key : ").toString();
const amountToBuy = readlineSync.question("BNB amount to Buy :").toString();
const noOfBuys = readlineSync.question("No of time to buy : ").toString();



// Iniitializing the provider from JsonRpcProvider and signer from private key
const provider = new ethers.providers.JsonRpcProvider(Constants.bscTestnetURL); 
const signer = new ethers.Wallet(privateKey, provider);


// Initializing the smart contracts
const router = new ethers.Contract(Constants.PANCAKE_ROUTER_ADDRESS, routerABI, signer);
const token  = new ethers.Contract(tokenAddress , ERC20ABI , signer);


// function to execute trade by no of times user enters with the amount he/she entered
const executeTrade = async ()=> {

   const path = [Constants.WBNB , tokenAddress];
    for(let i=1 ; i <= noOfBuys ; i++){
    const  currentTimestamp = Date.now();
    const deadline = currentTimestamp + 10000;
    const tx = await router.swapExactETHForTokens( 0 , path , signer.address , deadline , 
       {  value : ethers.utils.parseEther(amountToBuy) , gasPrice: ethers.utils.parseUnits('6','gwei').toString(),}
    )
    await tx.wait();
    console.log(`Trade ${i} executed Successfully`);
    }

}


// Fuction to first add liquidity on pancakeSwapV2 with the provided token address and BNB assuming pool is not created previously

const addLiquidityAndExecuteTrades = async ()=>{

try{  
   const userTokenBalance  = await token.balanceOf(signer.address);
   const tx = await token.approve(Constants.PANCAKE_ROUTER_ADDRESS , userTokenBalance , {
    gasPrice: ethers.utils.parseUnits('6','gwei').toString(),
  });
   await tx.wait();

   // Adding liquidity on pancakeSwapV2 with this token and BNB
   const  currentTimestamp = Date.now();
   const deadline = currentTimestamp + 10000;

   // Make sure to have 0.01 BNB in you wallet to add liquidity with token on pancakeSwapV2
   const tx1 = await router.addLiquidityETH(tokenAddress  , userTokenBalance , 0 , 0 , signer.address , deadline , {  value : ethers.utils.parseEther("0.0001") , gasPrice: ethers.utils.parseUnits('6','gwei').toString(),});
   await tx1.wait();

   console.log("Liquidity Added on pancakeSwapV2");
   executeTrade();
    

}catch(error){
    console.log(error);
}
}


addLiquidityAndExecuteTrades();




