(function () {
    const messages = {
        pl: {
            arraySize: "Podaj od {min} do {max} liczb.",
            invalidNumber: "Niepoprawna liczba: \"{value}\" (użyj kropki jako separatora dziesiętnego).",
            outOfRange: "Wartość {value} poza zakresem {min}–{max}.",
            invalidSearchTarget: "Wpisz poprawną wartość do wyszukania.",
            searchTarget: "Wyszukiwany element: {value}.",
            notFound: "Nie znaleziono elementu {value}.",
            found: "Znaleziono element {value} na pozycji {position}.",
            lowerBound: "Dolna granica wartości {value}: pierwszy element ≥ {value} jest na pozycji {position}.",
            lowerBoundEnd: "Dolna granica wartości {value}: wszystkie elementy są mniejsze, wynik to pozycja {position} (za końcem tablicy).",
            upperBound: "Górna granica wartości {value}: pierwszy element > {value} jest na pozycji {position}.",
            upperBoundEnd: "Górna granica wartości {value}: wszystkie elementy są ≤ {value}, wynik to pozycja {position} (za końcem tablicy).",
            current: "Sprawdzany",
            pivot: "Pivot",
            currentMin: "Aktualne min",
            currentMax: "Aktualne max",
            left: "Lewo",
            blockStart: "Początek bloku",
            jump: "Skok",
            bound: "Granica",
            mid1: "Środek 1",
            mid2: "Środek 2",
            jumpStep: "Rozmiar skoku: {value}.",
            middle: "Środek",
            right: "Prawo",
            minCandidates: "Kandydaci min",
            maxCandidates: "Kandydaci max",
            exportSlides: "Eksportuj slajdy PDF",
            exportSlidesInProgress: "Generowanie PDF…",
            slidesUnavailable: "Nie można wyeksportować slajdów, ponieważ symulacja nie zawiera kroków.",
            slidesExportFailed: "Nie udało się przygotować slajdów do eksportu.",
            slideNumber: "Krok {current} z {total}"
        },
        en: {
            arraySize: "Enter between {min} and {max} numbers.",
            invalidNumber: "Invalid number: \"{value}\" (use a period as the decimal separator).",
            outOfRange: "Value {value} is outside the range {min}–{max}.",
            invalidSearchTarget: "Enter a valid value to search for.",
            searchTarget: "Searching for: {value}.",
            notFound: "Element {value} was not found.",
            found: "Element {value} was found at position {position}.",
            lowerBound: "Lower bound of {value}: the first element ≥ {value} is at position {position}.",
            lowerBoundEnd: "Lower bound of {value}: all elements are smaller, the result is position {position} (past the end of the array).",
            upperBound: "Upper bound of {value}: the first element > {value} is at position {position}.",
            upperBoundEnd: "Upper bound of {value}: all elements are ≤ {value}, the result is position {position} (past the end of the array).",
            current: "Current",
            pivot: "Pivot",
            currentMin: "Current min",
            currentMax: "Current max",
            left: "Left",
            blockStart: "Block start",
            jump: "Jump",
            bound: "Bound",
            mid1: "Middle 1",
            mid2: "Middle 2",
            jumpStep: "Jump size: {value}.",
            middle: "Middle",
            right: "Right",
            minCandidates: "Min candidates",
            maxCandidates: "Max candidates",
            exportSlides: "Export PDF slides",
            exportSlidesInProgress: "Generating PDF…",
            slidesUnavailable: "Slides cannot be exported because this simulation has no steps.",
            slidesExportFailed: "The slides could not be prepared for export.",
            slideNumber: "Step {current} of {total}"
        }
    };

    window.visul2Translate = function (key, values) {
        const locale = document.documentElement.lang;
        const dictionary = messages[locale];
        if (!dictionary || !Object.prototype.hasOwnProperty.call(dictionary, key)) {
            throw new Error("Missing simulation translation: " + locale + "." + key);
        }

        return dictionary[key].replace(/\{(\w+)\}/g, function (match, name) {
            if (!values || !Object.prototype.hasOwnProperty.call(values, name)) {
                throw new Error("Missing value for simulation translation: " + key + "." + name);
            }
            return values[name];
        });
    };
})();
