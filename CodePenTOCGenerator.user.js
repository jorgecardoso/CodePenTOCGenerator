// ==UserScript==
// @name         CodePen TOC Generator
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Generates TOC for Markdown posts in CodePen. Look for an additional "TOC" button in the post toolbar. Just click it and then Ctrl-V where you want the TOC to appear.
// @author       jorgecardoso
// @match        https://codepen.io/write/*
// @grant        none
// @updateURL https://openuserjs.org/meta/jorgecardoso/CodePen_TOC_Generator.meta.js
// ==/UserScript==

(function() {
    'use strict';

    var MAX_LEVEL = 3;

    var toolbar = document.querySelector("#write div.editor-toolbar");

    var icon = document.createElement("a");
    icon.setAttribute("title", "Generate TOC");
    icon.setAttribute("class", "toolbar-btn");
    icon.innerHTML="TOC";
    toolbar.appendChild(icon);

    var textarea =document.createElement("textarea");
    textarea.setAttribute("style", "display:none");
    textarea.setAttribute("value", "jorge");
    textarea.setAttribute("id", "jorge");
    document.body.appendChild(textarea);

    var editor = document.querySelector(".CodeMirror").CodeMirror;

    console.log(editor);
    icon.addEventListener("click", function() {
        console.log("TOC clicked");
        var toc = [];

        var isPrevLineHeading = false;
        var lastLineNo = editor.lastLine();
        for (var i = lastLineNo; i >=0; i--) {
            var line = editor.getLine(i);
            //console.log(i, line);

            if (isPrevLineHeading) {
                var tocEntry;
                var newLineText;
                var foundBookmark = line.match(/<a name=(.*)><\/a>/);
                if (foundBookmark) {
                    newLineText =  line.replace(foundBookmark[0], "<a name='" + generateTOCId(editor, i+1)  + "'></a>");
                    editor.replaceRange(newLineText, {line: i, ch: 0}, {line: i, ch: line.length});
                    tocEntry = getTOCEntry(editor, i+1); //getTOCEntry(getHeadingText(editor.getLine(i+1)), tocid, getHeadingLevel(editor.getLine(i+1)));
                } else {
                    newLineText =  "\n<a name='" + generateTOCId(editor, i+1) + "'></a>";
                    editor.replaceRange(newLineText, {line: i, ch: line.length}, {line: i, ch: line.length});
                    tocEntry = getTOCEntry(editor, i+2);
                }

                toc.unshift(tocEntry);

            }

            isPrevLineHeading = isHeadingLine(line);

        }
        textarea.setAttribute("style", "display:original");
        textarea.value=toc.join("\n");
        textarea.select();
        document.execCommand("Copy");
        textarea.setAttribute("style", "display:none");
    });

    function generateTOCId(cmEditor, lineNumber) {
        var text = cmEditor.getLine(lineNumber);
        return "toc-"+text.replace(/([^a-z0-9\s]+)/ig, '').replace(/^\s+/, '').replace(/\s+/g, '-');
    }

    function getTOCEntry(cmEditor, lineNumber) {
        var text = getHeadingText(cmEditor.getLine(lineNumber));
        var tocId = generateTOCId(cmEditor, lineNumber);
        var level = getHeadingLevel(cmEditor.getLine(lineNumber));

        var spaces = "";

        for (var i = 0; i < level; i++) {
            spaces += "\t";
        }
        return spaces + (level > 0? "* ":"1. ") + "[" + text + "](#"+tocId+")";
    }

    function getHeadingText(line) {
        line = line.trim();
        for (var i = 0; i < line.length; i++) {
            if (line.charAt(i) !== '#') {
                return line.substr(i).trim();
            }
        }
        return line.text;
    }
    function getHeadingLevel(line) {
        line = line.trim();
        for (var i = 0; i < line.length; i++) {
            if (line.charAt(i) !== '#') {
                return i-1;
            }
        }
        return -1;
    }

    function isHeadingLine(line) {
        line = line.trim();
        var i;
        for (i=0; i < line.length; i++) {
            if (line.charAt(i) !== '#'){
                break;
            }
        }
        if (i>0 && i<=MAX_LEVEL) {
            return true;
        } else {
            return false;
        }
    }

})();