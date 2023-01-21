import React from 'react'
import { ParallaxBanner } from 'react-scroll-parallax'
import useMediaQuery, { BREAKPOINTS } from '../hooks/useMediaQuery'
import Header from './Header'

export const ParallaxHeader = ({ children }: { children?: React.ReactNode }) => {
    const isSmall = useMediaQuery(BREAKPOINTS.down("sm"))

    return (
        <ParallaxBanner
            style={{ height: "1300px", backgroundColor: "#f4eddf" }}
            layers={[
                {
                    image: "assets/parallax-7.png",
                    expanded: false, translateY: ["0%", "90%"],
                    shouldAlwaysCompleteAnimation: true
                },
                {
                    image: "assets/parallax-6.png",
                    expanded: false, translateY: ["0%", "80%"],
                    shouldAlwaysCompleteAnimation: true
                },
                // {
                //     children: (
                //         <
                //     ),
                //     expanded: false, translateY: ["0%", "80%"],
                //     shouldAlwaysCompleteAnimation: true
                // },
                {
                    image: "assets/parallax-5.png",
                    expanded: false, translateY: ["0%", "70%"],
                    shouldAlwaysCompleteAnimation: true
                },
                {
                    image: "assets/parallax-4.png",
                    expanded: false, translateY: ["0%", "60%"],
                    shouldAlwaysCompleteAnimation: true
                },
                {
                    image: "assets/parallax-3.png",
                    expanded: false, translateY: ["0%", "50%"],
                    shouldAlwaysCompleteAnimation: true
                },
                {
                    image: "assets/parallax-2.png",
                    expanded: false, translateY: ["0%", "40%"],
                    shouldAlwaysCompleteAnimation: true
                },
                {
                    image: "assets/parallax-1.png",
                    expanded: false, translateY: ["0%", "30%"],
                    shouldAlwaysCompleteAnimation: true
                },
                {
                    image: "assets/parallax-0.png",
                },
            ]}
        >
            <div style={{
                marginTop: "5%",
                marginLeft: "auto",
                marginRight: "auto",
                paddingRight: !isSmall ? "250px" : undefined,
                paddingLeft: !isSmall ? "50px" : undefined,
                maxWidth: !isSmall ? "600px" : undefined,
                zIndex: 9999999,
                position: "relative"
            }}>
                <Header />
            </div>
        </ParallaxBanner>
    )
}