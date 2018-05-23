module.exports = {
    name: 'swupMergeHeadPlugin',
    options: {runScripts: false},
    exec: function(options, swup, getHTMLfromCache) {
        document.addEventListener('swup:contentReplaced', function () {
            let currentHead = document.querySelector('head')
            let newHead = getHTMLfromCache().querySelector('head')
            replaceHeadWithoutReplacingExistingTags(currentHead, newHead)
        })

        let replaceHeadWithoutReplacingExistingTags = (currentHead, newHead) => {
            let oldTags = currentHead.children;
            let newTags = newHead.children;
            let oldTagsToRemove = [];
            let newTagsToRemove = [];

            for (let i = 0; i < oldTags.length; i++) {
                let oldTag = oldTags[i];
                let oldTagIdentifier = oldTag.outerHTML;
                let foundInNewHead = false;
                let newTag;
                for (let j = 0; j < newTags.length; j++) {
                    newTag = newTags[j];
                    let newTagIdentifier = newTag.outerHTML;

                    if (newTagIdentifier === oldTagIdentifier) {
                        foundInNewHead = true;
                        break;
                    }
                }

                if (foundInNewHead) {
                    newTagsToRemove.push(newTag)
                } else {
                    oldTagsToRemove.push(oldTag)
                }

            }

            for (let i = 0; i < newTagsToRemove.length; i++) {
                newHead.removeChild(newTagsToRemove[i])
            }

            for (let i = 0; i < oldTagsToRemove.length; i++) {
                currentHead.removeChild(oldTagsToRemove[i])
            }

            let added = newHead.children.length
            let removed = oldTagsToRemove.length

            let fragment = document.createDocumentFragment()
            for (let i = 0; i < newHead.children.length; i++) {
                fragment.appendChild(newHead.children[i])
            }
            currentHead.appendChild(fragment);

            if (options.runScripts) {
                newHead.querySelectorAll('script').forEach(item => {
                    if (item.tagName == "SCRIPT" && (item.type == null || item.type == "" || item.type == "text/javascript")) {
                        let elem = document.createElement('script')
                        if (item.src != null && item.src != "") {
                            elem.src = item.src
                        } else {
                            let inline = document.createTextNode(item.innerText)
                            elem.appendChild(inline)
                        }
                        if (item.type != null && item.type != "") {
                            elem.type = item.type
                        }
                        currentHead.appendChild(elem)
                    } else {

                    }
                })
            }

            swup.log(`Removed ${removed} / added ${added} tags in head`)
        }
    }
}