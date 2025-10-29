import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import HotelDetails from "@/components/hotels/hotel-details";


export default function Page({ params }: { params : { hotelId : string}}) {

    return (
        <>
            <Header />
                <HotelDetails hotelId={params.hotelId} />
            <Footer/>
        </>
    )

}