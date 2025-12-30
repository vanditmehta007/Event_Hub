import React from "react";
import All_events from "./All_events";


export default function Home() {
    return (
        <>
            <div className="flex flex-col min-h-screen text-white">
                <All_events />
            </div>
        </>
    )
}