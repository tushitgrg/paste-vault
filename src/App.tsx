import { useEffect, useState } from "react";

import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import CardText, { DialogText } from "./components/textcard";
import { Toaster } from "./components/ui/toaster";
import { Button } from "./components/ui/button";


function App() {
  const [allpastes, setallpastes] = useState<any>([]);


  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

    const history:any = await invoke('load_clipboard_history');

  if(allpastes.length!=history.length){
    setallpastes(history)
  
   
  }else{
    for(let i=0; i<allpastes.length; i++){
      if(allpastes[i].content!=history[i].content){
     
        console.log(history)
        setallpastes(history)
        break;
      }
    }
  }

   
  }
  useEffect(()=>{

   const i =  setInterval(greet, 1000)
   return ()=>{
    clearInterval(i)
   }

  },[])

  const [selectedPaste, setSelectedPaste] = useState<String>("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const openModal = (paste:String) => {
    setSelectedPaste(paste)
    setIsModalOpen(true)
  }

  return (

    <>
   
      
   
    <div className="flex p-3 flex-col items-center">

      <div className="flex items-center gap-7">
        <div>
    <h1 className="text-3xl mb-0  chewy">Paste Vault</h1>
    <p className="mt-0">by tushitgarg</p>
    </div>

     <Button onClick={async ()=>{
await invoke("delete_all");
const history:any = await invoke('load_clipboard_history');
setallpastes(history)
     }}>Delete All</Button>
     
</div>

<DialogText selectedPaste={selectedPaste} setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen}/>


{allpastes.length>0?<div className="flex mt-5 flex-wrap gap-5 justify-center ">
     
     {allpastes.map((m:{content:String, id:number} )=>
     <CardText openModal={openModal} content={m} key={Math.random()}/>
     
     
     )}
     
     
     </div>:<div className="mt-5 italic">No Pastes here, Start Copying and keep the application open!</div>  }    



<Toaster />

  <footer className="flex flex-col items-center mt-5" >
      <p className="m-0 text-red-500">Please Keep the Application open to record all the copy pastes</p>
      <p className="m-0 text-red-500"> Clip Vault does not store any data to its servers, Every Piece of your data is securely stored in Your Computer</p>
    </footer>
    </div>
    </>
  );
}

export default App;
