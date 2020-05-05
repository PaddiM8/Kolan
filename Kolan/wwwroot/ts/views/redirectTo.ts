export class RedirectTo {
    public static Board(id: string): void {
        location.href = `/Board/${id}`;
    }

    public static Boards(): void {
        location.href = "/";
    }

    public static Login(): void {
        location.href = "/";
    }

    public static Logout(): void {
        location.href = "/Logout";
    }
}