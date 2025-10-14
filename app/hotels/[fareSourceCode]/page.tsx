import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import HotelDetails from "@/components/hotels/hotel-details";


export default function Page({ params }: { params : { fareSourceCode : string}}) {

    return (
        <>
            <Header />
                <HotelDetails fareSourceCode={params.fareSourceCode} />
            <Footer/>
        </>
    )

}