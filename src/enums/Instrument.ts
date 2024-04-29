export enum Instrument {
    Lead = 1,
    Bass = 2,
    Drums = 3,
    Vocals = 4
}

export const getInstrumentPrefix = (instrument: Instrument) => {
    switch (instrument) {
        case Instrument.Lead:
            return 'gtr';
        case Instrument.Bass:
            return 'bass';
        case Instrument.Drums:
            return 'drums';
        case Instrument.Vocals:
            return 'vocals';
    }
}

export const getInstrumentFromFestival = (instrument: number) => {
    switch (instrument) {
        case 0:
            return Instrument.Lead;
        case 1:
            return Instrument.Bass;
        case 2:
            return Instrument.Vocals;
        case 3:
            return Instrument.Drums;
    }
}
