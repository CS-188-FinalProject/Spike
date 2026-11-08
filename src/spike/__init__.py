def main():
    """Entry point for the API activity application."""
    from spike.app import run_app

    run_app(debug=True)