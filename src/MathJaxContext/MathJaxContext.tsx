import React, { createContext, FC, ReactNode, useContext, useRef } from "react"
import type { MathJax2Config, MathJax2Object } from "../MathJax2"
import type { MathJax3Config, MathJax3Object, OptionList } from "../MathJax3"

export type TypesettingFunction = "tex2chtml"
    | "tex2chtmlPromise"
    | "tex2svg"
    | "tex2svgPromise"
    | "tex2mml"
    | "tex2mmlPromise"
    | "mathml2chtml"
    | "mathml2chtmlPromise"
    | "mathml2svg"
    | "mathml2svgPromise"
    | "mathml2mml"
    | "mathml2mmlPromise"
    | "asciimath2chtml"
    | "asciimath2chtmlPromise"
    | "asciimath2svg"
    | "asciimath2svgPromise"
    | "asciimath2mml"
    | "asciimath2mmlPromise"

export interface MathJaxOverrideableProps {
    hideUntilTypeset?: "first" | "every"
    typesettingOptions?: {
        fn: TypesettingFunction
        options?: Omit<OptionList, "display">
    }
    renderMode?: "pre" | "post"
}

export type MathJaxSubscriberProps = ({
    version: 3; promise: Promise<MathJax3Object>
}) & MathJaxOverrideableProps

export const MathJaxBaseContext = createContext<MathJaxSubscriberProps | undefined>(undefined)

interface MathJaxContextStaticProps extends MathJaxOverrideableProps {
    onLoad?: () => void
    onError?: (error: any) => void
    children?: ReactNode
}

export type MathJaxContextProps = ({
    config?: MathJax3Config
    version?: 3
    onStartup?: (mathJax: MathJax3Object) => void
}) & MathJaxContextStaticProps


let v3Promise: Promise<MathJax3Object>

const MathJaxContext: FC<MathJaxContextProps> = ({
    version = 3,
    onError,
    typesettingOptions,
    renderMode = "post",
    hideUntilTypeset,
    children
}) => {
    const previousContext = useContext(MathJaxBaseContext)

    const mjContext = useRef(previousContext)

    function scriptInjector<T>(res: (mathJax: T) => void, rej: (error: any) => void) {
        const mathJax = (window as any).MathJax
        res(mathJax)
    
    }

    if(typeof mjContext.current === "undefined") {
        const baseContext = {
            typesettingOptions,
            renderMode,
            hideUntilTypeset
        }

        v3Promise = new Promise<MathJax3Object>(scriptInjector);


        mjContext.current = {
            ...baseContext,
            ...{ version: 3, promise: v3Promise }
        }
    }

    return <MathJaxBaseContext.Provider value={mjContext.current}>{children}</MathJaxBaseContext.Provider>
}

export default MathJaxContext
