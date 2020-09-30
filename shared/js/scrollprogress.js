export default class scrollProgress {

    constructor(element) {

        this.elements = document.querySelectorAll(element);

    }

    getTriggers() {

        var triggers = []
        console.log(this.elements)
        this.elements.forEach( (trigger, id) => {

            var obj = {}

            obj.id = id

            obj.trigger = window.pageYOffset + trigger.getBoundingClientRect().top;

            triggers.push(obj)

        });

        var buffer = triggers[0].trigger

        console.log(buffer)

        triggers.shift()

        var final = {}

        final.id = triggers.length + 1

        final.trigger = document.body.scrollHeight

        triggers.push(final)

        triggers.forEach( (target, id) => {

            target.trigger = target.trigger + buffer

        })

        return triggers
    }

}