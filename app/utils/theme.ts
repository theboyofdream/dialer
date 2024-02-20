import { MD3Colors, configureFonts } from "react-native-paper"
import { ThemeProp } from "react-native-paper/lib/typescript/types"

const customFonts = configureFonts({
    config: {
        "displaySmall": {
            "fontFamily": "PoppinsRegular",
            "fontSize": 36,
            "fontWeight": "400",
            "letterSpacing": 0,
            "lineHeight": 44,
        },
        "displayMedium": {
            "fontFamily": "PoppinsRegular",
            "fontSize": 45,
            "fontWeight": "400",
            "letterSpacing": 0,
            "lineHeight": 52,
        },
        "displayLarge": {
            "fontFamily": "PoppinsRegular",
            "fontSize": 57,
            "fontWeight": "400",
            "letterSpacing": 0,
            "lineHeight": 64,
        },

        "headlineSmall": {
            "fontFamily": "PoppinsRegular",
            "fontSize": 24,
            "fontWeight": "400",
            "letterSpacing": 0,
            "lineHeight": 32,
        },
        "headlineMedium": {
            "fontFamily": "PoppinsRegular",
            "fontSize": 28,
            "fontWeight": "400",
            "letterSpacing": 0,
            "lineHeight": 36,
        },
        "headlineLarge": {
            "fontFamily": "PoppinsRegular",
            "fontSize": 32,
            "fontWeight": "400",
            "letterSpacing": 0,
            "lineHeight": 40,
        },

        "titleSmall": {
            "fontFamily": "PoppinsMedium",
            "fontSize": 14,
            "fontWeight": "500",
            "letterSpacing": 0.1,
            "lineHeight": 20,
        },
        "titleMedium": {
            "fontFamily": "PoppinsMedium",
            "fontSize": 16,
            "fontWeight": "500",
            "letterSpacing": 0.15,
            "lineHeight": 24,
        },
        "titleLarge": {
            "fontFamily": "PoppinsRegular",
            "fontSize": 22,
            "fontWeight": "400",
            "letterSpacing": 0,
            "lineHeight": 28,
        },

        "labelSmall": {
            "fontFamily": "PoppinsMedium",
            "fontSize": 11,
            "fontWeight": "500",
            "letterSpacing": 0.5,
            "lineHeight": 16,
        },
        "labelMedium": {
            "fontFamily": "PoppinsMedium",
            "fontSize": 12,
            "fontWeight": "500",
            "letterSpacing": 0.5,
            "lineHeight": 16,
        },
        "labelLarge": {
            "fontFamily": "PoppinsMedium",
            "fontSize": 14,
            "fontWeight": "500",
            "letterSpacing": 0.1,
            "lineHeight": 20,
        },

        "bodySmall": {
            "fontFamily": "PoppinsRegular",
            "fontSize": 12,
            "fontWeight": "400",
            "letterSpacing": 0.4,
            "lineHeight": 16,
        },
        "bodyMedium": {
            "fontFamily": "PoppinsRegular",
            "fontSize": 14,
            "fontWeight": "400",
            "letterSpacing": 0.25,
            "lineHeight": 20,
        },
        "bodyLarge": {
            "fontFamily": "PoppinsRegular",
            "fontSize": 16,
            "fontWeight": "400",
            "letterSpacing": 0.15,
            "lineHeight": 24,
        }
    }
})

const theme: ThemeProp = {
    ...MD3Colors,
    mode: 'exact',
    roundness: 0,
    fonts: customFonts
}

export { theme }