import onChange from "on-change";
import { AbstractView } from "../../common/view";
import { Header } from "../../components/header/header";
import { Footer } from "../../components/footer/footer";
import { Search } from "../../components/search/search";
import { CardList } from "../../components/card-list/card-list";

export class MainView extends AbstractView {
    state = {
        list: [],
        numFound: 0,
        loading: false,
        searchQuery: undefined,
        offset: 0
    };

    constructor(appState) {
        super();
        this.appState = appState;
        this.appState = onChange(this.appState, this.appStateHook.bind(this));
        this.state = onChange(this.state, this.stateHook.bind(this));
        this.setTitle("Search for books")
    }

    destroy() {
        onChange.unsubscribe(this.appState);
        onChange.unsubscribe(this.state);
    }

    appStateHook(path) {
        if (path === "favorites") {
            this.render()
        }
    }

    async stateHook(path) {
        if (path === "searchQuery") {
            this.state.loading = true;
            const data = await this.loadList(this.state.searchQuery, this.state.offset)
            this.state.loading = false;
            this.state.numFound = data.numFound;
            this.state.list = data.docs;
            this.render();
        }

        if (path === "list" || path === "loading") {
            this.render();
        }
    }

    async loadList(q, offset) {
        const res = await fetch(`https://openlibrary.org/search.json?q=${q}&offset=${offset}&limit=9`)
        return res.json();
    }

    render() {
        const main = document.createElement("div");
        main.innerHTML = `
            <h1>Books Found - ${this.state.numFound}</h1>
        `
        main.append(new Search(this.state).render())
        main.append(new CardList(this.appState, this.state).render())
        this.app.innerHTML = "";
        this.app.append(main);
        this.renderHeader();
        if (this.state.list.length !== 0) {
            this.renderFooter();
        }
    }

    renderHeader() {
        const header = new Header(this.appState).render();
        this.app.prepend(header);
    }

    renderFooter() {
        const footer = new Footer(this.state).render();
        this.app.append(footer)
    }
}