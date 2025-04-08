import { Dimensions } from 'react-native'
const { height, width } = Dimensions.get('window');


const COLORS = {
    primary: '#918AFF',
    secondary: '#E0DAFF',
    dark: '#000000',
    white: "#FFFFFF",
    gray: '#888888',
    lightGray: '#868E96',
    rating: '#F09942',
    blog: '#4B4B4B',
};

// small: width * 0.02,
// medium: width * 0.05,
// large: width * 0.08,
// xLarge: width * 0.1,

const SIZES = {
    xSmall: width * 0.03,
    small: width * 0.04,
    medium: width * 0.05,
    large: width * 0.08,
    xLarge: width * 0.1,
    xxLarge: 28,
    huge: 44,
    height,
    width,
    blogContent : width * 0.06,
};

const TEXT = {
    tiny: 8,
    xxSmall: 10,
    xSmall: 12,
    small: 14,
    medium: 16,
    large: 24,
    xLarge: 28,
    xxLarge: 32,
    huge: 40,

};

const SPACES = {
    xsmall: 4,
    medium: height / 140,
    large: height / 100,
    xLarge: height / 60,
    xxLarge: height / 40,
};

const SHADOWS = {
    small: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 2,
    },
    medium: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 5.84,
        elevation: 5,
    },
};


export { COLORS, SIZES, SHADOWS, TEXT, SPACES };