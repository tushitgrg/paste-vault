'use client'


import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Dialog, DialogContent,  DialogDescription } from "./ui/dialog"
import { Copy, Trash2Icon } from "lucide-react"
import { ScrollArea } from './ui/scroll-area'
import { toast } from '../hooks/use-toast'
import { invoke } from "@tauri-apps/api/core";
// Sample data for pastes
export const DialogText = ({isModalOpen, setIsModalOpen,selectedPaste}:{isModalOpen:boolean, setIsModalOpen:React.Dispatch<React.SetStateAction<boolean>>,selectedPaste:String})=>{
    const handleCopy = (text: String) => {

        navigator.clipboard.writeText(text.toString())
        toast({title:"Copied"})
      }
    return ( <Dialog open={isModalOpen} onOpenChange={(open)=> setIsModalOpen(open)} >
        <DialogContent className='bg-white'>
      
          <DialogDescription>
          <ScrollArea className="h-[200px] w-[350px] ">
            <pre className="mt-2 whitespace-pre-wrap break-words">
              {selectedPaste}
            </pre>
            </ScrollArea>
          </DialogDescription>
          <Button 
            onClick={() => handleCopy(selectedPaste)}
            className="mt-4 bg-slate-900 text-white hover:text-black"
          >
            Copy to Clipboard
          </Button>
         
        </DialogContent>
      </Dialog>)
  }

export default function CardText({content, openModal}:{content:{content:String, id:number}, openModal:(paste: String) => void}) {
 

  const handleCopy = (text: String) => {

    navigator.clipboard.writeText(text.toString())
  }
   




  return (
   
      <div onClick={() => openModal(content.content)} className='w-60'>
          <Card key={content.id} className="cursor-pointer text-gray-600 hover:shadow-lg transition-shadow w-full h-full"   >
            <CardContent className="p-4">
              <div className="flex justify-end items-end mb-2">
               
                <Button
                  variant="ghost"
                  className='hover:bg-slate-900 hover:text-white'
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCopy(content.content)
                  }}
                  aria-label="Copy to clipboard"
                >
                  <Copy className="h-4 w-4 " />
                </Button>
                <Button
                  variant="ghost"
                  className='hover:bg-slate-900 hover:text-white'
                  size="icon"
                  onClick={async (e) => {
                e.preventDefault()
                console.log("saassasasasa")
                if(content.id){
                    console.log(content.id)
                    await invoke('delete_clipboard_entry', {id:content.id} );
                }
                
                  }}
                  aria-label="Delete"
                >
                 <Trash2Icon/>
                </Button>
              </div>
              <p 
                className="text-sm text-gray-600 line-clamp-2" 
              
              >
                {content.content}
              </p>
            </CardContent>
          </Card>
     
   

     
    </div>
  )
}