const axios=require("axios")

const Crypto=require("./models/Crypto")

const coinTypes=["bitcoin","ethereum","matic-network"]

async function fetchCryptoData(){
    try{
        const url=`https://api.coingecko.com/api/v3/simple/price?ids=${coinTypes.join(",")}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`;
        
        const response=await axios.get(url)
        const data=response.data

        for(const coin of coinTypes){
            const cryptoData=new Crypto({
                coin,
                price: data[coin].usd,
                marketCap: data[coin].usd_market_cap,
                changefor24hours: data[coin].usd_24h_change,
            })
            await cryptoData.save()
        }

        console.log("data successfully stored")
    
    }catch(error){
        console.log("Error in fetcghing data",error)
    }
}

module.exports=fetchCryptoData