"use client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { InvoiceComponent } from "./invoice-component"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"


const InvoicePage = ({ params } : { params : { id : string }}) => {

    const [invoiceData, setInvoiceData] = useState() 
    const [userCredit, setUserCredit] = useState()
    const [userPanels, setUserPanels] = useState()

    useEffect(() => {
        fetchInvoice()
        fetchUserCredit()
    }, [])

    const fetchInvoice = async () => {
        const res = await fetch(`/api/invoice/${params.id}`)
        const data = await res.json()
        if (res.ok) {
            setInvoiceData(data)
        }
        else {
            // console.log(data)
        }
    }

    const fetchUserCredit = async () => {
        const res = await fetch('/api/profile')
        const data = await res.json()
        if (res.ok) {
            setUserCredit(data.user.userCredit)
            // // console.log(data)
            setUserPanels(data.user.panelMember)
        }
    }

    if (!invoiceData) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-black mx-auto mb-4" />
            <p className="text-white text-lg">در حال دریافت اطلاعات صورت حساب...</p>
            </div>
        </div>
        )
    }


    return (
        <>
            <Header />
            {
                invoiceData && 
                <InvoiceComponent
                    invoice={invoiceData}
                    userCredit={userCredit}
                    userPanels={userPanels}
                    onPayment={() => null }
                />
            }
            

            <Footer />
        
        </>
    )
}

export default InvoicePage