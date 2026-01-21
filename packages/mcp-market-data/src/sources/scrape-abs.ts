
function buildURL(
  postcode: string,
){
    return `https://www.abs.gov.au/census/find-census-data/quickstats/2021/POA${postcode}`
}

export async function scrapeABSWithScrapeDo(
  postcode: string,
){
    try{
        const url = buildURL(postcode);
        
    }catch(error){

    }
}