
declare module paper {
    export class AreaText extends paper.TextItem {
        /**
         * The bounds of the text
         */
        public rectangle: paper.Rectangle;

        /**
         * The justification of text paragraphs.
         * String('left', 'right', 'center')
         */
        public justification: string;
    }
}