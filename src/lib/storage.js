const KEY = 'stockpilot_products_v1'

export function loadProducts(){
  try{
    const raw = localStorage.getItem(KEY)
    if(!raw) return []
    return JSON.parse(raw)
  }catch(e){
    console.error('loadProducts', e)
    return []
  }
}

export function saveProducts(products){
  try{
    localStorage.setItem(KEY, JSON.stringify(products))
  }catch(e){
    console.error('saveProducts', e)
  }
}

export default { loadProducts, saveProducts }
