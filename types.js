class Question {
    constructor(question, answers, correctAnswers, type) {
        this.question = question;
        this.answers = answers;
        this.correctAnswers = correctAnswers;
        this.type = type;
    }

    get question() {
        return this.question;
    }

    get options() {
        return this.answers;
    }

    get correct_answers() {
        return this.correctAnswers;
    }

    get type() {
        return this.type;
    }
}
