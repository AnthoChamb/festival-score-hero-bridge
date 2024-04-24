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
